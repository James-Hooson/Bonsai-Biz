import { onRequest } from 'firebase-functions/v2/https'
import { defineSecret } from 'firebase-functions/params'
import { getFirestore } from 'firebase-admin/firestore'
import Stripe from 'stripe'

const STRIPE_SECRET_KEY = defineSecret('STRIPE_SECRET_KEY')

const LOCALHOST_URL = 'http://localhost:5173'
const BASE_URL = process.env.BASE_URL
const ALLOWED_ORIGINS = BASE_URL ? [BASE_URL, LOCALHOST_URL] : [LOCALHOST_URL]

const ID_PATTERN = /^[a-zA-Z0-9_-]{1,200}$/

// Lets the order success page show a guest their order. Guests have no
// Firebase session, so they can't read orders directly; instead they prove the
// order is theirs with the Checkout Session ID Stripe put in their success URL.
export const getOrderStatus = onRequest(
  { cors: ALLOWED_ORIGINS, maxInstances: 20, secrets: [STRIPE_SECRET_KEY] },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' })
      return
    }

    const { orderId, sessionId } = req.body as { orderId?: unknown; sessionId?: unknown }
    if (
      typeof orderId !== 'string' ||
      typeof sessionId !== 'string' ||
      !ID_PATTERN.test(orderId) ||
      !ID_PATTERN.test(sessionId)
    ) {
      res.status(400).json({ error: 'Invalid order reference' })
      return
    }

    try {
      const order = (await getFirestore().collection('orders').doc(orderId).get()).data()
      if (!order) {
        res.status(404).json({ error: 'Order not found' })
        return
      }

      let sessionMatches = order.stripeSessionId === sessionId
      if (!sessionMatches && !order.stripeSessionId) {
        // Saving the session ID onto the order can fail after Stripe created
        // the session, so fall back to asking Stripe which order it belongs to.
        const session = await new Stripe(STRIPE_SECRET_KEY.value()).checkout.sessions
          .retrieve(sessionId)
          .catch(() => null)
        sessionMatches = session?.metadata?.orderId === orderId
      }
      if (!sessionMatches) {
        // Same answer as a missing order, so IDs can't be probed.
        res.status(404).json({ error: 'Order not found' })
        return
      }

      res.json({
        status: order.status,
        email: order.userEmail ?? null,
        items: ((order.items ?? []) as Array<{ name: string; quantity: number; unitPrice: number }>).map(
          ({ name, quantity, unitPrice }) => ({ name, quantity, unitPrice }),
        ),
        deliveryMethod: order.deliveryMethod === 'delivery' ? 'delivery' : 'pickup',
        deliveryFee: order.deliveryFee ?? null,
      })
    } catch (error) {
      console.error(`Failed to look up order ${orderId}:`, error)
      res.status(500).json({ error: 'Failed to load order' })
    }
  }
)
