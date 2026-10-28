import React from 'react'
import { WavePattern, WaveEdge, SakuraBranch, PetalFall, FishSchool } from './Ornaments'

interface PageHeroProps {
  eyebrow: React.ReactNode
  title: React.ReactNode
  lede?: React.ReactNode
  children?: React.ReactNode
}

export const PageHero: React.FC<PageHeroProps> = ({
  eyebrow,
  title,
  lede,
  children,
}) => (
  <section className="band-ai">
    {/* Seigaiha rising from the bottom, fading out toward the heading. */}
    <WavePattern className="absolute inset-0 -z-10 text-on-ai/15 [mask-image:linear-gradient(to_top,black_10%,transparent_75%)]" />
    {/* Fish in the lower waves; fades out at the edges so they ease into view. */}
    <FishSchool className="absolute inset-x-0 bottom-6 h-24 md:h-28 -z-10 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]" />
    {/* Cherry branch reaching in from the corner, petals drifting down across the band. */}
    <SakuraBranch className="absolute -z-10 -top-12 -right-16 w-48 opacity-60 sm:w-72 sm:-top-6 sm:-right-10 md:opacity-100 md:w-[26rem] lg:w-[30rem] lg:right-[2%]" />
    <PetalFall className="absolute inset-0 -z-10 overflow-hidden" />

    <div className="max-w-page mx-auto px-gutter pt-20 pb-24 md:pt-28 md:pb-32">
      <div className="max-w-3xl animate-rise">
        <p className="eyebrow mb-6">{eyebrow}</p>
        <h1 className="text-display text-on-ai mb-6">{title}</h1>
        {lede && <p className="text-lede text-on-ai-soft max-w-xl">{lede}</p>}
        {children && <div className="mt-10 flex flex-wrap gap-4">{children}</div>}
      </div>
    </div>

    <WaveEdge className="absolute bottom-0 inset-x-0" />
  </section>
)
