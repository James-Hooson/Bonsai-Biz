import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest'
import { createFakeFirestore, type FakeFirestore } from './testUtils/fakeFirestore'

const mocks = vi.hoisted(() => ({
  firestoreRef: { current: null as unknown as FakeFirestore },
  constructEventMock: vi.fn(),
  retrieveSessionMock: vi.fn(),
  sendMailMock: vi.fn(),
}))

vi.mock('nodemailer', () => ({
  default: { createTransport: () => ({ sendMail: mocks.sendMailMock }) },
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
  mocks.sendMailMock.mockResolvedValue({})
})

const completedEvent = {
  type: 'checkout.session.completed',
  data: { object: { id: 'cs_test_1', metadata: { orderId: 'order-1' } } },
}

function seedReservedOrder(order: Record<string, unknown> = {}) {
  mocks.firestoreRef.current = createFakeFirestore({
    orders: {
      'order-1': {
        status: 'pending',
        stockReserved: true,
        deliveryMethod: 'pickup',
        deliveryFee: 0,
        items: [{ productId: 'juniper', name: 'Juniper Bonsai', quantity: 2, unitPrice: 40 }],
        ...order,
      },
    },
    // Stock already reduced from 5 by the checkout's reservation.
    products: { juniper: { name: 'Juniper Bonsai', stock: 3, inStock: true } },
  })
}

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

  it('marks the order completed and deducts stock for an order placed before stock reservations', async () => {
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

  it('does not deduct stock again for an order that reserved it at checkout', async () => {
    seedReservedOrder()
    mocks.constructEventMock.mockReturnValue(completedEvent)

    await stripeWebhook(createMockRequest() as never, createMockResponse() as never)

    expect(mocks.firestoreRef.current.store.orders['order-1'].status).toBe('completed')
    expect(mocks.firestoreRef.current.store.products.juniper.stock).toBe(3)
  })

  it('emails the shop and the customer once, even when the event is redelivered', async () => {
    seedReservedOrder()
    mocks.constructEventMock.mockReturnValue(completedEvent)

    await stripeWebhook(createMockRequest() as never, createMockResponse() as never)
    await stripeWebhook(createMockRequest() as never, createMockResponse() as never)

    expect(mocks.sendMailMock).toHaveBeenCalledTimes(2)
    const recipients = mocks.sendMailMock.mock.calls.map(([mail]) => mail.to)
    expect(recipients).toEqual(expect.arrayContaining(['zenoasisnz@gmail.com', 'buyer@example.com']))
  })

  it('includes the delivery fee and address in the order emails', async () => {
    seedReservedOrder({ deliveryMethod: 'delivery', deliveryFee: 15 })
    mocks.retrieveSessionMock.mockResolvedValue({
      id: 'cs_test_1',
      payment_intent: 'pi_test_1',
      customer_details: { email: 'buyer@example.com' },
      shipping_details: {
        name: 'Jane Doe',
        address: { line1: '123 Fern St', line2: null, city: 'Auckland', state: null, postal_code: '1010', country: 'NZ' },
      },
    })
    mocks.constructEventMock.mockReturnValue(completedEvent)

    await stripeWebhook(createMockRequest() as never, createMockResponse() as never)

    const customerMail = mocks.sendMailMock.mock.calls.map(([mail]) => mail).find((m) => m.to === 'buyer@example.com')
    expect(customerMail.text).toContain('Delivery  $15.00')
    expect(customerMail.text).toContain('Total (NZD)  $95.00')
    expect(customerMail.text).toContain('123 Fern St')
  })

  it('still completes the order when sending email fails', async () => {
    seedReservedOrder()
    mocks.sendMailMock.mockRejectedValue(new Error('SMTP down'))
    mocks.constructEventMock.mockReturnValue(completedEvent)

    const res = createMockResponse()
    await stripeWebhook(createMockRequest() as never, res as never)

    expect(res.statusCode).toBe(200)
    expect(mocks.firestoreRef.current.store.orders['order-1'].status).toBe('completed')
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

  it('returns reserved stock when a checkout session expires, but only once', async () => {
    seedReservedOrder()
    mocks.constructEventMock.mockReturnValue({
      type: 'checkout.session.expired',
      data: { object: { metadata: { orderId: 'order-1' } } },
    })

    await stripeWebhook(createMockRequest() as never, createMockResponse() as never)
    await stripeWebhook(createMockRequest() as never, createMockResponse() as never)

    expect(mocks.firestoreRef.current.store.orders['order-1'].status).toBe('expired')
    expect(mocks.firestoreRef.current.store.products.juniper).toMatchObject({ stock: 5, inStock: true })
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

  it('returns 500 so Stripe retries when the order cannot be updated', async () => {
    seedReservedOrder()
    mocks.retrieveSessionMock.mockRejectedValueOnce(new Error('Stripe API unavailable'))
    mocks.constructEventMock.mockReturnValue(completedEvent)

    const res1 = createMockResponse()
    await stripeWebhook(createMockRequest() as never, res1 as never)
    expect(res1.statusCode).toBe(500)
    expect(mocks.firestoreRef.current.store.orders['order-1'].status).toBe('pending')

    // Stripe's retry then completes the order.
    const res2 = createMockResponse()
    await stripeWebhook(createMockRequest() as never, res2 as never)
    expect(res2.statusCode).toBe(200)
    expect(mocks.firestoreRef.current.store.orders['order-1'].status).toBe('completed')
  })

  it('leaves the order pending when checkout completes but payment has not arrived yet', async () => {
    seedReservedOrder()
    mocks.retrieveSessionMock.mockResolvedValue({
      id: 'cs_test_1',
      payment_status: 'unpaid',
      payment_intent: 'pi_test_1',
      customer_details: { email: 'buyer@example.com' },
      shipping_details: null,
    })
    mocks.constructEventMock.mockReturnValue(completedEvent)

    const res = createMockResponse()
    await stripeWebhook(createMockRequest() as never, res as never)

    expect(res.statusCode).toBe(200)
    expect(mocks.firestoreRef.current.store.orders['order-1'].status).toBe('pending')
    expect(mocks.sendMailMock).not.toHaveBeenCalled()
  })

  it('completes the order when a delayed payment succeeds', async () => {
    seedReservedOrder()
    mocks.retrieveSessionMock.mockResolvedValue({
      id: 'cs_test_1',
      payment_status: 'paid',
      payment_intent: 'pi_test_1',
      customer_details: { email: 'buyer@example.com' },
      shipping_details: null,
    })
    mocks.constructEventMock.mockReturnValue({ ...completedEvent, type: 'checkout.session.async_payment_succeeded' })

    await stripeWebhook(createMockRequest() as never, createMockResponse() as never)

    expect(mocks.firestoreRef.current.store.orders['order-1'].status).toBe('completed')
    expect(mocks.firestoreRef.current.store.products.juniper.stock).toBe(3)
  })

  it('returns reserved stock when a delayed payment fails', async () => {
    seedReservedOrder()
    mocks.constructEventMock.mockReturnValue({
      type: 'checkout.session.async_payment_failed',
      data: { object: { metadata: { orderId: 'order-1' } } },
    })

    await stripeWebhook(createMockRequest() as never, createMockResponse() as never)

    expect(mocks.firestoreRef.current.store.orders['order-1'].status).toBe('expired')
    expect(mocks.firestoreRef.current.store.products.juniper).toMatchObject({ stock: 5, inStock: true })
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
