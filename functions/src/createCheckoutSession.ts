import { onRequest } from 'firebase-functions/v2/https'
import { defineSecret } from 'firebase-functions/params'
import * as admin from 'firebase-admin'
import Stripe from 'stripe'

const STRIPE_SECRET_KEY = defineSecret('STRIPE_SECRET_KEY')

interface CheckoutItem {
  productId: string
  quantity: number
}

const DELIVERY_FEE_NZD = 10

interface CheckoutRequestBody {
  items: CheckoutItem[]
  deliveryMethod?: 'pickup' | 'delivery'
  userEmail?: string
}

export const createCheckoutSession = onRequest(
  { cors: true, secrets: [STRIPE_SECRET_KEY] },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' })
      return
    }

    const { items, deliveryMethod = 'pickup', userEmail } = req.body as CheckoutRequestBody

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'Items array is required' })
      return
    }

    if (items.length > 50) {
      res.status(400).json({ error: 'Too many items in cart' })
      return
    }

    for (const item of items) {
      if (
        !item.productId ||
        typeof item.productId !== 'string' ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1 ||
        item.quantity > 99
      ) {
        res.status(400).json({ error: 'Invalid item in cart' })
        return
      }
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
        const availableStock: number = productData.stock ?? 0
        if (availableStock <= 0) {
          res.status(400).json({ error: `${productData.name} is out of stock` })
          return
        }
        if (availableStock < item.quantity) {
          res.status(400).json({
            error: `Only ${availableStock} of ${productData.name} available`,
          })
          return
        }

        lineItems.push({
          price_data: {
            currency: 'nzd',
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

      if (deliveryMethod === 'delivery') {
        lineItems.push({
          price_data: {
            currency: 'nzd',
            product_data: { name: 'Delivery' },
            unit_amount: DELIVERY_FEE_NZD * 100,
          },
          quantity: 1,
        })
      }

      // Create pending order in Firestore
      const orderRef = await db.collection('orders').add({
        status: 'pending',
        userEmail: userEmail || null,
        items: orderItems,
        deliveryMethod,
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
        ...(userEmail && { customer_email: userEmail }),
        ...(deliveryMethod === 'delivery' && {
          shipping_address_collection: { allowed_countries: ['NZ'] },
        }),
        metadata: {
          orderId: orderRef.id,
          deliveryMethod,
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
