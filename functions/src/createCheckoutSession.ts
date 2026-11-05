import { onRequest } from 'firebase-functions/v2/https'
import { defineSecret } from 'firebase-functions/params'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import Stripe from 'stripe'
import { randomUUID } from 'node:crypto'
import { quantitiesByProduct, releasePendingOrder } from './orderStock'

const STRIPE_SECRET_KEY = defineSecret('STRIPE_SECRET_KEY')

const LOCALHOST_URL = 'http://localhost:5173'
const BASE_URL = process.env.BASE_URL

if (!BASE_URL) {
  console.error(
    'BASE_URL environment variable is not set — falling back to localhost only. ' +
      'If this function is deployed without BASE_URL configured, checkout will be CORS-blocked from the live site.'
  )
}

const ALLOWED_ORIGINS = BASE_URL ? [BASE_URL, LOCALHOST_URL] : [LOCALHOST_URL]

interface CheckoutItem {
  productId: string
  quantity: number
}

const DELIVERY_FEE_NZD = 15
// Keep in step with the delivery section of the Terms page and the cart.
const DELIVERY_AREA_NOTE = 'We deliver to Upper Hutt, Lower Hutt and Wellington City only.'
const RESERVATION_SECONDS = 31 * 60

class UnavailableItemError extends Error {}

interface CheckoutRequestBody {
  items: CheckoutItem[]
  deliveryMethod?: 'pickup' | 'delivery'
  userEmail?: string
  idempotencyKey?: string
}

function isValidIdempotencyKey(value: unknown): value is string {
  return typeof value === 'string' && /^[a-zA-Z0-9-]{1,100}$/.test(value)
}

export const createCheckoutSession = onRequest(
  { cors: ALLOWED_ORIGINS, maxInstances: 20, secrets: [STRIPE_SECRET_KEY] },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' })
      return
    }

    const { items, deliveryMethod = 'pickup', userEmail, idempotencyKey: rawIdempotencyKey } =
      req.body as CheckoutRequestBody
    const idempotencyKey = isValidIdempotencyKey(rawIdempotencyKey) ? rawIdempotencyKey : randomUUID()

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
    const db = getFirestore()

    // Stock is reserved (deducted) here, when the order is created, rather than
    // when payment completes - otherwise two customers could both be sent to
    // Stripe for the last item. The webhook returns it if the session expires.
    const orderRef = db.collection('orders').doc(idempotencyKey)
    const deliveryFee = deliveryMethod === 'delivery' ? DELIVERY_FEE_NZD : 0
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = []

    try {
      const existingOrder = await db.runTransaction(async (tx) => {
        // Transactions may be retried on contention, so start from a clean slate.
        lineItems.length = 0

        // Order already exists for this idempotency key - this is a retry.
        const existing = await tx.get(orderRef)
        if (existing.exists) {
          return {
            sessionId: (existing.data()?.stripeSessionId ?? null) as string | null,
            status: existing.data()?.status as string,
          }
        }

        const quantities = quantitiesByProduct(items)
        const productRefs = [...quantities.keys()].map((id) => db.collection('products').doc(id))
        const productSnaps = await Promise.all(productRefs.map((ref) => tx.get(ref)))
        const products = new Map(productSnaps.map((snap, i) => [productRefs[i].id, snap]))

        for (const [productId, quantity] of quantities) {
          const productDoc = products.get(productId)!
          if (!productDoc.exists) {
            console.error(`Checkout attempted with unknown product ${productId}`)
            throw new UnavailableItemError()
          }
          const availableStock: number = productDoc.data()!.stock ?? 0
          if (availableStock <= 0) {
            console.error(`Checkout attempted for out-of-stock product ${productId}`)
            throw new UnavailableItemError()
          }
          if (availableStock < quantity) {
            console.error(
              `Checkout requested quantity ${quantity} for ${productId} but only ${availableStock} in stock`
            )
            throw new UnavailableItemError()
          }
        }

        const orderItems = items.map((item) => {
          const productData = products.get(item.productId)!.data()!
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
          return {
            productId: item.productId,
            name: productData.name,
            quantity: item.quantity,
            unitPrice: productData.price,
          }
        })

        for (const [productId, quantity] of quantities) {
          const stock: number = products.get(productId)!.data()!.stock - quantity
          tx.update(db.collection('products').doc(productId), { stock, inStock: stock > 0 })
        }

        tx.create(orderRef, {
          status: 'pending',
          userEmail: userEmail || null,
          items: orderItems,
          deliveryMethod,
          deliveryFee,
          stockReserved: true,
          stripeSessionId: null,
          stripePaymentIntentId: null,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        })
        return null
      })

      if (existingOrder) {
        if (existingOrder.status !== 'pending') {
          // The first attempt failed (and released its stock) or has already
          // finished; the client starts over with a fresh key.
          res.status(500).json({ error: 'Failed to create checkout session' })
          return
        }
        if (!existingOrder.sessionId) {
          // The first request is still creating its Stripe session.
          res.status(409).json({ error: 'Checkout is already in progress. Please try again in a moment.' })
          return
        }
        const existingSession = await stripe.checkout.sessions.retrieve(existingOrder.sessionId)
        res.json({ url: existingSession.url, orderId: orderRef.id })
        return
      }
    } catch (error) {
      if (error instanceof UnavailableItemError) {
        res.status(400).json({ error: 'One or more items in your cart are unavailable' })
        return
      }
      console.error('Error reserving stock for checkout:', error)
      res.status(500).json({ error: 'Failed to create checkout session' })
      return
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

    const baseUrl = BASE_URL || LOCALHOST_URL
    let session: Stripe.Checkout.Session
    try {
      session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: lineItems,
        // Customers must tick "I agree to the Terms of Service" before paying.
        // Stripe uses the Terms URL saved in the Dashboard's Public details.
        consent_collection: { terms_of_service: 'required' },
        // Short expiry so abandoned checkouts don't hold reserved stock for
        // Stripe's default 24h. A minute of slack over Stripe's 30-minute minimum.
        expires_at: Math.floor(Date.now() / 1000) + RESERVATION_SECONDS,
        success_url: `${baseUrl}/success?order_id=${orderRef.id}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/`,
        ...(userEmail && { customer_email: userEmail }),
        ...(deliveryMethod === 'delivery' && {
          shipping_address_collection: { allowed_countries: ['NZ'] },
          custom_text: { shipping_address: { message: DELIVERY_AREA_NOTE } },
        }),
        metadata: {
          orderId: orderRef.id,
          deliveryMethod,
        },
      }, { idempotencyKey })
    } catch (error) {
      console.error('Error creating checkout session:', error)
      // No session means no way to pay, so hand the reserved stock back.
      await releasePendingOrder(db, orderRef).catch((releaseError) =>
        console.error(`Failed to release stock for order ${orderRef.id}:`, releaseError)
      )
      res.status(500).json({ error: 'Failed to create checkout session' })
      return
    }

    try {
      await orderRef.update({
        stripeSessionId: session.id,
        updatedAt: FieldValue.serverTimestamp(),
      })
    } catch (error) {
      // The session is live and the webhook finds the order via metadata, so
      // the customer can still pay - just log it.
      console.error(`Failed to record session ${session.id} on order ${orderRef.id}:`, error)
    }

    res.json({ url: session.url, orderId: orderRef.id })
  }
)
