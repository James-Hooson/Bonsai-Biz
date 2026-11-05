import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { OrderSuccess } from './OrderSuccess'

const pageProps = {
  user: undefined,
  isAuthenticated: false,
  isLoading: false,
  firebaseReady: true,
  onLogin: () => {},
  onLogout: () => {},
}

function renderAt(url: string) {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <OrderSuccess {...pageProps} />
    </MemoryRouter>
  )
}

function mockLookup(status: number, body: unknown) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('OrderSuccess', () => {
  it('shows a verified receipt with the order reference and delivery in the total', async () => {
    const fetchMock = mockLookup(200, {
      status: 'completed',
      email: 'buyer@example.com',
      items: [{ name: 'Juniper Bonsai', quantity: 2, unitPrice: 40 }],
      deliveryMethod: 'delivery',
      deliveryFee: 15,
    })

    renderAt('/success?order_id=order-1&session_id=cs_test_1')

    expect(await screen.findByText('Order Confirmed!')).toBeInTheDocument()
    expect(screen.getByText('order-1')).toBeInTheDocument()
    expect(screen.getByText('$95.00')).toBeInTheDocument()
    expect(screen.getByText(/confirmation has been sent to buyer@example.com/)).toBeInTheDocument()
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ orderId: 'order-1', sessionId: 'cs_test_1' })
  })

  it('does not claim the order is confirmed when it cannot be verified', async () => {
    mockLookup(404, { error: 'Order not found' })

    renderAt('/success?order_id=made-up&session_id=cs_test_1')

    expect(await screen.findByText('Order Not Found')).toBeInTheDocument()
    expect(screen.queryByText('Order Confirmed!')).not.toBeInTheDocument()
  })

  it('does not look anything up without the session ID from Stripe', () => {
    const fetchMock = mockLookup(200, {})

    renderAt('/success?order_id=order-1')

    expect(screen.getByText('Order Not Found')).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('shows payment processing while the order is still pending', async () => {
    mockLookup(200, {
      status: 'pending',
      email: null,
      items: [],
      deliveryMethod: 'pickup',
      deliveryFee: 0,
    })

    renderAt('/success?order_id=order-1&session_id=cs_test_1')

    expect(await screen.findByText('Please wait while we confirm your payment.')).toBeInTheDocument()
  })
})
