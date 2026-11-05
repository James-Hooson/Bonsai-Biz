import { onRequest } from 'firebase-functions/v2/https'
import { defineSecret } from 'firebase-functions/params'
import { getFirestore, FieldValue, type Firestore, type UpdateData, type DocumentData } from 'firebase-admin/firestore'
import Stripe from 'stripe'
import { GMAIL_APP_PASSWORD } from './email'
import { sendOrderEmails, type CompletedOrder } from './orderEmails'
import { quantitiesByProduct, releasePendingOrder } from './orderStock'

const STRIPE_SECRET_KEY = defineSecret('STRIPE_SECRET_KEY')
const STRIPE_WEBHOOK_SECRET = defineSecret('STRIPE_WEBHOOK_SECRET')

// Marks the order paid and, for orders placed before stock reservations, takes
// the stock - all in one transaction, so a failure leaves nothing half-done and
// Stripe's retry can safely start again. Returns the completed order, or null
// if there was nothing to do (already completed, or not actually paid yet).
async function completeOrder(
  stripe: Stripe,
  db: Firestore,
  sessionId: string,
  orderId: string,
): Promise<Record<string, unknown> | null> {
  const orderRef = db.collection('orders').doc(orderId)

  // Re-fetch the full session so shipping_details and payment_status are current
  const session = await stripe.checkout.sessions.retrieve(sessionId)

  // `completed` also fires for delayed payment methods before the money has
  // arrived; those orders are finished by checkout.session.async_payment_succeeded.
  if (session.payment_status === 'unpaid') {
    console.log(`Order ${orderId} checkout completed but payment is still pending`)
    return null
  }

  const updateData: Record<string, unknown> = {
    status: 'completed',
    stripePaymentIntentId: session.payment_intent,
    updatedAt: FieldValue.serverTimestamp(),
  }
  if (session.customer_details?.email) {
    updateData.userEmail = session.customer_details.email
  } else if (session.customer_email) {
    updateData.userEmail = session.customer_email
  }
  if (session.shipping_details?.address) {
    const addr = session.shipping_details.address
    updateData.shippingAddress = {
      name: session.shipping_details.name ?? null,
      line1: addr.line1 ?? null,
      line2: addr.line2 ?? null,
      city: addr.city ?? null,
      state: addr.state ?? null,
      postalCode: addr.postal_code ?? null,
      country: addr.country ?? null,
    }
  }

  // Stripe redelivers webhook events at-least-once. Atomically flip status to
  // 'completed' only once, so a duplicate delivery can't deduct stock or send
  // emails twice for the same order.
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(orderRef)
    const order = snap.data()
    if (order?.status === 'completed') return null

    // Stock was taken at checkout unless the order predates reservations, or
    // its reservation was already released.
    const stockAlreadyTaken = order?.stockReserved === true && order?.status === 'pending'
    const quantities = stockAlreadyTaken
      ? new Map<string, number>()
      : quantitiesByProduct((order?.items ?? []) as Array<{ productId: string; quantity: number }>)
    const productRefs = [...quantities.keys()].map((id) => db.collection('products').doc(id))
    const productSnaps = await Promise.all(productRefs.map((ref) => tx.get(ref)))

    tx.update(orderRef, updateData as UpdateData<DocumentData>)
    productSnaps.forEach((productSnap, i) => {
      if (!productSnap.exists) return
      const currentStock: number = productSnap.data()?.stock ?? 0
      const newStock = Math.max(0, currentStock - quantities.get(productRefs[i].id)!)
      tx.update(productRefs[i], { stock: newStock, inStock: newStock > 0 })
    })
    return { ...order, ...updateData }
  })
}

export const stripeWebhook = onRequest(
  { secrets: [STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, GMAIL_APP_PASSWORD] },
  async (req, res) => {
    const stripe = new Stripe(STRIPE_SECRET_KEY.value())
    const sig = req.headers['stripe-signature'] as string

    // Firebase Functions provides rawBody for signature verification
    const rawBody = req.rawBody

    if (!rawBody) {
      console.error('No raw body available')
      res.status(400).send('No raw body available')
      return
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        sig,
        STRIPE_WEBHOOK_SECRET.value()
      )
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      console.error('Webhook signature verification failed:', message)
      res.status(400).send(`Webhook Error: ${message}`)
      return
    }

    if (
      event.type === 'checkout.session.completed' ||
      event.type === 'checkout.session.async_payment_succeeded'
    ) {
      const sessionStub = event.data.object as Stripe.Checkout.Session
      const orderId = sessionStub.metadata?.orderId

      if (orderId) {
        let completedOrder: Record<string, unknown> | null
        try {
          completedOrder = await completeOrder(stripe, getFirestore(), sessionStub.id, orderId)
        } catch (error) {
          // A non-2xx response makes Stripe retry the event later, so a paid
          // order isn't left stuck as pending.
          console.error(`Failed to update order ${orderId}:`, error)
          res.status(500).json({ error: 'Failed to update order' })
          return
        }

        if (completedOrder) {
          console.log(`Order ${orderId} marked as completed`)
          const deliveryMethod = completedOrder.deliveryMethod === 'delivery' ? 'delivery' : 'pickup'
          // The order is saved, so an email failure must not trigger a retry
          // (the retry would find it completed and skip the emails anyway).
          try {
            await sendOrderEmails({
              ...(completedOrder as Omit<CompletedOrder, 'id'>),
              id: orderId,
              userEmail: (completedOrder.userEmail as string | null) ?? null,
              deliveryMethod,
              // Orders created before deliveryFee was stored charged the flat $15.
              deliveryFee: (completedOrder.deliveryFee as number | undefined) ?? (deliveryMethod === 'delivery' ? 15 : 0),
            })
          } catch (error) {
            console.error(`Failed to send emails for order ${orderId}:`, error)
          }
        }
      }
    }

    // Stripe expires an unpaid Checkout Session (30 minutes after creation, see
    // createCheckoutSession) and fires `expired`; a delayed payment that never
    // arrives fires `async_payment_failed`. Either way, mark the order so it
    // doesn't sit as 'pending' forever, and return the stock it reserved.
    if (
      event.type === 'checkout.session.expired' ||
      event.type === 'checkout.session.async_payment_failed'
    ) {
      const session = event.data.object as Stripe.Checkout.Session
      const orderId = session.metadata?.orderId

      if (orderId) {
        try {
          const db = getFirestore()
          const orderRef = db.collection('orders').doc(orderId)
          if (await releasePendingOrder(db, orderRef)) {
            console.log(`Order ${orderId} marked as expired`)
          }
        } catch (error) {
          console.error(`Failed to mark order ${orderId} as expired:`, error)
          res.status(500).json({ error: 'Failed to update order' })
          return
        }
      }
    }

    res.status(200).json({ received: true })
  }
)
