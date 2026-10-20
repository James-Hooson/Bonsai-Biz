import React from 'react'
import { Link } from 'react-router-dom'
import { Heart, Users, Award } from 'lucide-react'
import { Header } from './Header'
import { PageHero } from './PageHero'
import { Footer } from './Footer'
import { WavePattern } from './Ornaments'
import type { PageProps } from '../types'

const values = [
  {
    numeral: '01',
    icon: Award,
    title: 'Premium Quality',
    body: 'We source only the finest bonsai trees and materials, ensuring every piece meets our high standards.',
  },
  {
    numeral: '02',
    icon: Users,
    title: 'Expert Guidance',
    body: 'Our team of bonsai experts provides comprehensive care guides and personalized support.',
  },
  {
    numeral: '03',
    icon: Heart,
    title: 'Passionate Community',
    body: 'Join a growing community of bonsai lovers sharing knowledge, tips, and inspiration.',
  },
]

const stats = [
  { value: '2023', label: 'Founded' },
  { value: '500+', label: 'Trees Sold' },
  { value: '1000+', label: 'Happy Customers' },
  { value: '50+', label: 'Tree Varieties' },
]

export const About: React.FC<PageProps> = ({
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
        eyebrow="Since 2023"
        title="About ZenBonsai"
        lede="Bringing the ancient art of bonsai to enthusiasts worldwide"
      />

      <main className="flex-1">
        {/* Mission Statement */}
        <section className="max-w-page mx-auto px-gutter py-20 md:py-28">
          <div className="grid gap-10 md:grid-cols-[auto_1fr] md:gap-16">
            <p className="eyebrow md:pt-3">Our Mission</p>
            <blockquote className="font-display text-headline text-sumi max-w-4xl">
              ZenBonsai is your premier destination for high-quality bonsai
              trees and accessories. Our mission is to bring the ancient art of
              bonsai to enthusiasts around the world, making this timeless
              practice accessible to everyone{' '}
              <span className="text-shu">from beginners to masters.</span>
            </blockquote>
          </div>
        </section>

        {/* Value Props */}
        <section className="max-w-page mx-auto px-gutter">
          <div className="grid md:grid-cols-3 border-t border-rule">
            {values.map(({ numeral, icon: Icon, title, body }) => (
              <div
                key={title}
                className="group py-10 md:px-8 md:first:pl-0 md:last:pr-0 border-b md:border-b-0 md:border-r last:border-r-0 border-rule"
              >
                <div className="flex items-center justify-between mb-8">
                  <span aria-hidden="true" className="font-display text-5xl text-nezumi transition-colors duration-500 group-hover:text-shu">
                    {numeral}
                  </span>
                  <Icon aria-hidden="true" className="w-6 h-6 text-ai" />
                </div>
                <h3 className="text-title text-sumi mb-3">{title}</h3>
                <p className="text-sumi-soft">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Story Section */}
        <section className="max-w-page mx-auto px-gutter py-24">
          <div className="grid gap-12 lg:grid-cols-[6fr_5fr] lg:items-center">
            <div className="relative order-2 lg:order-1">
              <div aria-hidden="true" className="absolute inset-0 translate-x-4 translate-y-4 bg-ai" />
              <div className="relative border border-rule bg-kinari p-3">
                <img
                  src="https://images.unsplash.com/photo-1632161286719-5afe9b5d954b?q=80&w=745&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt="Beautiful bonsai tree"
                  className="w-full aspect-[4/3] object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <p className="eyebrow mb-4">Since 2023</p>
              <h2 className="text-headline text-sumi mb-6">Our Story</h2>
              <div className="space-y-4 text-sumi-soft">
                <p>
                  Founded in 2023, ZenBonsai began with a simple vision: to make
                  the art of bonsai accessible to everyone. What started as a
                  small collection has grown into a comprehensive marketplace
                  offering trees for every skill level.
                </p>
                <p>
                  We specialize in providing premium bonsai trees, care guides,
                  and educational resources that empower our customers to
                  cultivate their own miniature masterpieces.
                </p>
                <p>
                  Today, we're proud to serve thousands of bonsai enthusiasts,
                  helping them discover the meditative joy and artistic expression
                  that comes with nurturing these living sculptures.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="band-ai">
          <WavePattern id="seigaiha-about" className="absolute inset-0 -z-10 text-on-ai/10" />
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

        {/* CTA Section */}
        <section className="max-w-page mx-auto px-gutter pt-24 text-center">
          <h2 className="text-headline text-sumi mb-4">
            Ready to start your bonsai journey?
          </h2>
          <p className="text-sumi-soft mb-8">
            Explore our collection and find the perfect tree for you.
          </p>
          <Link to="/" className="btn-primary">
            Browse Our Collection
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default About
