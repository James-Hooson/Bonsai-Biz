import React from 'react'
import { Link } from 'react-router-dom'
import { Waves, Wrench, MessageCircle, Fish, Leaf, Droplets } from 'lucide-react'
import { Header } from './Header'
import { PageHero } from './PageHero'
import { Footer } from './Footer'
import { WavePattern, Seal } from './Ornaments'
import { PageContentProvider, EditableText } from './EditableContent'
import { ADMIN_EMAILS } from '../types'
import type { PageProps } from '../types'

// `id` keys each item's editable text, so it must stay stable if items are reordered.
const services = [
  {
    id: 'setup',
    icon: Waves,
    title: 'Tank Setup',
    body: 'Full tank builds from scratch — we handle substrate, hardscape, planting, lighting, and filtration to create a thriving aquascape tailored to your vision.',
  },
  {
    id: 'servicing',
    icon: Wrench,
    title: 'Servicing',
    body: 'Regular maintenance visits to keep your tank in peak condition — water changes, plant trimming, filter cleans, and water parameter checks.',
  },
  {
    id: 'consultation',
    icon: MessageCircle,
    title: 'Consultation',
    body: 'Not sure where to start? Our experts can advise on tank size, livestock compatibility, plant selection, CO₂ systems, and more — in person or online.',
  },
]

const offerings = [
  {
    id: 'tanks',
    icon: Fish,
    title: 'Planted & Nature-Style Tanks',
    body: 'Dutch, Iwagumi, jungle — any style designed to your taste.',
  },
  {
    id: 'plants',
    icon: Leaf,
    title: 'Live Plant Selection',
    body: 'Foreground carpets, midground accents, and background stems sourced fresh.',
  },
  {
    id: 'water',
    icon: Droplets,
    title: 'Water Chemistry Support',
    body: 'CO₂ injection, fertilisation schedules, and parameter balancing.',
  },
  {
    id: 'maintenance',
    icon: Wrench,
    title: 'Ongoing Maintenance Plans',
    body: 'Weekly or fortnightly visits so your tank always looks its best.',
  },
]

const stats = [
  { id: 'built', value: '50+', label: 'Tanks Built' },
  { id: 'custom', value: '100%', label: 'Custom Designs' },
  { id: 'area', value: 'NZ-Wide', label: 'Service Area' },
  { id: 'consult', value: 'Free', label: 'Initial Consult' },
]

export const Aquascaping: React.FC<PageProps> = ({
  user,
  isAuthenticated,
  firebaseReady,
  onLogout,
}) => {
  const isAdmin = isAuthenticated && !!user?.email && ADMIN_EMAILS.includes(user.email)

  return (
    <PageContentProvider page="aquascaping" canEdit={isAdmin && firebaseReady}>
    <div className="min-h-screen flex flex-col">
      <Header
        user={isAuthenticated ? user : null}
        onLogout={onLogout}
      />

      <PageHero
        eyebrow={<EditableText field="heroEyebrow">Design · Build · Maintain</EditableText>}
        title={<EditableText field="heroTitle">Aquascaping</EditableText>}
        lede={
          <EditableText field="heroLede">
            Beautiful underwater landscapes — designed, built, and maintained by us
          </EditableText>
        }
      >
        <Link to="/contact" className="btn-seal">
          <EditableText field="heroButton">Book a Free Consult</EditableText>
        </Link>
      </PageHero>

      <main className="flex-1">
        {/* Intro */}
        <section className="max-w-page mx-auto px-gutter py-20 md:py-28 grid gap-8 md:grid-cols-[1fr_2fr] md:gap-16">
          <div>
            <EditableText field="introEyebrow" as="p" className="eyebrow mb-4">
              The Art
            </EditableText>
            <EditableText field="introTitle" as="h2" className="text-headline text-sumi">
              Bring Your Tank to Life
            </EditableText>
          </div>
          <EditableText field="introBody" as="p" className="text-lede text-sumi-soft" multiline>
            Aquascaping is the art of arranging aquatic plants, rocks, and driftwood
            into a stunning underwater garden. Whether you're starting fresh or looking
            to transform an existing tank, we offer everything from full setup and design
            through to ongoing servicing and expert consultation.
          </EditableText>
        </section>

        {/* Services Grid */}
        <section className="max-w-page mx-auto px-gutter">
          <div className="grid gap-8 md:grid-cols-3">
            {services.map(({ id, icon: Icon, title, body }, i) => (
              <div key={id} className="card-washi print-hover relative p-8 overflow-hidden">
                <span
                  aria-hidden="true"
                  className="absolute right-4 -top-3 font-display text-[7rem] leading-none text-washi-deep select-none"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="relative">
                  <span className="icon-tile mb-8">
                    <Icon aria-hidden="true" className="w-6 h-6" />
                  </span>
                  <EditableText field={`service-${id}-title`} as="h3" className="text-title text-sumi mb-3">
                    {title}
                  </EditableText>
                  <EditableText field={`service-${id}-body`} as="p" className="text-sumi-soft" multiline>
                    {body}
                  </EditableText>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Feature Section */}
        <section className="max-w-page mx-auto px-gutter py-24">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <EditableText field="offerEyebrow" as="p" className="eyebrow mb-4">
                Services
              </EditableText>
              <EditableText field="offerTitle" as="h2" className="text-headline text-sumi mb-8">
                What We Offer
              </EditableText>
              <ul className="divide-y divide-rule border-y border-rule">
                {offerings.map(({ id, icon: Icon, title, body }) => (
                  <li key={id} className="flex items-start gap-5 py-5">
                    <Icon aria-hidden="true" className="w-5 h-5 mt-1 text-shu shrink-0" />
                    <div>
                      <EditableText field={`offer-${id}-title`} as="p" className="font-display text-lg font-semibold text-sumi">
                        {title}
                      </EditableText>
                      <EditableText field={`offer-${id}-body`} as="p" className="text-sumi-soft text-sm" multiline>
                        {body}
                      </EditableText>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div aria-hidden="true" className="absolute inset-0 -translate-x-4 translate-y-4 bg-shu" />
              <div className="relative border border-rule bg-kinari p-3">
                <img
                  src="https://images.unsplash.com/photo-1583212292454-1fe6229603b7?q=80&w=800&auto=format&fit=crop"
                  alt="Aquascape planted tank"
                  className="w-full aspect-[4/5] object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Stats Banner */}
        <section className="band-ai">
          <WavePattern id="seigaiha-aqua" className="absolute inset-0 -z-10 text-on-ai/10" />
          <div className="max-w-page mx-auto px-gutter py-16">
            <dl className="grid grid-cols-2 md:grid-cols-4 gap-y-10">
              {stats.map((s) => (
                <div key={s.id} className="flex flex-col-reverse text-center md:border-l first:border-l-0 border-on-ai/20">
                  <EditableText field={`stat-${s.id}-label`} as="dt" className="text-xs uppercase tracking-[0.22em] text-yamabuki">
                    {s.label}
                  </EditableText>
                  <EditableText field={`stat-${s.id}-value`} as="dd" className="font-display text-4xl md:text-5xl font-bold text-on-ai mb-2">
                    {s.value}
                  </EditableText>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Tip + CTA */}
        <section className="max-w-page mx-auto px-gutter pt-24 grid gap-12 lg:grid-cols-[3fr_2fr] lg:items-center">
          <div className="flex gap-6 border-l-2 border-shu pl-6">
            <Seal className="w-10 h-10 shrink-0" />
            <EditableText field="tip" as="p" className="font-display text-title text-sumi" multiline>
              Pro Tip: The key to a thriving aquascape is balancing light, CO₂, and nutrients.
              Get in touch and we'll walk you through the ideal setup for your space.
            </EditableText>
          </div>
          <div className="card-washi p-8 text-center lg:text-left">
            <EditableText field="ctaTitle" as="h2" className="text-title text-sumi mb-3">
              Ready to create your perfect aquascape?
            </EditableText>
            <EditableText field="ctaBody" as="p" className="text-sumi-soft mb-6">
              Reach out for a free consultation and let's design something beautiful.
            </EditableText>
            <Link to="/contact" className="btn-primary">
              <EditableText field="ctaButton">Get in Touch</EditableText>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
    </PageContentProvider>
  )
}

export default Aquascaping
