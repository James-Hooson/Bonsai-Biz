import React from 'react'
import { Link } from 'react-router-dom'
import { Droplets, Sun, Scissors, Sprout, Package } from 'lucide-react'
import { Header } from './Header'
import { PageHero } from './PageHero'
import { Footer } from './Footer'
import { Seal } from './Ornaments'
import type { PageProps } from '../types'

const steps = [
  {
    cadence: 'Check daily',
    icon: Droplets,
    title: 'Watering',
    body: 'Water your bonsai when the topsoil feels dry. Avoid overwatering, as it can lead to root rot. Check soil moisture daily and adjust based on season and indoor conditions.',
  },
  {
    cadence: '4–6 hours a day',
    icon: Sun,
    title: 'Lighting',
    body: 'Place your bonsai in a location with plenty of indirect sunlight. Most bonsai species thrive with 4-6 hours of light daily. Rotate your tree weekly for even growth.',
  },
  {
    cadence: 'As it grows',
    icon: Scissors,
    title: 'Pruning',
    body: 'Regularly prune your bonsai to maintain its shape and encourage healthy growth. Use sharp, clean tools to avoid damaging the tree. Remove dead branches and trim new growth.',
  },
  {
    cadence: 'Every 4–6 weeks',
    icon: Sprout,
    title: 'Fertilizing',
    body: 'Feed your bonsai with a balanced fertilizer every 4-6 weeks during the growing season (spring and summer). Reduce feeding in fall and winter when growth slows.',
  },
]

export const CareGuide: React.FC<PageProps> = ({
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
        eyebrow="Watering · Light · Pruning · Feed"
        title="Bonsai Care Guide"
        lede="Everything you need to know to keep your bonsai thriving"
      />

      <main className="flex-1 max-w-page w-full mx-auto px-gutter">
        <p className="font-display text-title text-sumi max-w-3xl py-20">
          Caring for your bonsai tree is essential to ensure its health and
          longevity. Follow these guidelines to help your miniature tree
          flourish.
        </p>

        {/* Care steps */}
        <ol className="border-t border-sumi">
          {steps.map(({ cadence, icon: Icon, title, body }, i) => (
            <li
              key={title}
              className="group grid gap-6 py-10 border-b border-rule md:grid-cols-[8rem_1fr_2fr] md:items-start md:gap-12"
            >
              <span
                aria-hidden="true"
                className="font-display text-7xl leading-none text-rule transition-colors duration-500 group-hover:text-shu"
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <h2 className="text-headline text-sumi mb-1">{title}</h2>
                <p className="flex items-center gap-2 text-sm text-sumi-soft">
                  <Icon aria-hidden="true" className="w-4 h-4 text-ai" />
                  {cadence}
                </p>
              </div>
              <p className="text-lede text-sumi-soft">{body}</p>
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
              <h2 className="text-headline text-sumi">Repotting</h2>
            </div>
            <p className="text-lede text-sumi-soft">
              Repot your bonsai every 2-3 years to refresh the soil and provide
              more space for root growth. Spring is the best time for repotting,
              just before the growing season begins.
            </p>
          </div>
          <aside className="band-ai p-8 md:p-12 flex flex-col justify-between gap-8">
            <div className="flex items-center justify-between">
              <p className="eyebrow">Pro Tip</p>
              <Seal />
            </div>
            <p className="font-display text-title text-on-ai">
              When repotting, trim about one-third of the root mass to
              encourage new, healthy root growth.
            </p>
          </aside>
        </section>

        {/* CTA Section */}
        <section className="text-center pt-24">
          <h2 className="text-headline text-sumi mb-8">
            Need supplies for your bonsai?
          </h2>
          <Link to="/" className="btn-primary">
            Shop Our Collection
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default CareGuide
