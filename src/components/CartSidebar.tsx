import React from 'react'
import { X, Package, Truck } from 'lucide-react'
import type { CartItem } from '../types'
import { Blossom } from './Ornaments'

export type DeliveryMethod = 'pickup' | 'delivery'

export const DELIVERY_FEE = 10

interface CartSidebarProps {
  cart: CartItem[]
  onClose: () => void
  onUpdateQuantity: (id: string, quantity: number) => void
  onRemove: (id: string) => void
  onCheckout: (deliveryMethod: DeliveryMethod, idempotencyKey: string) => Promise<void>
}

export const CartSidebar: React.FC<CartSidebarProps> = ({
  cart,
  onClose,
  onUpdateQuantity,
  onRemove,
  onCheckout,
}) => {
  const [isCheckingOut, setIsCheckingOut] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [deliveryMethod, setDeliveryMethod] = React.useState<DeliveryMethod>('pickup')
  // Stable across retries so a resubmission after a network error/timeout
  // reuses the same key instead of creating a duplicate order + Stripe session.
  const idempotencyKeyRef = React.useRef(crypto.randomUUID())

  const handleCheckoutClick = async () => {
    setIsCheckingOut(true)
    setError(null)
    try {
      await onCheckout(deliveryMethod, idempotencyKeyRef.current)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Checkout failed'
      console.error('Checkout error:', err)
      setError(message)
      setIsCheckingOut(false)
    }
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const deliveryFee = deliveryMethod === 'delivery' ? DELIVERY_FEE : 0
  const cartTotal = subtotal + deliveryFee

  return (
    <>
      <div
        className="fixed inset-0 backdrop-blur-sm bg-ai-deep/40 z-40"
        onClick={onClose}
      />
      <div role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        className="fixed right-0 top-0 h-full w-full max-w-md bg-washi shadow-lift z-50 flex flex-col border-l-4 border-ai animate-[rise_.5s_var(--ease-ink)_both]">
        <div className="flex items-center justify-between px-6 py-5 border-b border-rule">
          <div>
            <p className="eyebrow mb-1">Your Basket</p>
            <h2 id="cart-title" className="font-display text-2xl text-sumi">Shopping Cart</h2>
          </div>
          <button onClick={onClose} aria-label="Close cart" className="text-sumi-soft hover:text-shu transition">
            <X aria-hidden="true" className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {cart.length === 0 ? (
            <div className="text-center py-16">
              <Blossom centre={false} className="w-14 h-14 mx-auto mb-4 text-rule" />
              <p className="font-display text-lg text-sumi-soft">Your cart is empty</p>
            </div>
          ) : (
            <div className="divide-y divide-rule">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-4 py-5 first:pt-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-24 object-cover border border-rule bg-kinari p-1"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="flex-1">
                    <h3 className="font-display text-lg text-sumi leading-tight">{item.name}</h3>
                    <p className="text-shu font-display font-bold">
                      ${item.price}
                    </p>
                    <div className="flex items-center gap-1 mt-3">
                      <button
                        onClick={() =>
                          onUpdateQuantity(item.id, item.quantity - 1)
                        }
                        className="w-8 h-8 border border-rule text-sumi hover:border-sumi hover:bg-kinari transition"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-sm">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          onUpdateQuantity(item.id, item.quantity + 1)
                        }
                        className="w-8 h-8 border border-rule text-sumi hover:border-sumi hover:bg-kinari transition"
                      >
                        +
                      </button>
                      <button
                        onClick={() => onRemove(item.id)}
                        className="ml-auto text-xs uppercase tracking-[0.15em] text-sumi-soft hover:text-shu underline-offset-4 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t border-rule bg-kinari p-6 space-y-5">
            {/* Pickup / Delivery toggle */}
            <div>
              <p className="field-label mb-2">Fulfilment</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setDeliveryMethod('pickup')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 border text-sm font-medium transition ${
                    deliveryMethod === 'pickup'
                      ? 'bg-ai text-on-ai border-ai'
                      : 'bg-washi text-sumi-soft border-rule hover:border-ai'
                  }`}
                >
                  <Package className="w-4 h-4" />
                  Pick Up
                </button>
                <button
                  onClick={() => setDeliveryMethod('delivery')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 border text-sm font-medium transition ${
                    deliveryMethod === 'delivery'
                      ? 'bg-ai text-on-ai border-ai'
                      : 'bg-washi text-sumi-soft border-rule hover:border-ai'
                  }`}
                >
                  <Truck className="w-4 h-4" />
                  Delivery
                </button>
              </div>
              {deliveryMethod === 'delivery' && (
                <p className="text-xs text-sumi-soft mt-2">Flat rate delivery within NZ</p>
              )}
            </div>

            {/* Cost breakdown */}
            <div className="space-y-1 text-sm text-sumi-soft">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {deliveryMethod === 'delivery' && (
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span>${DELIVERY_FEE.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-baseline font-display text-xl font-bold border-t-2 border-double border-sumi pt-3">
              <span>Total:</span>
              <span className="text-shu text-2xl">${cartTotal.toFixed(2)}</span>
            </div>

            {error && (
              <div role="alert" className="text-shu-deep text-sm bg-sakura/60 border-l-2 border-shu p-3">
                {error}
              </div>
            )}
            <button
              onClick={handleCheckoutClick}
              disabled={isCheckingOut}
              className="btn-seal w-full py-4"
            >
              {isCheckingOut ? 'Processing...' : 'Proceed to Checkout'}
            </button>
          </div>
        )}
      </div>
    </>
  )
}
