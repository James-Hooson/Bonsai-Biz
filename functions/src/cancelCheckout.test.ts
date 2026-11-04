import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest'
import { createFakeFirestore, type FakeFirestore } from './testUtils/fakeFirestore'

const mocks = vi.hoisted(() => ({
  firestoreRef: { current: null as unknown as FakeFirestore },
  expireSessionMock: vi.fn(),
}))

vi.mock('firebase-functions/v2/https', () => ({
  onRequest: (_opts: unknown, handler: unknown) => handler,
}))

vi.mock('firebase-functions/params', () => ({
  defineSecret: (name: string) => ({ value: () => `test-${name}` }),
}))

vi.mock('firebase-admin', () => {
  const FieldValue = { serverTimestamp: () => '__SERVER_TIMESTAMP__' }
  const firestoreFn = Object.assign(() => mocks.firestoreRef.current, { FieldValue })
  return { initializeApp: vi.fn(), firestore: firestoreFn }
})

vi.mock('stripe', () => ({
  default: vi.fn().mockImplementation(function StripeMock() {
    return { checkout: { sessions: { expire: mocks.expireSessionMock } } }
  }),
}))

let cancelCheckout: typeof import('./cancelCheckout')['cancelCheckout']

beforeAll(async () => {
  ;({ cancelCheckout } = await import('./cancelCheckout'))
})

function createMockResponse() {
  const res = {
    statusCode: 200,
    body: undefined as unknown,
    status(code: number) {
      res.statusCode = code
      return res
    },
    json(payload: unknown) {
      res.body = payload
      return res
    },
  }
  return res
}

function seed(orderStatus: string) {
  mocks.firestoreRef.current = createFakeFirestore({
    orders: {
      'order-1': {
        status: orderStatus,
        stockReserved: true,
        stripeSessionId: 'cs_test_1',
        items: [{ productId: 'juniper', quantity: 1 }],
      },
    },
    products: { juniper: { stock: 0, inStock: false } },
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  seed('pending')
  mocks.expireSessionMock.mockResolvedValue({})
})

describe('cancelCheckout', () => {
  it('rejects a malformed order ID', async () => {
    const res = createMockResponse()
    await cancelCheckout({ method: 'POST', body: { orderId: '../x' } } as never, res as never)
    expect(res.statusCode).toBe(400)
  })

  it('expires the Stripe session and returns the reserved stock', async () => {
    const res = createMockResponse()
    await cancelCheckout({ method: 'POST', body: { orderId: 'order-1' } } as never, res as never)

    expect(mocks.expireSessionMock).toHaveBeenCalledWith('cs_test_1')
    expect(res.body).toEqual({ cancelled: true })
    expect(mocks.firestoreRef.current.store.orders['order-1'].status).toBe('expired')
    expect(mocks.firestoreRef.current.store.products.juniper).toMatchObject({ stock: 1, inStock: true })
  })

  it('leaves the stock reserved if Stripe will not expire the session (e.g. it was just paid)', async () => {
    mocks.expireSessionMock.mockRejectedValue(new Error('session is complete'))
    const res = createMockResponse()
    await cancelCheckout({ method: 'POST', body: { orderId: 'order-1' } } as never, res as never)

    expect(res.body).toEqual({ cancelled: false })
    expect(mocks.firestoreRef.current.store.orders['order-1'].status).toBe('pending')
    expect(mocks.firestoreRef.current.store.products.juniper.stock).toBe(0)
  })

  it('does nothing for an order that is no longer pending', async () => {
    seed('completed')
    const res = createMockResponse()
    await cancelCheckout({ method: 'POST', body: { orderId: 'order-1' } } as never, res as never)

    expect(mocks.expireSessionMock).not.toHaveBeenCalled()
    expect(res.body).toEqual({ cancelled: false })
  })
})
