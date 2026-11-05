import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { CartSidebar } from './CartSidebar'
import type { CartItem } from '../types'

const noop = () => {}

describe('CartSidebar', () => {
  it('shows an empty state when the cart has no items', () => {
    render(
      <CartSidebar
        cart={[]}
        onClose={noop}
        onUpdateQuantity={noop}
        onRemove={noop}
        onCheckout={vi.fn()}
      />
    )

    expect(screen.getByText('Your cart is empty')).toBeInTheDocument()
  })

  it('renders cart items and the correct total', () => {
    const cart: CartItem[] = [
      {
        id: '1',
        name: 'Juniper Bonsai',
        price: 40,
        image: '',
        mainCategory: 'bonsai',
        inStock: true,
        stock: 3,
        description: 'A juniper bonsai tree',
        quantity: 2,
      },
    ]

    render(
      <CartSidebar
        cart={cart}
        onClose={noop}
        onUpdateQuantity={noop}
        onRemove={noop}
        onCheckout={vi.fn()}
      />
    )

    expect(screen.getByText('Juniper Bonsai')).toBeInTheDocument()
    // Subtotal and total both read $80.00 here since pickup (the default) has no delivery fee.
    expect(screen.getAllByText('$80.00')).toHaveLength(2)
  })

  it('stops the quantity going above the stock available', () => {
    const onUpdateQuantity = vi.fn()
    const cart: CartItem[] = [
      {
        id: '1',
        name: 'Juniper Bonsai',
        price: 40,
        image: '',
        mainCategory: 'bonsai',
        inStock: true,
        stock: 2,
        description: 'A juniper bonsai tree',
        quantity: 2,
      },
    ]

    render(
      <CartSidebar
        cart={cart}
        onClose={noop}
        onUpdateQuantity={onUpdateQuantity}
        onRemove={noop}
        onCheckout={vi.fn()}
      />
    )

    const addButton = screen.getByRole('button', { name: 'Add another Juniper Bonsai' })
    expect(addButton).toBeDisabled()
    fireEvent.click(addButton)
    expect(onUpdateQuantity).not.toHaveBeenCalled()
    expect(screen.getByText('Only 2 available')).toBeInTheDocument()
  })
})
