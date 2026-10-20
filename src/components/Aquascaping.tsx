import React from 'react'
import { Link } from 'react-router-dom'
import { Waves, Wrench, MessageCircle, Fish, Leaf, Droplets } from 'lucide-react'
import { Header } from './Header'
import { PageHero } from './PageHero'
import { Footer } from './Footer'
import { WavePattern, Seal } from './Ornaments'
import type { PageProps } from '../types'

const services = [
  {
    icon: Waves,
    title: 'Tank Setup',
    body: 'Full tank builds from scratch — we handle substrate, hardscape, planting, lighting, and filtration to create a thriving aquascape tailored to your vision.',
  },
  {
    icon: Wrench,
    title: 'Servicing',
    body: 'Regular maintenance visits to keep your tank in peak condition — water changes, plant trimming, filter cleans, and water parameter checks.',
  },
  {
    icon: MessageCircle,
    title: 'Consultation',
    body: 'Not sure where to start? Our experts can advise on tank size, livestock compatibility, plant selection, CO₂ systems, and more — in person or online.',
  },
]

const offerings = [
  {
    icon: Fish,
    title: 'Planted & Nature-Style Tanks',
    body: 'Dutch, Iwagumi, jungle — any style designed to your taste.',
  },
  {
    icon: Leaf,
    title: 'Live Plant Selection',
    body: 'Foreground carpets, midground accents, and background stems sourced fresh.',
  },
  {
    icon: Droplets,
    title: 'Water Chemistry Support',
    body: 'CO₂ injection, fertilisation schedules, and parameter balancing.',
  },
  {
    icon: Wrench,
    title: 'Ongoing Maintenance Plans',
    body: 'Weekly or fortnightly visits so your tank always looks its best.',
  },
]

const stats = [
  { value: '50+', label: 'Tanks Built' },
  { value: '100%', label: 'Custom Designs' },
  { value: 'NZ-Wide', label: 'Service Area' },
  { value: 'Free', label: 'Initial Consult' },
]

export const Aquascaping: React.FC<PageProps> = ({
  user,
  isAuthenticated,
  onLogout,
}) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header
        user={isAuthenticated ? user : null}
        onLogout={onLogout}
      />

      <PageHero
        eyebrow="Design · Build · Maintain"
        title="Aquascaping"
        lede="Beautiful underwater landscapes — designed, built, and maintained by us"
      >
        <Link to="/contact" className="btn-seal">
          Book a Free Consult
        </Link>
      </PageHero>

      <main className="flex-1">
        {/* Intro */}
        <section className="max-w-page mx-auto px-gutter py-20 md:py-28 grid gap-8 md:grid-cols-[1fr_2fr] md:gap-16">
          <div>
            <p className="eyebrow mb-4">The Art</p>
            <h2 className="text-headline text-sumi">Bring Your Tank to Life</h2>
          </div>
          <p className="text-lede text-sumi-soft">
            Aquascaping is the art of arranging aquatic plants, rocks, and driftwood
            into a stunning underwater garden. Whether you're starting fresh or looking
            to transform an existing tank, we offer everything from full setup and design
            through to ongoing servicing and expert consultation.
          </p>
        </section>

        {/* Services Grid */}
        <section className="max-w-page mx-auto px-gutter">
          <div className="grid gap-8 md:grid-cols-3">
            {services.map(({ icon: Icon, title, body }, i) => (
              <div key={title} className="card-washi print-hover relative p-8 overflow-hidden">
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
                  <h3 className="text-title text-sumi mb-3">{title}</h3>
                  <p className="text-sumi-soft">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Feature Section */}
        <section className="max-w-page mx-auto px-gutter py-24">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="eyebrow mb-4">Services</p>
              <h2 className="text-headline text-sumi mb-8">What We Offer</h2>
              <ul className="divide-y divide-rule border-y border-rule">
                {offerings.map(({ icon: Icon, title, body }) => (
                  <li key={title} className="flex items-start gap-5 py-5">
                    <Icon aria-hidden="true" className="w-5 h-5 mt-1 text-shu shrink-0" />
                    <div>
                      <p className="font-display text-lg font-semibold text-sumi">{title}</p>
                      <p className="text-sumi-soft text-sm">{body}</p>
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
                <div key={s.label} className="flex flex-col-reverse text-center md:border-l first:border-l-0 border-on-ai/20">
                  <dt className="text-xs uppercase tracking-[0.22em] text-yamabuki">{s.label}</dt>
                  <dd className="font-display text-4xl md:text-5xl font-bold text-on-ai mb-2">{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Tip + CTA */}
        <section className="max-w-page mx-auto px-gutter pt-24 grid gap-12 lg:grid-cols-[3fr_2fr] lg:items-center">
          <div className="flex gap-6 border-l-2 border-shu pl-6">
            <Seal className="w-10 h-10 shrink-0" />
            <p className="font-display text-title text-sumi">
              Pro Tip: The key to a thriving aquascape is balancing light, CO₂, and nutrients.
              Get in touch and we'll walk you through the ideal setup for your space.
            </p>
          </div>
          <div className="card-washi p-8 text-center lg:text-left">
            <h2 className="text-title text-sumi mb-3">
              Ready to create your perfect aquascape?
            </h2>
            <p className="text-sumi-soft mb-6">
              Reach out for a free consultation and let's design something beautiful.
            </p>
            <Link to="/contact" className="btn-primary">
              Get in Touch
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default Aquascaping
