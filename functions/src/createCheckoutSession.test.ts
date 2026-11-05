import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest'
import { createFakeFirestore, type FakeFirestore } from './testUtils/fakeFirestore'

const mocks = vi.hoisted(() => ({
  firestoreRef: { current: null as unknown as FakeFirestore },
  createSessionMock: vi.fn(),
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
  FieldValue: {
    serverTimestamp: () => '__SERVER_TIMESTAMP__',
    increment: (n: number) => ({ __increment: n }),
  },
}))

vi.mock('stripe', () => ({
  // `new Stripe(...)` requires a real constructor — an arrow-function
  // implementation can't be constructed via Reflect.construct.
  default: vi.fn().mockImplementation(function StripeMock() {
    return {
      checkout: {
        sessions: {
          create: mocks.createSessionMock,
          retrieve: mocks.retrieveSessionMock,
        },
      },
    }
  }),
}))

// Imported after the mocks above so the module under test picks them up.
let createCheckoutSession: typeof import('./createCheckoutSession')['createCheckoutSession']

beforeAll(async () => {
  ;({ createCheckoutSession } = await import('./createCheckoutSession'))
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

const JUNIPER = { name: 'Juniper Bonsai', description: 'A nice tree', price: 40, image: 'img.jpg', stock: 5 }

function seedFirestore(products: Record<string, Record<string, unknown>> = { juniper: JUNIPER }) {
  mocks.firestoreRef.current = createFakeFirestore({ products, orders: {} })
  return mocks.firestoreRef.current
}

beforeEach(() => {
  vi.clearAllMocks()
  seedFirestore()
  mocks.createSessionMock.mockResolvedValue({ id: 'cs_test_123', url: 'https://stripe.test/pay/cs_test_123' })
})

describe('createCheckoutSession', () => {
  it('rejects non-POST requests', async () => {
    const res = createMockResponse()
    await createCheckoutSession({ method: 'GET', body: {} } as never, res as never)
    expect(res.statusCode).toBe(405)
  })

  it('rejects a missing items array', async () => {
    const res = createMockResponse()
    await createCheckoutSession({ method: 'POST', body: {} } as never, res as never)
    expect(res.statusCode).toBe(400)
    expect(res.body).toEqual({ error: 'Items array is required' })
  })

  it('rejects more than 50 items', async () => {
    const res = createMockResponse()
    const items = Array.from({ length: 51 }, () => ({ productId: 'juniper', quantity: 1 }))
    await createCheckoutSession({ method: 'POST', body: { items } } as never, res as never)
    expect(res.statusCode).toBe(400)
    expect(res.body).toEqual({ error: 'Too many items in cart' })
  })

  it('rejects an item with an invalid quantity', async () => {
    const res = createMockResponse()
    const items = [{ productId: 'juniper', quantity: 0 }]
    await createCheckoutSession({ method: 'POST', body: { items } } as never, res as never)
    expect(res.statusCode).toBe(400)
    expect(res.body).toEqual({ error: 'Invalid item in cart' })
  })

  it('rejects checkout for an unknown product without naming it', async () => {
    const res = createMockResponse()
    const items = [{ productId: 'does-not-exist', quantity: 1 }]
    await createCheckoutSession({ method: 'POST', body: { items } } as never, res as never)
    expect(res.statusCode).toBe(400)
    expect(res.body).toEqual({ error: 'One or more items in your cart are unavailable' })
  })

  it('rejects checkout for an out-of-stock product without leaking its name', async () => {
    seedFirestore({ juniper: { ...JUNIPER, stock: 0 } })
    const res = createMockResponse()
    const items = [{ productId: 'juniper', quantity: 1 }]
    await createCheckoutSession({ method: 'POST', body: { items } } as never, res as never)
    expect(res.statusCode).toBe(400)
    expect(res.body).toEqual({ error: 'One or more items in your cart are unavailable' })
    expect(JSON.stringify(res.body)).not.toContain('Juniper')
  })

  it('rejects checkout when requested quantity exceeds stock', async () => {
    const res = createMockResponse()
    const items = [{ productId: 'juniper', quantity: 10 }]
    await createCheckoutSession({ method: 'POST', body: { items } } as never, res as never)
    expect(res.statusCode).toBe(400)
    expect(res.body).toEqual({ error: 'One or more items in your cart are unavailable' })
  })

  it('creates a pending order and a Stripe session for a valid cart', async () => {
    const res = createMockResponse()
    const items = [{ productId: 'juniper', quantity: 2 }]
    await createCheckoutSession(
      { method: 'POST', body: { items, userEmail: 'buyer@example.com', idempotencyKey: 'key-1' } } as never,
      res as never
    )

    expect(res.body).toEqual({ url: 'https://stripe.test/pay/cs_test_123', orderId: 'key-1' })
    expect(mocks.createSessionMock).toHaveBeenCalledTimes(1)

    const [sessionParams] = mocks.createSessionMock.mock.calls[0]
    expect(sessionParams.line_items).toEqual([
      expect.objectContaining({
        price_data: expect.objectContaining({ unit_amount: 4000 }),
        quantity: 2,
      }),
    ])
    expect(sessionParams.consent_collection).toEqual({ terms_of_service: 'required' })

    const order = mocks.firestoreRef.current.store.orders['key-1']
    expect(order).toMatchObject({
      status: 'pending',
      userEmail: 'buyer@example.com',
      stripeSessionId: 'cs_test_123',
      deliveryFee: 0,
      stockReserved: true,
    })
  })

  it('reserves stock as soon as the checkout session is created', async () => {
    const res = createMockResponse()
    await createCheckoutSession(
      { method: 'POST', body: { items: [{ productId: 'juniper', quantity: 2 }], idempotencyKey: 'key-1' } } as never,
      res as never
    )

    expect(mocks.firestoreRef.current.store.products.juniper).toMatchObject({ stock: 3, inStock: true })
  })

  it('does not let a second customer check out the last item while it is reserved', async () => {
    seedFirestore({ juniper: { ...JUNIPER, stock: 1 } })
    const items = [{ productId: 'juniper', quantity: 1 }]

    const res1 = createMockResponse()
    await createCheckoutSession({ method: 'POST', body: { items, idempotencyKey: 'first' } } as never, res1 as never)
    const res2 = createMockResponse()
    await createCheckoutSession({ method: 'POST', body: { items, idempotencyKey: 'second' } } as never, res2 as never)

    expect(res1.statusCode).toBe(200)
    expect(res2.statusCode).toBe(400)
    expect(mocks.createSessionMock).toHaveBeenCalledTimes(1)
    expect(mocks.firestoreRef.current.store.products.juniper).toMatchObject({ stock: 0, inStock: false })
    expect(mocks.firestoreRef.current.store.orders.second).toBeUndefined()
  })

  it('checks stock against the combined quantity when a product appears on several lines', async () => {
    const res = createMockResponse()
    const items = [
      { productId: 'juniper', quantity: 3 },
      { productId: 'juniper', quantity: 3 },
    ]
    await createCheckoutSession({ method: 'POST', body: { items, idempotencyKey: 'key-1' } } as never, res as never)

    expect(res.statusCode).toBe(400)
    expect(mocks.firestoreRef.current.store.products.juniper.stock).toBe(5)
  })

  it('sets the Stripe session to expire after about half an hour', async () => {
    const res = createMockResponse()
    const now = Math.floor(Date.now() / 1000)
    await createCheckoutSession(
      { method: 'POST', body: { items: [{ productId: 'juniper', quantity: 1 }], idempotencyKey: 'key-1' } } as never,
      res as never
    )

    const [sessionParams] = mocks.createSessionMock.mock.calls[0]
    expect(sessionParams.expires_at - now).toBeGreaterThanOrEqual(30 * 60)
    expect(sessionParams.expires_at - now).toBeLessThanOrEqual(32 * 60)
  })

  it('returns the reserved stock when Stripe fails to create the session', async () => {
    mocks.createSessionMock.mockRejectedValue(new Error('Stripe is down'))
    const res = createMockResponse()
    await createCheckoutSession(
      { method: 'POST', body: { items: [{ productId: 'juniper', quantity: 2 }], idempotencyKey: 'key-1' } } as never,
      res as never
    )

    expect(res.statusCode).toBe(500)
    expect(mocks.firestoreRef.current.store.products.juniper.stock).toBe(5)
    expect(mocks.firestoreRef.current.store.orders['key-1'].status).toBe('expired')
  })

  it('tells a retry of a failed attempt to start over rather than to wait', async () => {
    mocks.createSessionMock.mockRejectedValueOnce(new Error('Stripe is down'))
    const body = { items: [{ productId: 'juniper', quantity: 1 }], idempotencyKey: 'key-1' }

    await createCheckoutSession({ method: 'POST', body } as never, createMockResponse() as never)
    const res = createMockResponse()
    await createCheckoutSession({ method: 'POST', body } as never, res as never)

    expect(res.statusCode).toBe(500)
    expect(mocks.createSessionMock).toHaveBeenCalledTimes(1)
  })

  it('adds a delivery line item and shipping collection when deliveryMethod is delivery', async () => {
    const res = createMockResponse()
    const items = [{ productId: 'juniper', quantity: 1 }]
    await createCheckoutSession(
      { method: 'POST', body: { items, deliveryMethod: 'delivery', idempotencyKey: 'key-delivery' } } as never,
      res as never
    )

    const [sessionParams] = mocks.createSessionMock.mock.calls[0]
    expect(sessionParams.line_items).toHaveLength(2)
    expect(sessionParams.shipping_address_collection).toEqual({ allowed_countries: ['NZ'] })
    expect(sessionParams.custom_text.shipping_address.message).toContain('Upper Hutt, Lower Hutt and Wellington City')
    expect(mocks.firestoreRef.current.store.orders['key-delivery'].deliveryFee).toBe(15)
  })

  it('is idempotent: a retry with the same key reuses the existing session instead of creating a new one', async () => {
    const items = [{ productId: 'juniper', quantity: 1 }]

    const res1 = createMockResponse()
    await createCheckoutSession(
      { method: 'POST', body: { items, idempotencyKey: 'retry-key' } } as never,
      res1 as never
    )
    expect(mocks.createSessionMock).toHaveBeenCalledTimes(1)

    mocks.retrieveSessionMock.mockResolvedValue({ url: 'https://stripe.test/pay/cs_test_123' })

    const res2 = createMockResponse()
    await createCheckoutSession(
      { method: 'POST', body: { items, idempotencyKey: 'retry-key' } } as never,
      res2 as never
    )

    // No second Stripe Checkout Session should be created for the same idempotency key.
    expect(mocks.createSessionMock).toHaveBeenCalledTimes(1)
    expect(mocks.retrieveSessionMock).toHaveBeenCalledWith('cs_test_123')
    expect(res2.body).toEqual({ url: 'https://stripe.test/pay/cs_test_123', orderId: 'retry-key' })
  })

  it('falls back to a generated key when the client idempotency key is malformed', async () => {
    const res = createMockResponse()
    const items = [{ productId: 'juniper', quantity: 1 }]
    await createCheckoutSession(
      { method: 'POST', body: { items, idempotencyKey: 'not valid! key' } } as never,
      res as never
    )

    const orderIds = Object.keys(mocks.firestoreRef.current.store.orders)
    expect(orderIds).toHaveLength(1)
    expect(orderIds[0]).not.toBe('not valid! key')
  })
})
