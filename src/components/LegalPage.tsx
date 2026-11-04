import React from 'react'
import { Header } from './Header'
import { PageHero } from './PageHero'
import { Footer } from './Footer'
import type { PageProps } from '../types'

export const inlineLink =
  'text-shu hover:text-shu-deep font-medium underline decoration-shu/30 underline-offset-4'

export interface LegalSection {
  title: string
  body: React.ReactNode
}

interface LegalPageProps extends Pick<PageProps, 'user' | 'isAuthenticated' | 'onLogout'> {
  eyebrow: string
  title: string
  lastUpdated: string
  intro?: React.ReactNode
  sections: LegalSection[]
}

// Shared layout for the fixed legal pages (Terms, Privacy). Their text lives in code, not the admin editor.
export const LegalPage: React.FC<LegalPageProps> = ({
  user,
  isAuthenticated,
  onLogout,
  eyebrow,
  title,
  lastUpdated,
  intro,
  sections,
}) => (
  <div className="min-h-screen flex flex-col">
    <Header user={isAuthenticated ? user : null} onLogout={onLogout} />

    <PageHero eyebrow={eyebrow} title={title} lede={`Last updated: ${lastUpdated}`} />

    <main className="flex-1 max-w-page w-full mx-auto px-gutter py-20">
      {intro && <p className="max-w-3xl text-lede text-sumi-soft mb-12">{intro}</p>}
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
