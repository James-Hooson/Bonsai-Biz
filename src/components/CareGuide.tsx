import React from 'react'
import { Link } from 'react-router-dom'
import { Droplets, Sun, Scissors, Sprout, Package } from 'lucide-react'
import { Header } from './Header'
import { PageHero } from './PageHero'
import { Footer } from './Footer'
import { Seal } from './Ornaments'
import { PageContentProvider, EditableText } from './EditableContent'
import { ADMIN_EMAILS } from '../types'
import type { PageProps } from '../types'

// `id` keys each step's editable text, so it must stay stable if steps are reordered.
const steps = [
  {
    id: 'watering',
    cadence: 'Check daily',
    icon: Droplets,
    title: 'Watering',
    body: 'Water your bonsai when the topsoil feels dry. Avoid overwatering, as it can lead to root rot. Check soil moisture daily and adjust based on season and indoor conditions.',
  },
  {
    id: 'lighting',
    cadence: '4–6 hours a day',
    icon: Sun,
    title: 'Lighting',
    body: 'Place your bonsai in a location with plenty of indirect sunlight. Most bonsai species thrive with 4-6 hours of light daily. Rotate your tree weekly for even growth.',
  },
  {
    id: 'pruning',
    cadence: 'As it grows',
    icon: Scissors,
    title: 'Pruning',
    body: 'Regularly prune your bonsai to maintain its shape and encourage healthy growth. Use sharp, clean tools to avoid damaging the tree. Remove dead branches and trim new growth.',
  },
  {
    id: 'fertilizing',
    cadence: 'Every 4–6 weeks',
    icon: Sprout,
    title: 'Fertilizing',
    body: 'Feed your bonsai with a balanced fertilizer every 4-6 weeks during the growing season (spring and summer). Reduce feeding in fall and winter when growth slows.',
  },
]

export const CareGuide: React.FC<PageProps> = ({
  user,
  isAuthenticated,
  firebaseReady,
  onLogout,
}) => {
  const isAdmin = isAuthenticated && !!user?.email && ADMIN_EMAILS.includes(user.email)

  return (
    <PageContentProvider page="care-guide" canEdit={isAdmin && firebaseReady}>
    <div className="min-h-screen flex flex-col">
      <Header
        user={isAuthenticated ? user : null}
        onLogout={onLogout}
      />

      <PageHero
        eyebrow={<EditableText field="heroEyebrow">Watering · Light · Pruning · Feed</EditableText>}
        title={<EditableText field="heroTitle">Bonsai Care Guide</EditableText>}
        lede={
          <EditableText field="heroLede">
            Everything you need to know to keep your bonsai thriving
          </EditableText>
        }
      />

      <main className="flex-1 max-w-page w-full mx-auto px-gutter">
        <EditableText field="intro" as="p" className="font-display text-title text-sumi max-w-3xl py-20" multiline>
          Caring for your bonsai tree is essential to ensure its health and
          longevity. Follow these guidelines to help your miniature tree
          flourish.
        </EditableText>

        {/* Care steps */}
        <ol className="border-t border-sumi">
          {steps.map(({ id, cadence, icon: Icon, title, body }, i) => (
            <li
              key={id}
              className="group grid gap-6 py-10 border-b border-rule md:grid-cols-[8rem_1fr_2fr] md:items-start md:gap-12"
            >
              <span
                aria-hidden="true"
                className="font-display text-7xl leading-none text-rule transition-colors duration-500 group-hover:text-shu"
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <EditableText field={`step-${id}-title`} as="h2" className="text-headline text-sumi mb-1">
                  {title}
                </EditableText>
                <p className="flex items-center gap-2 text-sm text-sumi-soft">
                  <Icon aria-hidden="true" className="w-4 h-4 text-ai" />
                  <EditableText field={`step-${id}-cadence`}>{cadence}</EditableText>
                </p>
              </div>
              <EditableText field={`step-${id}-body`} as="p" className="text-lede text-sumi-soft" multiline>
                {body}
              </EditableText>
            </li>
          ))}
        </ol>

        {/* Repotting Section */}
        <section className="mt-20 grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-stretch">
          <div className="card-washi p-8 md:p-12">
            <div className="flex items-center gap-4 mb-6">
              <span className="icon-tile">
                <Package aria-hidden="true" className="w-6 h-6" />
              </span>
              <EditableText field="repottingTitle" as="h2" className="text-headline text-sumi">
                Repotting
              </EditableText>
            </div>
            <EditableText field="repottingBody" as="p" className="text-lede text-sumi-soft" multiline>
              Repot your bonsai every 2-3 years to refresh the soil and provide
              more space for root growth. Spring is the best time for repotting,
              just before the growing season begins.
            </EditableText>
          </div>
          <aside className="band-ai p-8 md:p-12 flex flex-col justify-between gap-8">
            <div className="flex items-center justify-between">
              <EditableText field="tipEyebrow" as="p" className="eyebrow">
                Pro Tip
              </EditableText>
              <Seal />
            </div>
            <EditableText field="tipBody" as="p" className="font-display text-title text-on-ai" multiline>
              When repotting, trim about one-third of the root mass to
              encourage new, healthy root growth.
            </EditableText>
          </aside>
        </section>

        {/* CTA Section */}
        <section className="text-center pt-24">
          <EditableText field="ctaTitle" as="h2" className="text-headline text-sumi mb-8">
            Need supplies for your bonsai?
          </EditableText>
          <Link to="/" className="btn-primary">
            <EditableText field="ctaButton">Shop Our Collection</EditableText>
          </Link>
        </section>
      </main>

      <Footer />
    </div>
    </PageContentProvider>
  )
}

export default CareGuide
