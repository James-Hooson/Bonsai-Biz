import React from 'react'
import { Link } from 'react-router-dom'
import { Heart, Users, Award } from 'lucide-react'
import { Header } from './Header'
import { PageHero } from './PageHero'
import { Footer } from './Footer'
import { WavePattern } from './Ornaments'
import { PageContentProvider, EditableText } from './EditableContent'
import { ADMIN_EMAILS } from '../types'
import type { PageProps } from '../types'

// `id` keys each item's editable text, so it must stay stable if items are reordered.
const values = [
  {
    id: 'quality',
    numeral: '01',
    icon: Award,
    title: 'Premium Quality',
    body: 'We source only the finest bonsai trees and materials, ensuring every piece meets our high standards.',
  },
  {
    id: 'guidance',
    numeral: '02',
    icon: Users,
    title: 'Expert Guidance',
    body: 'Our team of bonsai experts provides comprehensive care guides and personalized support.',
  },
  {
    id: 'community',
    numeral: '03',
    icon: Heart,
    title: 'Passionate Community',
    body: 'Join a growing community of bonsai lovers sharing knowledge, tips, and inspiration.',
  },
]

const stats = [
  { id: 'founded', value: '2023', label: 'Founded' },
  { id: 'treesSold', value: '500+', label: 'Trees Sold' },
  { id: 'customers', value: '1000+', label: 'Happy Customers' },
  { id: 'varieties', value: '50+', label: 'Tree Varieties' },
]

export const About: React.FC<PageProps> = ({
  user,
  isAuthenticated,
  firebaseReady,
  onLogout,
}) => {
  const isAdmin = isAuthenticated && !!user?.email && ADMIN_EMAILS.includes(user.email)

  return (
    <PageContentProvider page="about" canEdit={isAdmin && firebaseReady}>
    <div className="min-h-screen flex flex-col">
      <Header
        user={isAuthenticated ? user : null}
        onLogout={onLogout}
      />

      <PageHero
        eyebrow={<EditableText field="heroEyebrow">Since 2023</EditableText>}
        title={<EditableText field="heroTitle">About ZenBonsai</EditableText>}
        lede={
          <EditableText field="heroLede">
            Bringing the ancient art of bonsai to enthusiasts worldwide
          </EditableText>
        }
      />

      <main className="flex-1">
        {/* Mission Statement */}
        <section className="max-w-page mx-auto px-gutter py-20 md:py-28">
          <div className="grid gap-10 md:grid-cols-[auto_1fr] md:gap-16">
            <EditableText field="missionEyebrow" as="p" className="eyebrow md:pt-3">
              Our Mission
            </EditableText>
            <blockquote className="font-display text-headline text-sumi max-w-4xl">
              <EditableText field="mission" multiline>
                ZenBonsai is your premier destination for high-quality bonsai
                trees and accessories. Our mission is to bring the ancient art of
                bonsai to enthusiasts around the world, making this timeless
                practice accessible to everyone
              </EditableText>{' '}
              <EditableText field="missionHighlight" className="text-shu">
                from beginners to masters.
              </EditableText>
            </blockquote>
          </div>
        </section>

        {/* Value Props */}
        <section className="max-w-page mx-auto px-gutter">
          <div className="grid md:grid-cols-3 border-t border-rule">
            {values.map(({ id, numeral, icon: Icon, title, body }) => (
              <div
                key={id}
                className="group py-10 md:px-8 md:first:pl-0 md:last:pr-0 border-b md:border-b-0 md:border-r last:border-r-0 border-rule"
              >
                <div className="flex items-center justify-between mb-8">
                  <span aria-hidden="true" className="font-display text-5xl text-nezumi transition-colors duration-500 group-hover:text-shu">
                    {numeral}
                  </span>
                  <Icon aria-hidden="true" className="w-6 h-6 text-ai" />
                </div>
                <EditableText field={`value-${id}-title`} as="h3" className="text-title text-sumi mb-3">
                  {title}
                </EditableText>
                <EditableText field={`value-${id}-body`} as="p" className="text-sumi-soft" multiline>
                  {body}
                </EditableText>
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
              <EditableText field="storyEyebrow" as="p" className="eyebrow mb-4">
                Since 2023
              </EditableText>
              <EditableText field="storyTitle" as="h2" className="text-headline text-sumi mb-6">
                Our Story
              </EditableText>
              <div className="space-y-4 text-sumi-soft">
                <EditableText field="story1" as="p" multiline>
                  Founded in 2023, ZenBonsai began with a simple vision: to make
                  the art of bonsai accessible to everyone. What started as a
                  small collection has grown into a comprehensive marketplace
                  offering trees for every skill level.
                </EditableText>
                <EditableText field="story2" as="p" multiline>
                  We specialize in providing premium bonsai trees, care guides,
                  and educational resources that empower our customers to
                  cultivate their own miniature masterpieces.
                </EditableText>
                <EditableText field="story3" as="p" multiline>
                  Today, we're proud to serve thousands of bonsai enthusiasts,
                  helping them discover the meditative joy and artistic expression
                  that comes with nurturing these living sculptures.
                </EditableText>
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

        {/* CTA Section */}
        <section className="max-w-page mx-auto px-gutter pt-24 text-center">
          <EditableText field="ctaTitle" as="h2" className="text-headline text-sumi mb-4">
            Ready to start your bonsai journey?
          </EditableText>
          <EditableText field="ctaBody" as="p" className="text-sumi-soft mb-8">
            Explore our collection and find the perfect tree for you.
          </EditableText>
          <Link to="/" className="btn-primary">
            <EditableText field="ctaButton">Browse Our Collection</EditableText>
          </Link>
        </section>
      </main>

      <Footer />
    </div>
    </PageContentProvider>
  )
}

export default About
