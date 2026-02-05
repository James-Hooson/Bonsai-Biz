import { onRequest } from 'firebase-functions/v2/https'
import { defineSecret } from 'firebase-functions/params'
import * as admin from 'firebase-admin'
import Stripe from 'stripe'

const STRIPE_SECRET_KEY = defineSecret('STRIPE_SECRET_KEY')

interface CheckoutItem {
  productId: string
  quantity: number
}

interface CheckoutRequestBody {
  items: CheckoutItem[]
  userEmail?: string // Optional - Stripe will collect if not provided
}

export const createCheckoutSession = onRequest(
  { cors: true, secrets: [STRIPE_SECRET_KEY] },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' })
      return
    }

    const { items, userEmail } = req.body as CheckoutRequestBody

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'Items array is required' })
      return
    }

    const stripe = new Stripe(STRIPE_SECRET_KEY.value())
    const db = admin.firestore()

    try {
      // Fetch products from Firestore and build line items
      const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = []
      const orderItems: Array<{
        productId: string
        name: string
        quantity: number
        unitPrice: number
      }> = []

      for (const item of items) {
        const productDoc = await db
          .collection('products')
          .doc(item.productId)
          .get()

        if (!productDoc.exists) {
          res.status(400).json({ error: `Product ${item.productId} not found` })
          return
        }

        const productData = productDoc.data()!
        if (!productData.inStock) {
          res
            .status(400)
            .json({ error: `Product ${productData.name} is out of stock` })
          return
        }

        lineItems.push({
          price_data: {
            currency: 'usd',
            product_data: {
              name: productData.name,
              description: productData.description,
              images: productData.image ? [productData.image] : undefined,
            },
            unit_amount: Math.round(productData.price * 100),
          },
          quantity: item.quantity,
        })

        orderItems.push({
          productId: item.productId,
          name: productData.name,
          quantity: item.quantity,
          unitPrice: productData.price,
        })
      }

      // Create pending order in Firestore
      const orderRef = await db.collection('orders').add({
        status: 'pending',
        userEmail: userEmail || null, // Will be updated from Stripe webhook if guest checkout
        items: orderItems,
        stripeSessionId: null,
        stripePaymentIntentId: null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      })

      const baseUrl = process.env.BASE_URL || 'http://localhost:5173'

      // Create Stripe Checkout Session
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: lineItems,
        success_url: `${baseUrl}/success?order_id=${orderRef.id}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/`,
        ...(userEmail && { customer_email: userEmail }), // Only set if provided
        metadata: {
          orderId: orderRef.id,
        },
      })

      // Update order with Stripe session ID
      await orderRef.update({
        stripeSessionId: session.id,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      })

      res.json({ url: session.url })
    } catch (error) {
      console.error('Error creating checkout session:', error)
      res.status(500).json({ error: 'Failed to create checkout session' })
    }
  }
)
