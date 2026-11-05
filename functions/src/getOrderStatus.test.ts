import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest'
import { createFakeFirestore, type FakeFirestore } from './testUtils/fakeFirestore'

const mocks = vi.hoisted(() => ({
  firestoreRef: { current: null as unknown as FakeFirestore },
  retrieveSessionMock: vi.fn(),
}))

vi.mock('firebase-functions/v2/https', () => ({
  onRequest: (_opts: unknown, handler: unknown) => handler,
}))

vi.mock('firebase-functions/params', () => ({
  defineSecret: (name: string) => ({ value: () => `test-${name}` }),
}))

vi.mock('firebase-admin/firestore', () => ({
  getFirestore: () => mocks.firestoreRef.current,
}))

vi.mock('stripe', () => ({
  default: vi.fn().mockImplementation(function StripeMock() {
    return { checkout: { sessions: { retrieve: mocks.retrieveSessionMock } } }
  }),
}))

let getOrderStatus: typeof import('./getOrderStatus')['getOrderStatus']

beforeAll(async () => {
  ;({ getOrderStatus } = await import('./getOrderStatus'))
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

function seed(order: Record<string, unknown> = {}) {
  mocks.firestoreRef.current = createFakeFirestore({
    orders: {
      'order-1': {
        status: 'completed',
        userEmail: 'buyer@example.com',
        stripeSessionId: 'cs_test_1',
        stripePaymentIntentId: 'pi_test_1',
        deliveryMethod: 'delivery',
        deliveryFee: 15,
        items: [{ productId: 'juniper', name: 'Juniper Bonsai', quantity: 2, unitPrice: 40 }],
        ...order,
      },
    },
  })
}

const lookup = async (body: Record<string, unknown>) => {
  const res = createMockResponse()
  await getOrderStatus({ method: 'POST', body } as never, res as never)
  return res
}

beforeEach(() => {
  vi.clearAllMocks()
  seed()
})

describe('getOrderStatus', () => {
  it('returns the order when the session ID matches', async () => {
    const res = await lookup({ orderId: 'order-1', sessionId: 'cs_test_1' })

    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({
      status: 'completed',
      email: 'buyer@example.com',
      items: [{ name: 'Juniper Bonsai', quantity: 2, unitPrice: 40 }],
      deliveryMethod: 'delivery',
      deliveryFee: 15,
    })
  })

  it('refuses a session ID that belongs to a different checkout', async () => {
    const res = await lookup({ orderId: 'order-1', sessionId: 'cs_test_other' })

    expect(res.statusCode).toBe(404)
    expect(mocks.retrieveSessionMock).not.toHaveBeenCalled()
  })

  it('gives the same answer for an order that does not exist', async () => {
    const res = await lookup({ orderId: 'nope', sessionId: 'cs_test_1' })
    expect(res.statusCode).toBe(404)
  })

  it('asks Stripe when the session ID was never saved onto the order', async () => {
    seed({ stripeSessionId: null, status: 'pending' })
    mocks.retrieveSessionMock.mockResolvedValue({ metadata: { orderId: 'order-1' } })

    const res = await lookup({ orderId: 'order-1', sessionId: 'cs_test_1' })

    expect(mocks.retrieveSessionMock).toHaveBeenCalledWith('cs_test_1')
    expect(res.statusCode).toBe(200)
    expect(res.body).toMatchObject({ status: 'pending' })
  })

  it('refuses when Stripe says the session is for another order', async () => {
    seed({ stripeSessionId: null })
    mocks.retrieveSessionMock.mockResolvedValue({ metadata: { orderId: 'order-2' } })

    const res = await lookup({ orderId: 'order-1', sessionId: 'cs_test_1' })
    expect(res.statusCode).toBe(404)
  })

  it('rejects malformed IDs', async () => {
    const res = await lookup({ orderId: '../orders', sessionId: 'cs_test_1' })
    expect(res.statusCode).toBe(400)
  })
})
