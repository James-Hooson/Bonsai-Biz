import { onRequest } from 'firebase-functions/v2/https'
import { defineSecret } from 'firebase-functions/params'
import * as admin from 'firebase-admin'
import Stripe from 'stripe'

const STRIPE_SECRET_KEY = defineSecret('STRIPE_SECRET_KEY')
const STRIPE_WEBHOOK_SECRET = defineSecret('STRIPE_WEBHOOK_SECRET')

export const stripeWebhook = onRequest(
  { secrets: [STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET] },
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

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const sessionStub = event.data.object as Stripe.Checkout.Session
      const orderId = sessionStub.metadata?.orderId

      if (orderId) {
        try {
          const db = admin.firestore()
          const orderRef = db.collection('orders').doc(orderId)

          // Re-fetch the full session so shipping_details is populated
          const session = await stripe.checkout.sessions.retrieve(sessionStub.id)
          const updateData: Record<string, unknown> = {
            status: 'completed',
            stripePaymentIntentId: session.payment_intent,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
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

          // Stripe redelivers webhook events at-least-once. Atomically flip
          // status to 'completed' only once, so a duplicate delivery can't
          // deduct stock twice for the same order.
          const orderItems = await db.runTransaction(async (tx) => {
            const snap = await tx.get(orderRef)
            if (snap.data()?.status === 'completed') return null
            tx.update(orderRef, updateData as admin.firestore.UpdateData<admin.firestore.DocumentData>)
            return (snap.data()?.items ?? []) as Array<{ productId: string; quantity: number }>
          })

          if (orderItems === null) {
            console.log(`Order ${orderId} already completed, skipping duplicate webhook delivery`)
            res.status(200).json({ received: true })
            return
          }
          console.log(`Order ${orderId} marked as completed`)

          // Deduct stock for each purchased item
          await Promise.all(
            orderItems.map(async (item) => {
              const productRef = db.collection('products').doc(item.productId)
              await db.runTransaction(async (tx) => {
                const productSnap = await tx.get(productRef)
                if (!productSnap.exists) return
                const currentStock: number = productSnap.data()?.stock ?? 0
                const newStock = Math.max(0, currentStock - item.quantity)
                tx.update(productRef, {
                  stock: newStock,
                  inStock: newStock > 0,
                })
              })
            }),
          )
        } catch (error) {
          console.error(`Failed to update order ${orderId}:`, error)
        }
      }
    }

    // Stripe expires an unpaid Checkout Session ~24h after creation and fires
    // this event. Mark the abandoned order so it doesn't sit as 'pending' forever.
    if (event.type === 'checkout.session.expired') {
      const session = event.data.object as Stripe.Checkout.Session
      const orderId = session.metadata?.orderId

      if (orderId) {
        try {
          const db = admin.firestore()
          const orderRef = db.collection('orders').doc(orderId)
          await db.runTransaction(async (tx) => {
            const snap = await tx.get(orderRef)
            if (snap.data()?.status !== 'pending') return
            tx.update(orderRef, {
              status: 'expired',
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            })
          })
          console.log(`Order ${orderId} marked as expired`)
        } catch (error) {
          console.error(`Failed to mark order ${orderId} as expired:`, error)
        }
      }
    }

    // Return 200 for all events (so Stripe stops retrying)
    res.status(200).json({ received: true })
  }
)
