import React from 'react'
import { LegalPage, inlineLink, type LegalSection } from './LegalPage'
import type { PageProps } from '../types'

const LAST_UPDATED = '4 November 2026'

const providers = [
  { name: 'Stripe', role: 'Payment processing', location: 'United States and other countries' },
  { name: 'Google Firebase', role: 'Website hosting and order database', location: 'United States and other countries' },
  { name: 'Google (Gmail)', role: 'Contact form emails', location: 'United States and other countries' },
]

const sections: LegalSection[] = [
  {
    title: 'What we collect',
    body: (
      <>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong className="text-sumi">When you place an order:</strong> your name, email address,
            phone number, delivery address, the items you bought, and whether you chose delivery or
            pickup.
          </li>
          <li>
            <strong className="text-sumi">When you use our contact form:</strong> your name, email
            address and your message.
          </li>
          <li>
            <strong className="text-sumi">Payment details:</strong> your card details go straight to
            Stripe. We never see or store your full card number.
          </li>
        </ul>
        <p>We only collect information that we need for the purposes below.</p>
      </>
    ),
  },
  {
    title: 'Why we collect it',
    body: (
      <>
        <ul className="list-disc pl-5 space-y-2">
          <li>To process, deliver and support your orders</li>
          <li>To reply to your questions and messages</li>
          <li>To keep business, accounting and tax records as required by law</li>
          <li>To prevent fraud and keep the website secure</li>
        </ul>
        <p>We do not sell your information or use it for marketing without your consent.</p>
      </>
    ),
  },
  {
    title: 'Who we share it with',
    body: (
      <>
        <p>
          We share your information only with the service providers who help us run the business, and
          only as much as they need:
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-t border-rule">
            <thead className="text-sumi">
              <tr className="border-b border-rule">
                <th className="py-3 pr-4 font-medium">Provider</th>
                <th className="py-3 pr-4 font-medium">What it does</th>
                <th className="py-3 font-medium">Where data may be stored</th>
              </tr>
            </thead>
            <tbody>
              {providers.map((p) => (
                <tr key={p.name} className="border-b border-rule">
                  <td className="py-3 pr-4 text-sumi">{p.name}</td>
                  <td className="py-3 pr-4">{p.role}</td>
                  <td className="py-3">{p.location}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Some of these providers store information outside New Zealand. We use well-established
          providers that are bound by privacy and security obligations comparable to those under New
          Zealand law. We deliver orders ourselves, so your address is not passed to a courier.
        </p>
        <p>We may also disclose information if the law requires it.</p>
      </>
    ),
  },
  {
    title: 'How we keep it safe',
    body: (
      <p>
        Your information is stored on secure, access-controlled systems. Only the Zen Oasis
        owner/administrator can access order and customer details.
      </p>
    ),
  },
  {
    title: 'How long we keep it',
    body: (
      <p>
        We keep order records for 7 years, as required for New Zealand tax purposes. We keep contact
        form messages only as long as needed to answer your enquiry. You can ask us to delete your
        information at any time, unless we need to keep it by law.
      </p>
    ),
  },
  {
    title: 'Cookies',
    body: <p>Our website does not use advertising or tracking cookies.</p>,
  },
  {
    title: 'Your rights',
    body: (
      <p>
        You have the right to ask for a copy of the personal information we hold about you, and to ask
        us to correct it. To make a request, email{' '}
        <a href="mailto:zenoasisnz@gmail.com" className={inlineLink}>
          zenoasisnz@gmail.com
        </a>
        . We will respond within 20 working days.
      </p>
    ),
  },
  {
    title: 'Complaints',
    body: (
      <p>
        If you have a concern about how we have handled your information, please contact us first so
        we can try to fix it. If you are not satisfied, you can complain to the Office of the Privacy
        Commissioner at{' '}
        <a href="https://www.privacy.org.nz" target="_blank" rel="noopener noreferrer" className={inlineLink}>
          privacy.org.nz
        </a>
        .
      </p>
    ),
  },
  {
    title: 'Changes to this policy',
    body: <p>We may update this policy from time to time. The latest version will always be on this page.</p>,
  },
  {
    title: 'Contact us',
    body: (
      <p>
        Zen Oasis (Cool Beanz Limited), PO Box [number], Wellington [postcode]. Email:{' '}
        <a href="mailto:zenoasisnz@gmail.com" className={inlineLink}>
          zenoasisnz@gmail.com
        </a>
        . Phone: 027 977 2954.
      </p>
    ),
  },
]

export const Privacy: React.FC<PageProps> = ({ user, isAuthenticated, onLogout }) => (
  <LegalPage
    user={user}
    isAuthenticated={isAuthenticated}
    onLogout={onLogout}
    eyebrow="Your information · Your rights"
    title="Privacy Policy"
    lastUpdated={LAST_UPDATED}
    intro="Zen Oasis (Cool Beanz Limited, Wellington, New Zealand) respects your privacy. This policy explains what personal information we collect, why we collect it, and how we handle it under the Privacy Act 2020."
    sections={sections}
  />
)

export default Privacy
