import React, { useEffect, useMemo, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'
import { Header } from './Header'
import { Check, AlertCircle, Clock } from 'lucide-react'
import { Footer } from './Footer'
import { Enso, Seal } from './Ornaments'

import type { PageProps } from '../types'

interface OrderItem {
  productId: string
  name: string
  quantity: number
  unitPrice: number
}

interface Order {
  status: 'pending' | 'completed' | 'expired'
  userEmail: string
  items: OrderItem[]
  stripeSessionId: string | null
  stripePaymentIntentId: string | null
}

export const OrderSuccess: React.FC<PageProps> = ({
  user,
  isAuthenticated,
  isLoading,
  firebaseReady,
  onLogout,
}) => {
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('order_id')
  const [order, setOrder] = useState<Order | null>(null)
  const [error, setError] = useState<string | null>(
    orderId ? null : 'Order ID not found'
  )
  const loading = !!orderId && isAuthenticated && !order && !error

  useEffect(() => {
    if (!orderId || !isAuthenticated || !firebaseReady) return

    const unsubscribe = onSnapshot(
      doc(db, 'orders', orderId),
      (docSnap) => {
        if (docSnap.exists()) {
          setOrder(docSnap.data() as Order)
        } else {
          setError('Order not found')
        }
      },
      (err) => {
        console.error('Error fetching order:', err)
        setError('Failed to load order')
      }
    )

    return () => unsubscribe()
  }, [orderId, isAuthenticated, firebaseReady])

  const orderTotal = useMemo(
    () => order?.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    [order],
  )

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Enso />
      </div>
    )
  }

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
        {loading ? (
          <Enso label="Loading order…" />
        ) : error ? (
          notice(<AlertCircle className="w-8 h-8" />, 'Error', error, 'Return to Shop')
        ) : !isAuthenticated ? (
          notice(
            <Check className="w-8 h-8" />,
            'Order Confirmed!',
            'Thank you for your purchase. A confirmation has been sent to your email.',
            'Continue Shopping',
          )
        ) : order?.status === 'pending' ? (
          <div className="text-center">
            <Enso label="Payment Processing..." />
            <p className="text-sumi-soft mt-2">
              Please wait while we confirm your payment.
            </p>
          </div>
        ) : order?.status === 'expired' ? (
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
                  Thank you for your purchase. Your order has been received.
                </p>
              </div>
              <Seal className="w-16 h-16 shrink-0 -rotate-6">
                <Check className="w-8 h-8" />
              </Seal>
            </div>

            <div className="border-t border-sumi pt-6">
              <h2 className="field-label mb-4">Order Details</h2>
              <ul className="divide-y divide-dashed divide-rule">
                {order?.items.map((item, index) => (
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
