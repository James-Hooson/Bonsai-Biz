import React from 'react'
import { Plus, Package, Truck, RefreshCw } from 'lucide-react'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'

interface ShippingAddress {
  name: string | null
  line1: string | null
  line2: string | null
  city: string | null
  state: string | null
  postalCode: string | null
  country: string | null
}

interface Order {
  id: string
  status: string
  userEmail: string | null
  deliveryMethod: 'pickup' | 'delivery'
  shippingAddress?: ShippingAddress
  items: Array<{ name: string; quantity: number; unitPrice: number }>
  createdAt: { toDate: () => Date } | null
}

interface AdminPanelProps {
  onAddProduct: () => void
  ready: boolean
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onAddProduct, ready }) => {
  const [orders, setOrders] = React.useState<Order[]>([])
  const [tab, setTab] = React.useState<'orders' | 'products'>('orders')

  React.useEffect(() => {
    if (!ready) return
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      setOrders(
        snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Order, 'id'>) }))
      )
    })
    return unsub
  }, [ready])

  return (
    <div className="bg-blue-50 border-b border-blue-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Header row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-blue-900">Admin</h2>
            <div className="flex gap-1">
              <button
                onClick={() => setTab('orders')}
                className={`px-3 py-1 rounded text-sm font-medium transition ${
                  tab === 'orders'
                    ? 'bg-blue-600 text-white'
                    : 'text-blue-700 hover:bg-blue-100'
                }`}
              >
                Orders
              </button>
              <button
                onClick={() => setTab('products')}
                className={`px-3 py-1 rounded text-sm font-medium transition ${
                  tab === 'products'
                    ? 'bg-blue-600 text-white'
                    : 'text-blue-700 hover:bg-blue-100'
                }`}
              >
                Products
              </button>
            </div>
          </div>
          {tab === 'products' && (
            <button
              onClick={onAddProduct}
              disabled={!ready}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          )}
        </div>

        {/* Orders tab */}
        {tab === 'orders' && (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            {!ready ? (
              <p className="text-blue-700 text-sm py-2 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" /> Syncing admin session…
              </p>
            ) : orders.length === 0 ? (
              <p className="text-blue-700 text-sm py-2">No orders yet.</p>
            ) : (
              orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-lg border border-blue-100 p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {order.deliveryMethod === 'delivery' ? (
                          <Truck className="w-4 h-4 text-blue-600 shrink-0" />
                        ) : (
                          <Package className="w-4 h-4 text-gray-500 shrink-0" />
                        )}
                        <span className="font-semibold text-gray-900 text-sm capitalize">
                          {order.deliveryMethod ?? 'pickup'}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            order.status === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : order.status === 'expired'
                              ? 'bg-gray-100 text-gray-500'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {order.userEmail ?? 'Guest'}
                        {order.createdAt
                          ? ` · ${order.createdAt.toDate().toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`
                          : ''}
                      </p>
                    </div>

                    {/* Delivery address */}
                    {order.deliveryMethod === 'delivery' && (
                      <div className="text-sm text-gray-700 bg-blue-50 rounded p-2 min-w-45">
                        {order.shippingAddress ? (
                          <>
                            {order.shippingAddress.name && (
                              <p className="font-medium">{order.shippingAddress.name}</p>
                            )}
                            {order.shippingAddress.line1 && <p>{order.shippingAddress.line1}</p>}
                            {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
                            <p>
                              {[
                                order.shippingAddress.city,
                                order.shippingAddress.state,
                                order.shippingAddress.postalCode,
                              ]
                                .filter(Boolean)
                                .join(', ')}
                            </p>
                          </>
                        ) : (
                          <span className="flex items-center gap-1 text-gray-400 text-xs">
                            <RefreshCw className="w-3 h-3" /> Awaiting payment
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Items */}
                  <div className="mt-3 border-t pt-2 space-y-0.5">
                    {order.items?.map((item, i) => (
                      <div key={i} className="flex justify-between text-xs text-gray-600">
                        <span>{item.name} × {item.quantity}</span>
                        <span>${(item.unitPrice * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Products tab — just the add button trigger, product list is in the main page */}
        {tab === 'products' && (
          <p className="text-blue-700 text-sm py-1">
            Use <strong>Add Product</strong> above to add new items. Edit or delete products directly from the shop listing below.
          </p>
        )}
      </div>
    </div>
  )
}
