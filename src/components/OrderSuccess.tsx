import React, { useEffect, useMemo, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Header } from './Header'
import { Check, AlertCircle, Clock } from 'lucide-react'
import { Footer } from './Footer'
import { Enso, Seal } from './Ornaments'

import { CART_STORAGE_KEY, PENDING_CHECKOUT_KEY } from '../types'
import type { PageProps } from '../types'
import { DELIVERY_FEE } from './CartSidebar'

interface OrderItem {
  name: string
  quantity: number
  unitPrice: number
}

// What getOrderStatus returns: just enough to show the receipt.
interface Order {
  status: 'pending' | 'completed' | 'expired'
  email: string | null
  items: OrderItem[]
  deliveryMethod: 'pickup' | 'delivery'
  deliveryFee: number | null
}

// The webhook usually marks the order paid within a few seconds of Stripe
// redirecting here; check every 2s for up to a minute before giving up.
const POLL_INTERVAL_MS = 2000
const MAX_POLLS = 30

const NOT_FOUND_MESSAGE =
  "We couldn't find this order. If you were charged, please email zenoasisnz@gmail.com and we'll sort it out."

export const OrderSuccess: React.FC<PageProps> = ({ user, isAuthenticated, onLogout }) => {
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('order_id')
  const sessionId = searchParams.get('session_id')
  const [order, setOrder] = useState<Order | null>(null)
  const [error, setError] = useState<string | null>(
    orderId && sessionId ? null : NOT_FOUND_MESSAGE
  )
  const [timedOut, setTimedOut] = useState(false)

  useEffect(() => {
    // Back from Stripe, so there's nothing for the shop to cancel on the way
    // back, and the cart has been bought.
    try {
      sessionStorage.removeItem(PENDING_CHECKOUT_KEY)
      localStorage.removeItem(CART_STORAGE_KEY)
    } catch {
      // Storage unavailable; nothing to clear.
    }
  }, [])

  useEffect(() => {
    if (!orderId || !sessionId) return
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | undefined
    let polls = 0

    const check = async () => {
      polls += 1
      try {
        const response = await fetch(`${import.meta.env.VITE_FUNCTIONS_BASE_URL}/getOrderStatus`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId, sessionId }),
        })
        if (cancelled) return
        if (response.status === 404 || response.status === 400) {
          setError(NOT_FOUND_MESSAGE)
          return
        }
        if (!response.ok) throw new Error(`Order lookup failed with ${response.status}`)

        const result = (await response.json()) as Order
        if (cancelled) return
        setOrder(result)
        if (result.status !== 'pending') return
      } catch (err) {
        console.error('Error fetching order:', err)
        if (cancelled) return
      }

      if (polls >= MAX_POLLS) {
        setTimedOut(true)
      } else {
        timer = setTimeout(check, POLL_INTERVAL_MS)
      }
    }

    check()
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [orderId, sessionId])

  // Orders created before deliveryFee was stored charged the flat fee.
  const deliveryFee =
    order?.deliveryFee ?? (order?.deliveryMethod === 'delivery' ? DELIVERY_FEE : 0)
  const orderTotal = useMemo(
    () =>
      order &&
      order.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0) + deliveryFee,
    [order, deliveryFee],
  )

  const notice = (icon: React.ReactNode, title: string, message: string, cta: string) => (
    <div className="text-center">
      <Seal className="w-16 h-16 mx-auto mb-8">{icon}</Seal>
      <h1 className="text-headline text-sumi mb-3">{title}</h1>
      <p className="text-sumi-soft mb-10">{message}</p>
      <Link to="/" className="btn-primary">
        {cta}
      </Link>
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        user={isAuthenticated ? user : null}
        onLogout={onLogout}
        cartItemCount={0}
        onCartOpen={() => {}}
        onSearchClick={() => {}}
        searchOpen={false}
        searchQuery=""
        onSearchChange={() => {}}
      />

      <main className="flex-1 w-full max-w-2xl mx-auto px-gutter py-24">
        {error ? (
          notice(<AlertCircle className="w-8 h-8" />, 'Order Not Found', error, 'Return to Shop')
        ) : timedOut ? (
          notice(
            <Clock className="w-8 h-8" />,
            'Payment Still Processing',
            `We haven't had confirmation from our payment provider yet. If your payment goes through, we'll email your confirmation; if it doesn't, no money is taken. Your order reference is ${orderId}.`,
            'Return to Shop',
          )
        ) : !order ? (
          <Enso label="Loading order…" />
        ) : order.status === 'pending' ? (
          <div className="text-center">
            <Enso label="Payment Processing..." />
            <p className="text-sumi-soft mt-2">
              Please wait while we confirm your payment.
            </p>
          </div>
        ) : order.status === 'expired' ? (
          notice(
            <Clock className="w-8 h-8" />,
            'Checkout Session Expired',
            'This checkout session was never completed and has expired. No payment was taken.',
            'Return to Shop',
          )
        ) : (
          <div className="card-washi relative p-8 md:p-12">
            <span aria-hidden="true" className="absolute top-0 inset-x-0 h-1 bg-ai" />
            <div className="flex items-start justify-between gap-6 mb-10">
              <div>
                <p className="eyebrow mb-4">Receipt</p>
                <h1 className="text-headline text-sumi mb-2">Order Confirmed!</h1>
                <p className="text-sumi-soft">
                  Thank you for your purchase. Your order has been received
                  {order.email ? ` and a confirmation has been sent to ${order.email}.` : '.'}
                </p>
                <p className="text-sm text-sumi-soft mt-3">
                  Order reference: <span className="font-medium text-sumi break-all">{orderId}</span>
                </p>
              </div>
              <Seal className="w-16 h-16 shrink-0 -rotate-6">
                <Check className="w-8 h-8" />
              </Seal>
            </div>

            <div className="border-t border-sumi pt-6">
              <h2 className="field-label mb-4">Order Details</h2>
              <ul className="divide-y divide-dashed divide-rule">
                {order.items.map((item, index) => (
                  <li
                    key={index}
                    className="flex justify-between items-baseline py-3"
                  >
                    <div>
                      <span className="font-display text-lg text-sumi">{item.name}</span>
                      <span className="text-sumi-soft ml-2 text-sm">
                        x{item.quantity}
                      </span>
                    </div>
                    <span className="text-sumi">
                      ${(item.unitPrice * item.quantity).toFixed(2)}
                    </span>
                  </li>
                ))}
                {deliveryFee > 0 && (
                  <li className="flex justify-between items-baseline py-3">
                    <span className="font-display text-lg text-sumi">Delivery</span>
                    <span className="text-sumi">${deliveryFee.toFixed(2)}</span>
                  </li>
                )}
              </ul>
              <div className="border-t-2 border-double border-sumi mt-2 pt-4 flex justify-between items-baseline">
                <span className="font-display text-xl text-sumi">Total</span>
                <span className="font-display text-2xl font-bold text-shu">
                  ${orderTotal?.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="mt-10 text-center">
              <Link to="/" className="btn-primary">
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
