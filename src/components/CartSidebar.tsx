import React from 'react'
import { X } from 'lucide-react'
import type { CartItem } from '../types'

interface CartSidebarProps {
  cart: CartItem[]
  onClose: () => void
  onUpdateQuantity: (id: string, quantity: number) => void
  onRemove: (id: string) => void
  onCheckout: () => Promise<void>
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

  const handleCheckoutClick = async () => {
    setIsCheckingOut(true)
    setError(null)
    try {
      await onCheckout()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Checkout failed'
      console.error('Checkout error:', err)
      setError(message)
      setIsCheckingOut(false)
    }
  }
  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  )

  return (
    <>
      <div
        className="fixed inset-0 backdrop-blur-sm bg-white/30 z-40"
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">Shopping Cart</h2>
          <button onClick={onClose}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {cart.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Your cart is empty
            </p>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-4 border-b pb-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-green-600 font-bold">
                      ${item.price}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() =>
                          onUpdateQuantity(item.id, item.quantity - 1)
                        }
                        className="w-8 h-8 border rounded hover:bg-gray-100"
                      >
                        -
                      </button>
                      <span className="w-8 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          onUpdateQuantity(item.id, item.quantity + 1)
                        }
                        className="w-8 h-8 border rounded hover:bg-gray-100"
                      >
                        +
                      </button>
                      <button
                        onClick={() => onRemove(item.id)}
                        className="ml-auto text-red-600 hover:text-red-700"
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
          <div className="border-t p-6 space-y-4">
            <div className="flex justify-between text-xl font-bold">
              <span>Total:</span>
              <span className="text-green-600">
                ${cartTotal.toFixed(2)}
              </span>
            </div>
            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded">
                {error}
              </div>
            )}
            <button
              onClick={handleCheckoutClick}
              disabled={isCheckingOut}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isCheckingOut ? 'Processing...' : 'Proceed to Checkout'}
            </button>
          </div>
        )}
      </div>
    </>
  )
}
