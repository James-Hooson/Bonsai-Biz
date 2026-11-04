import { createMailTransport, SENDER_EMAIL, SHOP_EMAIL } from './email'

export interface CompletedOrder {
  id: string
  userEmail: string | null
  items: Array<{ name: string; quantity: number; unitPrice: number }>
  deliveryMethod: 'pickup' | 'delivery'
  deliveryFee: number
  shippingAddress?: {
    name: string | null
    line1: string | null
    line2: string | null
    city: string | null
    state: string | null
    postalCode: string | null
    country: string | null
  }
}

const money = (amount: number) => `$${amount.toFixed(2)}`

function orderSummary(order: CompletedOrder): string {
  const lines = order.items.map(
    (item) => `${item.name} x${item.quantity}  ${money(item.unitPrice * item.quantity)}`,
  )
  if (order.deliveryFee > 0) lines.push(`Delivery  ${money(order.deliveryFee)}`)
  const total = order.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0) + order.deliveryFee
  lines.push('', `Total (NZD)  ${money(total)}`)
  return lines.join('\n')
}

function addressBlock(order: CompletedOrder): string {
  const a = order.shippingAddress
  if (!a) return 'Address not captured. Check the order in Stripe.'
  return [a.name, a.line1, a.line2, [a.city, a.state, a.postalCode].filter(Boolean).join(' '), a.country]
    .filter(Boolean)
    .join('\n')
}

function customerEmailText(order: CompletedOrder): string {
  const fulfilment =
    order.deliveryMethod === 'delivery'
      ? `We'll deliver your order to:\n${addressBlock(order)}`
      : "You chose pickup. We'll be in touch to arrange a time."
  return [
    'Thank you for your order with Zen Oasis!',
    '',
    `Order reference: ${order.id}`,
    '',
    orderSummary(order),
    '',
    fulfilment,
    '',
    'If you have any questions, just reply to this email.',
  ].join('\n')
}

function shopEmailText(order: CompletedOrder): string {
  return [
    `New paid order from ${order.userEmail ?? 'unknown email'}`,
    '',
    `Order reference: ${order.id}`,
    `Fulfilment: ${order.deliveryMethod}`,
    '',
    orderSummary(order),
    ...(order.deliveryMethod === 'delivery' ? ['', 'Deliver to:', addressBlock(order)] : []),
  ].join('\n')
}

// Sends the customer's confirmation and the shop's new-order alert. Each is
// attempted independently so one failing doesn't stop the other; failures are
// logged rather than thrown because the payment itself has already succeeded.
export async function sendOrderEmails(order: CompletedOrder): Promise<void> {
  const transporter = createMailTransport()
  const sends: Array<Promise<unknown>> = [
    transporter.sendMail({
      from: `Zen Oasis Orders <${SENDER_EMAIL}>`,
      to: SHOP_EMAIL,
      ...(order.userEmail && { replyTo: order.userEmail }),
      subject: `New order: ${order.items.map((item) => item.name).join(', ')}`,
      text: shopEmailText(order),
    }),
  ]
  if (order.userEmail) {
    sends.push(
      transporter.sendMail({
        from: `Zen Oasis <${SENDER_EMAIL}>`,
        to: order.userEmail,
        replyTo: SHOP_EMAIL,
        subject: 'Your Zen Oasis order is confirmed',
        text: customerEmailText(order),
      }),
    )
  }

  const results = await Promise.allSettled(sends)
  results.forEach((result, i) => {
    if (result.status === 'rejected') {
      const which = i === 0 ? 'shop alert' : 'customer confirmation'
      console.error(`Failed to send ${which} for order ${order.id}:`, result.reason)
    }
  })
}
