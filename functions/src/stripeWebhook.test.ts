import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest'
import { createFakeFirestore, type FakeFirestore } from './testUtils/fakeFirestore'

const mocks = vi.hoisted(() => ({
  firestoreRef: { current: null as unknown as FakeFirestore },
  constructEventMock: vi.fn(),
  retrieveSessionMock: vi.fn(),
}))

vi.mock('firebase-functions/v2/https', () => ({
  onRequest: (_opts: unknown, handler: unknown) => handler,
}))

vi.mock('firebase-functions/params', () => ({
  defineSecret: (name: string) => ({ value: () => `test-${name}` }),
}))

vi.mock('firebase-admin', () => {
  const FieldValue = {
    serverTimestamp: () => '__SERVER_TIMESTAMP__',
    increment: (n: number) => ({ __increment: n }),
  }
  const firestoreFn = Object.assign(() => mocks.firestoreRef.current, { FieldValue })
  return {
    initializeApp: vi.fn(),
    firestore: firestoreFn,
  }
})

vi.mock('stripe', () => ({
  default: vi.fn().mockImplementation(function StripeMock() {
    return {
      webhooks: { constructEvent: mocks.constructEventMock },
      checkout: { sessions: { retrieve: mocks.retrieveSessionMock } },
    }
  }),
}))

let stripeWebhook: typeof import('./stripeWebhook')['stripeWebhook']

beforeAll(async () => {
  ;({ stripeWebhook } = await import('./stripeWebhook'))
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
    send(payload: unknown) {
      res.body = payload
      return res
    },
  }
  return res
}

function createMockRequest(overrides: { rawBody?: Buffer } = {}) {
  return {
    headers: { 'stripe-signature': 'test-sig' },
    rawBody: 'rawBody' in overrides ? overrides.rawBody : Buffer.from('{}'),
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  mocks.firestoreRef.current = createFakeFirestore({
    orders: {
      'order-1': {
        status: 'pending',
        items: [{ productId: 'juniper', quantity: 2 }],
      },
    },
    products: {
      juniper: { name: 'Juniper Bonsai', stock: 5, inStock: true },
    },
  })
  mocks.retrieveSessionMock.mockResolvedValue({
    id: 'cs_test_1',
    payment_intent: 'pi_test_1',
    customer_details: { email: 'buyer@example.com' },
    shipping_details: null,
  })
})

describe('stripeWebhook', () => {
  it('rejects requests with no raw body', async () => {
    const res = createMockResponse()
    await stripeWebhook(createMockRequest({ rawBody: undefined as never }) as never, res as never)
    expect(res.statusCode).toBe(400)
  })

  it('rejects an invalid signature', async () => {
    mocks.constructEventMock.mockImplementation(() => {
      throw new Error('bad signature')
    })
    const res = createMockResponse()
    await stripeWebhook(createMockRequest() as never, res as never)
    expect(res.statusCode).toBe(400)
    expect(res.body).toContain('bad signature')
  })

  it('marks the order completed and deducts stock on checkout.session.completed', async () => {
    mocks.constructEventMock.mockReturnValue({
      type: 'checkout.session.completed',
      data: { object: { id: 'cs_test_1', metadata: { orderId: 'order-1' } } },
    })

    const res = createMockResponse()
    await stripeWebhook(createMockRequest() as never, res as never)

    expect(res.statusCode).toBe(200)
    const order = mocks.firestoreRef.current.store.orders['order-1']
    expect(order).toMatchObject({
      status: 'completed',
      stripePaymentIntentId: 'pi_test_1',
      userEmail: 'buyer@example.com',
    })

    const product = mocks.firestoreRef.current.store.products.juniper
    expect(product).toMatchObject({ stock: 3, inStock: true })
  })

  it('does not deduct stock twice when the same event is redelivered', async () => {
    mocks.constructEventMock.mockReturnValue({
      type: 'checkout.session.completed',
      data: { object: { id: 'cs_test_1', metadata: { orderId: 'order-1' } } },
    })

    const res1 = createMockResponse()
    await stripeWebhook(createMockRequest() as never, res1 as never)
    expect(mocks.firestoreRef.current.store.products.juniper.stock).toBe(3)

    // Stripe redelivers the same event (e.g. because the first ack was lost in transit).
    const res2 = createMockResponse()
    await stripeWebhook(createMockRequest() as never, res2 as never)

    expect(res2.statusCode).toBe(200)
    // Stock must still be 3, not 1 — the transaction's status==='completed' guard
    // should have skipped the second deduction entirely.
    expect(mocks.firestoreRef.current.store.products.juniper.stock).toBe(3)
  })

  it('records shipping details when present', async () => {
    mocks.retrieveSessionMock.mockResolvedValue({
      id: 'cs_test_1',
      payment_intent: 'pi_test_1',
      customer_details: { email: 'buyer@example.com' },
      shipping_details: {
        name: 'Jane Doe',
        address: { line1: '123 Fern St', line2: null, city: 'Auckland', state: null, postal_code: '1010', country: 'NZ' },
      },
    })
    mocks.constructEventMock.mockReturnValue({
      type: 'checkout.session.completed',
      data: { object: { id: 'cs_test_1', metadata: { orderId: 'order-1' } } },
    })

    const res = createMockResponse()
    await stripeWebhook(createMockRequest() as never, res as never)

    const order = mocks.firestoreRef.current.store.orders['order-1']
    expect(order.shippingAddress).toMatchObject({ name: 'Jane Doe', city: 'Auckland', postalCode: '1010' })
  })

  it('marks a pending order expired on checkout.session.expired', async () => {
    mocks.constructEventMock.mockReturnValue({
      type: 'checkout.session.expired',
      data: { object: { metadata: { orderId: 'order-1' } } },
    })

    const res = createMockResponse()
    await stripeWebhook(createMockRequest() as never, res as never)

    expect(res.statusCode).toBe(200)
    expect(mocks.firestoreRef.current.store.orders['order-1'].status).toBe('expired')
  })

  it('does not overwrite an already-completed order on a stray checkout.session.expired', async () => {
    mocks.firestoreRef.current = createFakeFirestore({
      orders: { 'order-1': { status: 'completed' } },
    })
    mocks.constructEventMock.mockReturnValue({
      type: 'checkout.session.expired',
      data: { object: { metadata: { orderId: 'order-1' } } },
    })

    const res = createMockResponse()
    await stripeWebhook(createMockRequest() as never, res as never)

    expect(res.statusCode).toBe(200)
    expect(mocks.firestoreRef.current.store.orders['order-1'].status).toBe('completed')
  })

  it('returns 200 for event types it does not handle', async () => {
    mocks.constructEventMock.mockReturnValue({
      type: 'payment_intent.created',
      data: { object: {} },
    })

    const res = createMockResponse()
    await stripeWebhook(createMockRequest() as never, res as never)

    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({ received: true })
  })
})
