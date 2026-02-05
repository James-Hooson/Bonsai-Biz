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
    const rawBody = (req as any).rawBody

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
      const session = event.data.object as Stripe.Checkout.Session
      const orderId = session.metadata?.orderId

      if (orderId) {
        try {
          const db = admin.firestore()
          const updateData: Record<string, unknown> = {
            status: 'completed',
            stripePaymentIntentId: session.payment_intent,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          }
          // Capture email from Stripe for guest checkouts
          if (session.customer_email) {
            updateData.userEmail = session.customer_email
          }
          await db.collection('orders').doc(orderId).update(updateData)
          console.log(`Order ${orderId} marked as completed`)
        } catch (error) {
          console.error(`Failed to update order ${orderId}:`, error)
        }
      }
    }

    // Return 200 for all events (so Stripe stops retrying)
    res.status(200).json({ received: true })
  }
)
