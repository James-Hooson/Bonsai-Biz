import React from 'react'
import { Link } from 'react-router-dom'
import { Header } from './Header'
import { PageHero } from './PageHero'
import { Footer } from './Footer'
import type { PageProps } from '../types'

const LAST_UPDATED = '4 November 2026'

const inlineLink =
  'text-shu hover:text-shu-deep font-medium underline decoration-shu/30 underline-offset-4'

// Fixed legal text: edit here (not through the admin editor) so changes are reviewed in code.
const sections: { title: string; body: React.ReactNode }[] = [
  {
    title: 'About us',
    body: (
      <>
        <p>
          This website is operated by Cool Beanz Limited trading as Zen Oasis (NZ company number
          9276039, NZBN 9429052343995), based in Wellington, New Zealand. You can contact us at{' '}
          <a href="mailto:zenoasisnz@gmail.com" className={inlineLink}>
            zenoasisnz@gmail.com
          </a>
          , 027 977 2954, or PO Box [number], Wellington [postcode].
        </p>
        <p>These terms apply to every order placed through this website. By placing an order, you agree to them.</p>
      </>
    ),
  },
  {
    title: 'Products',
    body: (
      <p>
        We sell bonsai trees, aquascaping supplies and ornaments. Bonsai and other live plants are
        natural products, so each one is unique. Size, shape, colour and foliage may differ slightly
        from the photos, and plants may change with the seasons (for example, deciduous trees drop
        their leaves in autumn and winter).
      </p>
    ),
  },
  {
    title: 'Prices',
    body: (
      <>
        <p>
          All prices are in New Zealand dollars (NZD). We are not registered for GST, so no GST is
          charged. Delivery charges are shown at checkout before you pay. We may change prices at any
          time, but changes do not affect orders already confirmed.
        </p>
        <p>
          If we make an obvious pricing error, we will contact you before sending your order and offer
          you the choice to pay the correct price or cancel for a full refund.
        </p>
      </>
    ),
  },
  {
    title: 'Orders and payment',
    body: (
      <>
        <p>
          Payments are processed securely by Stripe. We never see or store your full card details.
          Your order is confirmed once payment succeeds and you see our order confirmation.
        </p>
        <p>
          If an item turns out to be unavailable after you order, we will contact you and give you a
          full refund for that item.
        </p>
      </>
    ),
  },
  {
    title: 'Delivery and pickup',
    body: (
      <ul className="list-disc pl-5 space-y-2">
        <li>
          We deliver to Upper Hutt, Lower Hutt and Wellington City only. We can't deliver anywhere
          else in New Zealand or overseas.
        </li>
        <li>
          If you place an order with a delivery address outside our delivery area, we will contact you
          and offer pickup instead, or cancel the order with a full refund.
        </li>
        <li>
          We deliver orders ourselves. Delivery is a flat fee of $15, added at checkout. Orders are
          usually delivered within 7 working days of payment, although this may change at busy times.
        </li>
        <li>
          To protect live plants, we may hold deliveries over weekends, public holidays or extreme
          weather. If this happens, we will let you know.
        </li>
        <li>
          Pickup is available within the Wellington region. After you order, we will email you to
          arrange a pickup time and place.
        </li>
        <li>
          Please make sure your delivery address is correct. If an order can't be delivered because
          the address you gave was wrong, we may charge the cost of re-delivering it.
        </li>
        <li>Risk passes to you once the order is delivered to your address, or once you collect it.</li>
      </ul>
    ),
  },
  {
    title: 'Damaged or faulty items',
    body: (
      <>
        <p>
          We pack every item carefully. If something arrives damaged or faulty, please email us within
          48 hours of delivery with your order number and photos of the item and its packaging.
          Telling us quickly helps us sort it out fast, especially with live plants. If you only notice
          a problem later, please still contact us, because your rights under the Consumer Guarantees
          Act still apply.
        </p>
        <p>
          If an item is faulty or not as described, we will repair, replace or refund it as the
          Consumer Guarantees Act requires. We cover the reasonable cost of returning faulty items.
        </p>
      </>
    ),
  },
  {
    title: 'Plant care after delivery',
    body: (
      <p>
        Once a healthy plant has been delivered, its ongoing health depends on its care: light,
        watering, temperature and placement. We provide care guidance on our{' '}
        <Link to="/care-guide" className={inlineLink}>
          Care Guide
        </Link>{' '}
        page and are happy to help by email. We are not responsible for a plant declining because of
        care conditions after delivery. This does not limit your rights under the Consumer Guarantees
        Act.
      </p>
    ),
  },
  {
    title: 'Change-of-mind returns',
    body: (
      <p>
        We accept change-of-mind returns for unused, non-living items (such as ornaments and
        aquascaping supplies) in their original packaging within 14 days of delivery or pickup. Please
        contact us first. You pay the return shipping. Live plants can't be returned for change of
        mind.
      </p>
    ),
  },
  {
    title: 'Your consumer rights',
    body: (
      <p>
        Nothing in these terms limits your rights under the Consumer Guarantees Act 1993, the Fair
        Trading Act 1986, or any other New Zealand consumer protection law. If you are buying for
        business purposes, you agree that the Consumer Guarantees Act does not apply, to the extent
        the law allows.
      </p>
    ),
  },
  {
    title: 'Liability',
    body: (
      <p>
        To the extent permitted by law, and except for our obligations under the Consumer Guarantees
        Act, we are not liable for any indirect or consequential loss arising from your use of this
        website or our products. Our total liability for any order is limited to the price you paid
        for it.
      </p>
    ),
  },
  {
    title: 'Privacy',
    body: <p>We handle your personal information as described in our Privacy Policy.</p>,
  },
  {
    title: 'Changes to these terms',
    body: (
      <p>
        We may update these terms from time to time. The version shown on this page when you place
        your order applies to that order.
      </p>
    ),
  },
  {
    title: 'Governing law',
    body: (
      <p>
        These terms are governed by New Zealand law. Disputes are subject to the jurisdiction of New
        Zealand courts and the Disputes Tribunal.
      </p>
    ),
  },
]

export const Terms: React.FC<PageProps> = ({ user, isAuthenticated, onLogout }) => (
  <div className="min-h-screen flex flex-col">
    <Header user={isAuthenticated ? user : null} onLogout={onLogout} />

    <PageHero
      eyebrow="Ordering · Delivery · Returns"
      title="Terms & Conditions"
      lede={`Last updated: ${LAST_UPDATED}`}
    />

    <main className="flex-1 max-w-page w-full mx-auto px-gutter py-20">
      <ol className="max-w-3xl border-t border-sumi">
        {sections.map(({ title, body }, i) => (
          <li key={title} className="py-10 border-b border-rule">
            <h2 className="text-headline text-sumi mb-4">
              <span aria-hidden="true" className="font-display text-rule mr-4">
                {String(i + 1).padStart(2, '0')}
              </span>
              {title}
            </h2>
            <div className="space-y-4 text-sumi-soft leading-relaxed">{body}</div>
          </li>
        ))}
      </ol>
    </main>

    <Footer />
  </div>
)

export default Terms
