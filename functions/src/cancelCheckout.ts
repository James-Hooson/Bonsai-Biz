import { onRequest } from 'firebase-functions/v2/https'
import { defineSecret } from 'firebase-functions/params'
import * as admin from 'firebase-admin'
import Stripe from 'stripe'
import { releasePendingOrder } from './orderStock'

const STRIPE_SECRET_KEY = defineSecret('STRIPE_SECRET_KEY')

const LOCALHOST_URL = 'http://localhost:5173'
const BASE_URL = process.env.BASE_URL
const ALLOWED_ORIGINS = BASE_URL ? [BASE_URL, LOCALHOST_URL] : [LOCALHOST_URL]

// Called when a customer comes back to the shop without paying (Stripe's back
// link or the browser back button). Expires their Checkout Session so it can no
// longer be paid, then returns the stock it reserved straight away instead of
// leaving the item sold out until Stripe's own expiry.
export const cancelCheckout = onRequest(
  { cors: ALLOWED_ORIGINS, maxInstances: 20, secrets: [STRIPE_SECRET_KEY] },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' })
      return
    }

    const { orderId } = req.body as { orderId?: unknown }
    if (typeof orderId !== 'string' || !/^[a-zA-Z0-9-]{1,100}$/.test(orderId)) {
      res.status(400).json({ error: 'Invalid order ID' })
      return
    }

    const db = admin.firestore()
    const orderRef = db.collection('orders').doc(orderId)

    try {
      const order = (await orderRef.get()).data()
      if (order?.status !== 'pending' || !order.stripeSessionId) {
        res.json({ cancelled: false })
        return
      }

      const stripe = new Stripe(STRIPE_SECRET_KEY.value())
      try {
        await stripe.checkout.sessions.expire(order.stripeSessionId)
      } catch (error) {
        // Stripe refuses to expire a session that has been paid (or already
        // expired) - leave the order for the webhook to settle.
        console.log(`Could not expire session for order ${orderId}:`, error)
        res.json({ cancelled: false })
        return
      }

      const cancelled = await releasePendingOrder(db, orderRef)
      res.json({ cancelled })
    } catch (error) {
      console.error(`Failed to cancel checkout for order ${orderId}:`, error)
      res.status(500).json({ error: 'Failed to cancel checkout' })
    }
  }
)
