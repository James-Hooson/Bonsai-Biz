import React from 'react'
import { Plus, Package, Truck, RefreshCw } from 'lucide-react'
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'

const ORDERS_PAGE_SIZE = 25

// `completed` is what the Stripe webhook writes once payment succeeds.
const STATUS_LABELS: Record<string, string> = {
  completed: 'Paid',
  pending: 'Awaiting payment',
  expired: 'Expired',
}

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
  fulfilledAt?: { toDate: () => Date } | null
}

interface AdminPanelProps {
  onAddProduct: () => void
  ready: boolean
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onAddProduct, ready }) => {
  const [orders, setOrders] = React.useState<Order[]>([])
  const [tab, setTab] = React.useState<'orders' | 'products'>('orders')
  const [pageSize, setPageSize] = React.useState(ORDERS_PAGE_SIZE)
  const [hasMore, setHasMore] = React.useState(false)
  const [hideDone, setHideDone] = React.useState(false)
  const [updatingId, setUpdatingId] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!ready) return
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(pageSize))
    const unsub = onSnapshot(q, (snap) => {
      setOrders(
        snap.docs.map((d) => ({
          id: d.id,
          // Estimate pending server timestamps so a just-ticked order doesn't flicker unticked.
          ...(d.data({ serverTimestamps: 'estimate' }) as Omit<Order, 'id'>),
        }))
      )
      setHasMore(snap.docs.length === pageSize)
    })
    return unsub
  }, [ready, pageSize])

  const toggleDone = async (order: Order) => {
    setUpdatingId(order.id)
    try {
      await updateDoc(doc(db, 'orders', order.id), {
        fulfilledAt: order.fulfilledAt ? null : serverTimestamp(),
      })
    } catch (err) {
      console.error('Failed to update order:', err)
      alert('Could not update the order. Please try again.')
    } finally {
      setUpdatingId(null)
    }
  }

  // Done orders sink below the rest; sort is stable, so each group stays newest first.
  const visibleOrders = (hideDone ? orders.filter((o) => !o.fulfilledAt) : orders)
    .slice()
    .sort((a, b) => Number(!!a.fulfilledAt) - Number(!!b.fulfilledAt))

  return (
    <div className="bg-kinari border-b border-rule">
      <div className="max-w-page mx-auto px-gutter py-4">
        {/* Header row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h2 className="flex items-center gap-2 font-display text-lg text-sumi"><span aria-hidden="true" className="w-2 h-2 rounded-full bg-shu" />Admin</h2>
            <div className="flex gap-1">
              <button
                onClick={() => setTab('orders')}
                className={`px-3 py-1 text-sm font-medium transition ${
                  tab === 'orders'
                    ? 'bg-sumi text-washi'
                    : 'text-sumi-soft hover:bg-washi-deep'
                }`}
              >
                Orders
              </button>
              <button
                onClick={() => setTab('products')}
                className={`px-3 py-1 text-sm font-medium transition ${
                  tab === 'products'
                    ? 'bg-sumi text-washi'
                    : 'text-sumi-soft hover:bg-washi-deep'
                }`}
              >
                Products
              </button>
            </div>
          </div>
          {tab === 'orders' && (
            <label className="flex items-center gap-2 text-sm text-sumi-soft cursor-pointer">
              <input
                type="checkbox"
                checked={hideDone}
                onChange={(e) => setHideDone(e.target.checked)}
                className="w-4 h-4 accent-shu"
              />
              Hide done orders
            </label>
          )}
          {tab === 'products' && (
            <button
              onClick={onAddProduct}
              disabled={!ready}
              className="btn-primary py-2"
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
              <p className="text-sumi-soft text-sm py-2 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" /> Syncing admin session…
              </p>
            ) : orders.length === 0 ? (
              <p className="text-sumi-soft text-sm py-2">No orders yet.</p>
            ) : visibleOrders.length === 0 ? (
              <p className="text-sumi-soft text-sm py-2">All caught up — every order is done.</p>
            ) : (
              visibleOrders.map((order) => (
                <div
                  key={order.id}
                  className={`border border-rule p-4 transition-opacity ${
                    order.fulfilledAt ? 'bg-kinari opacity-60' : 'bg-washi'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {order.deliveryMethod === 'delivery' ? (
                          <Truck className="w-4 h-4 text-ai shrink-0" />
                        ) : (
                          <Package className="w-4 h-4 text-sumi-soft shrink-0" />
                        )}
                        <span className="font-semibold text-sumi text-sm capitalize">
                          {order.deliveryMethod ?? 'pickup'}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            order.status === 'completed'
                              ? 'bg-matsu/15 text-matsu-deep'
                              : order.status === 'expired'
                              ? 'bg-rule/60 text-sumi-soft'
                              : 'bg-yamabuki/20 text-sumi'
                          }`}
                        >
                          {STATUS_LABELS[order.status] ?? order.status}
                        </span>
                      </div>
                      <p className="text-xs text-sumi-soft">
                        {order.userEmail ?? 'Guest'}
                        {order.createdAt
                          ? ` · ${order.createdAt.toDate().toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`
                          : ''}
                      </p>
                      {order.status === 'completed' && (
                        <label className="mt-2 inline-flex items-center gap-2 text-sm text-sumi cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!order.fulfilledAt}
                            disabled={updatingId === order.id}
                            onChange={() => toggleDone(order)}
                            className="w-4 h-4 accent-shu"
                          />
                          {order.fulfilledAt
                            ? `Done · ${order.fulfilledAt.toDate().toLocaleDateString('en-NZ', { day: 'numeric', month: 'short' })}`
                            : 'Mark as done'}
                        </label>
                      )}
                    </div>

                    {/* Delivery address */}
                    {order.deliveryMethod === 'delivery' && (
                      <div className="text-sm text-sumi-soft bg-kinari border border-rule p-2 min-w-45">
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
                          <span className="flex items-center gap-1 text-sumi-soft text-xs">
                            <RefreshCw className="w-3 h-3" /> Awaiting payment
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Items */}
                  <div className="mt-3 border-t border-rule pt-2 space-y-0.5">
                    {order.items?.map((item, i) => (
                      <div key={i} className="flex justify-between text-xs text-sumi-soft">
                        <span>{item.name} × {item.quantity}</span>
                        <span>${(item.unitPrice * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
            {ready && hasMore && (
              <button
                onClick={() => setPageSize((n) => n + ORDERS_PAGE_SIZE)}
                className="w-full text-center text-sm text-ai hover:text-shu py-2 font-medium"
              >
                Load more orders
              </button>
            )}
          </div>
        )}

        {/* Products tab — just the add button trigger, product list is in the main page */}
        {tab === 'products' && (
          <p className="text-sumi-soft text-sm py-1">
            Use <strong>Add Product</strong> above to add new items. Edit or delete products directly from the shop listing below.
          </p>
        )}
      </div>
    </div>
  )
}
