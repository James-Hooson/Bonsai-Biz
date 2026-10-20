import React from 'react'
import { Link } from 'react-router-dom'
import { Seal, WavePattern, Blossom } from './Ornaments'

const links = [
  { to: '/', label: 'Shop' },
  { to: '/about', label: 'About' },
  { to: '/care-guide', label: 'Care Guide' },
  { to: '/aquascaping', label: 'Aquascaping' },
  { to: '/contact', label: 'Contact' },
]

export const Footer: React.FC = () => (
  <footer className="band-ai mt-24">
    <WavePattern
      id="seigaiha-footer"
      className="absolute inset-x-0 top-0 h-6 text-on-ai/20"
    />
    <div className="max-w-page mx-auto px-gutter pt-16 pb-10">
      <div className="grid gap-12 md:grid-cols-[2fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Seal />
            <span className="font-display text-2xl">Zen Oasis</span>
          </div>
          <p className="text-on-ai-soft max-w-sm">
            Bonsai, potted plants and living aquascapes — grown slowly, chosen with care.
          </p>
        </div>

        <nav aria-label="Footer">
          <p className="eyebrow mb-4">Explore</p>
          <ul className="space-y-2">
            {links.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="text-on-ai hover:text-yamabuki transition">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="eyebrow mb-4">Visit</p>
          <a
            href="mailto:zenoasisnz@gmail.com"
            className="block text-on-ai hover:text-yamabuki transition mb-2 break-all"
          >
            zenoasisnz@gmail.com
          </a>
          <p className="text-on-ai-soft text-sm">Mon – Fri · 9:00 – 17:00</p>
        </div>
      </div>

      <div className="mt-14 pt-6 border-t border-on-ai/20 flex flex-wrap items-center justify-between gap-4 text-xs text-on-ai-soft">
        <span>© {new Date().getFullYear()} Zen Oasis · Aotearoa New Zealand</span>
        <span className="flex items-center gap-3 uppercase tracking-[0.3em]">
          <Blossom centre={false} className="w-3 h-3 text-sakura" />
          Bonsai · Aquascape
        </span>
      </div>
    </div>
  </footer>
)
