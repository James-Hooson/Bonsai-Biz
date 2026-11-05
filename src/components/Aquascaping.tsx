import React from 'react'
import { Link } from 'react-router-dom'
import { PencilRuler, Hammer, Wrench, MessageCircle, House, Building2 } from 'lucide-react'
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
    id: 'design',
    icon: PencilRuler,
    title: 'Design',
    body: "We start with your space and your animals — choosing the layout, hardscape, plants, and equipment to suit the habitat and the look you're after.",
  },
  {
    id: 'build',
    icon: Hammer,
    title: 'Build',
    body: 'We bring it to life — substrate, hardscape, planting, lighting, and filtration, all set up and ready for its inhabitants.',
  },
  {
    id: 'maintain',
    icon: Wrench,
    title: 'Maintain',
    body: 'Once established, we keep it thriving with trimming, cleaning, replanting, and recalibrating — as often as you need.',
  },
]

const offerings = [
  {
    id: 'home-enclosure',
    icon: House,
    title: 'Custom Enclosure for Your Home',
    body: 'We can design habitats (vivariums, paludariums, aquariums) for your animals (reptiles, amphibians, fish, insects, and arachnids).',
  },
  {
    id: 'commercial-display',
    icon: Building2,
    title: 'Custom Display for Commercial Spaces',
    body: 'Are you a business (corporate offices/lobbies, hotels, restaurants/cafes, retail stores, wellness studios, etc.) or organization (zoos, aquariums, schools) looking for a beautiful, captivating natural showpiece? We can build large display tanks for your needs!',
  },
  {
    id: 'maintenance-service',
    icon: Wrench,
    title: 'Maintenance Service',
    body: 'We can provide regular maintenance (trimming, cleaning, replanting, recalibrating) for enclosures we build, or any of your existing setups!',
  },
  {
    id: 'paid-consultation',
    icon: MessageCircle,
    title: 'Consultation',
    body: 'Have a long list of questions about an existing or future build? We offer paid 1-hour consultation sessions to discuss your questions in-depth.',
  },
]

const stats = [
  { id: 'built', value: '50+', label: 'Tanks Built' },
  { id: 'custom', value: '100%', label: 'Custom Designs' },
  { id: 'area', value: 'NZ-Wide', label: 'Service Area' },
  { id: 'consult', value: '1-Hour', label: 'Consult Sessions' },
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
          <EditableText field="heroButton">Book a Consult</EditableText>
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
                  src="/aquascaping-vivarium.jpg"
                  alt="Planted vivarium with driftwood, pothos and alocasia"
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
              Reach out to discuss your project and let's design something beautiful.
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
