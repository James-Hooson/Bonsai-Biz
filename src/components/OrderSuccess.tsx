import React, { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'
import { Header } from './Header'
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react'

interface OrderSuccessProps {
  user: any
  isAuthenticated: boolean
  isLoading: boolean
  onLogin: () => void
  onLogout: () => void
}

interface OrderItem {
  productId: string
  name: string
  quantity: number
  unitPrice: number
}

interface Order {
  status: 'pending' | 'completed'
  userEmail: string
  items: OrderItem[]
  stripeSessionId: string | null
  stripePaymentIntentId: string | null
}

export const OrderSuccess: React.FC<OrderSuccessProps> = ({
  user,
  isAuthenticated,
  isLoading,
  onLogin,
  onLogout,
}) => {
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('order_id')
  const [order, setOrder] = useState<Order | null>(null)
  const [error, setError] = useState<string | null>(
    orderId ? null : 'Order ID not found'
  )
  const [loading, setLoading] = useState(!!orderId)

  useEffect(() => {
    if (!orderId) {
      return
    }

    const unsubscribe = onSnapshot(
      doc(db, 'orders', orderId),
      (docSnap) => {
        if (docSnap.exists()) {
          setOrder(docSnap.data() as Order)
          setLoading(false)
        } else {
          setError('Order not found')
          setLoading(false)
        }
      },
      (err) => {
        console.error('Error fetching order:', err)
        setError('Failed to load order')
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [orderId])

  const orderTotal = order?.items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-gray-600">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        user={isAuthenticated ? user : null}
        onLogin={onLogin}
        onLogout={onLogout}
        cartItemCount={0}
        onCartOpen={() => {}}
        onSearchClick={() => {}}
        searchOpen={false}
        searchQuery=""
        onSearchChange={() => {}}
      />

      <main className="max-w-2xl mx-auto px-4 py-16">
        {loading ? (
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900">
              Loading order...
            </h1>
          </div>
        ) : error ? (
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
            <p className="text-gray-600 mb-8">{error}</p>
            <Link
              to="/"
              className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
            >
              Return to Shop
            </Link>
          </div>
        ) : order?.status === 'pending' ? (
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Payment Processing...
            </h1>
            <p className="text-gray-600">
              Please wait while we confirm your payment.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="text-center mb-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Order Confirmed!
              </h1>
              <p className="text-gray-600">
                Thank you for your purchase. Your order has been received.
              </p>
            </div>

            <div className="border-t pt-6">
              <h2 className="text-lg font-semibold mb-4">Order Details</h2>
              <div className="space-y-3">
                {order?.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center"
                  >
                    <div>
                      <span className="font-medium">{item.name}</span>
                      <span className="text-gray-500 ml-2">
                        x{item.quantity}
                      </span>
                    </div>
                    <span className="text-gray-900">
                      ${(item.unitPrice * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t mt-4 pt-4 flex justify-between items-center">
                <span className="text-lg font-bold">Total</span>
                <span className="text-lg font-bold text-green-600">
                  ${orderTotal?.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="mt-8 text-center">
              <Link
                to="/"
                className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
