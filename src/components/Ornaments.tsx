import React from 'react'

/** Seigaiha (blue ocean wave) tile, filled with the band colour and inked in currentColor. */
export const WavePattern: React.FC<{ className?: string; id?: string }> = ({
  className = '',
  id = 'seigaiha',
}) => {
  // Each scale: a filled disc with concentric rings. Upper rows draw first so
  // the lower row overlaps them, which gives the fish-scale look.
  const scale = (cx: number, cy: number) => (
    <g key={`${cx}-${cy}`} transform={`translate(${cx} ${cy})`}>
      <circle r="19.5" className="fill-ai" />
      {[17, 13, 9, 5].map((r) => (
        <circle key={r} r={r} fill="none" stroke="currentColor" strokeWidth="1.1" />
      ))}
    </g>
  )
  return (
    <svg aria-hidden="true" className={className} width="100%" height="100%">
      <defs>
        <pattern id={id} width="40" height="20" patternUnits="userSpaceOnUse">
          {[
            [0, 0],
            [40, 0],
            [20, 10],
            [0, 20],
            [40, 20],
          ].map(([x, y]) => scale(x, y))}
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  )
}

/** Five notched petals around a small centre — the cherry blossom used across the site. */
const PETAL = 'M0 0 C -12 -10 -16 -28 -8 -38 L 0 -32 L 8 -38 C 16 -28 12 -10 0 0 Z'

export const Blossom: React.FC<{ className?: string; centre?: boolean }> = ({
  className = 'w-6 h-6',
  centre = true,
}) => (
  <svg viewBox="-42 -42 84 84" aria-hidden="true" className={className}>
    {[0, 72, 144, 216, 288].map((deg) => (
      <path key={deg} d={PETAL} transform={`rotate(${deg})`} fill="currentColor" />
    ))}
    {centre && <circle r="6" className="fill-shu/70" />}
  </svg>
)

/** Square hanko seal. Carries a blossom by default, or any icon passed as children. */
export const Seal: React.FC<{ className?: string; children?: React.ReactNode }> = ({
  className = 'w-10 h-10',
  children,
}) => (
  <span
    aria-hidden="true"
    className={`inline-flex items-center justify-center bg-shu text-kinari rounded-[3px] shadow-[inset_0_0_0_2px_var(--color-shu),inset_0_0_0_3.5px_var(--color-kinari)] ${className}`}
  >
    {children ?? <Blossom className="w-[58%] h-[58%]" centre={false} />}
  </span>
)

/** A cherry branch reaching in from the top-right, after Hiroshige's plum and cherry prints. */
export const SakuraBranch: React.FC<{ className?: string }> = ({ className = '' }) => {
  const flowers: [number, number, number, number][] = [
    // x, y, scale, rotation
    [345, 140, 1.15, 10],
    [282, 102, 0.8, -20],
    [196, 96, 0.95, 30],
    [232, 192, 0.7, 5],
    [252, 292, 1.05, -15],
    [116, 202, 0.85, 40],
    [128, 272, 0.65, 18],
    [372, 62, 0.6, -35],
  ]
  const buds: [number, number][] = [
    [318, 128], [214, 118], [178, 248], [92, 228], [272, 312], [150, 300],
  ]
  return (
    <svg viewBox="0 0 400 400" aria-hidden="true" className={className}>
      <g fill="none" strokeLinecap="round" className="stroke-bark">
        <path d="M410 22 C 330 46 292 92 252 150 S 188 242 124 274" strokeWidth="11" />
        <path d="M304 82 C 304 110 322 128 345 140" strokeWidth="5" />
        <path d="M256 144 C 226 138 206 120 196 96" strokeWidth="5" />
        <path d="M206 226 C 210 258 228 280 252 292" strokeWidth="5" />
        <path d="M164 252 C 142 244 122 226 116 202" strokeWidth="4" />
        <path d="M352 50 C 362 54 368 58 372 62" strokeWidth="4" />
      </g>
      {buds.map(([x, y]) => (
        <ellipse key={`${x}-${y}`} cx={x} cy={y} rx="5" ry="7" className="fill-sakura-deep" />
      ))}
      {flowers.map(([x, y, k, r]) => (
        <g key={`${x}-${y}`} transform={`translate(${x} ${y}) rotate(${r}) scale(${k * 0.62})`}>
          {[0, 72, 144, 216, 288].map((deg) => (
            <path
              key={deg}
              d={PETAL}
              transform={`rotate(${deg})`}
              className="fill-sakura stroke-sakura-deep"
              strokeWidth="1.5"
            />
          ))}
          <circle r="7" className="fill-shu/80" />
          {[0, 60, 120, 180, 240, 300].map((deg) => (
            <circle key={deg} r="2.2" cx="0" cy="-12" transform={`rotate(${deg})`} className="fill-yamabuki" />
          ))}
        </g>
      ))}
    </svg>
  )
}

/** Loose petals drifting down through a band. Purely decorative; stills under reduced motion. */
const PETALS: { left: number; size: number; fall: number; delay: number; sway: number }[] = [
  { left: 4, size: 14, fall: 16, delay: -2, sway: 5 },
  { left: 12, size: 10, fall: 21, delay: -11, sway: 6 },
  { left: 21, size: 16, fall: 18, delay: -6, sway: 4.5 },
  { left: 30, size: 9, fall: 24, delay: -17, sway: 7 },
  { left: 38, size: 12, fall: 17, delay: -9, sway: 5.5 },
  { left: 47, size: 15, fall: 20, delay: -1, sway: 6.5 },
  { left: 55, size: 10, fall: 23, delay: -14, sway: 4 },
  { left: 63, size: 13, fall: 15, delay: -5, sway: 5 },
  { left: 71, size: 17, fall: 19, delay: -12, sway: 6 },
  { left: 79, size: 11, fall: 22, delay: -3, sway: 7.5 },
  { left: 86, size: 14, fall: 17, delay: -15, sway: 4.5 },
  { left: 94, size: 9, fall: 25, delay: -8, sway: 6 },
]

export const PetalFall: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div aria-hidden="true" className={`pointer-events-none ${className}`}>
    {PETALS.map((p, i) => (
      <div
        key={i}
        className="absolute top-0 h-full w-0 animate-petal-fall"
        style={{ left: `${p.left}%`, animationDuration: `${p.fall}s`, animationDelay: `${p.delay}s` }}
      >
        <svg
          viewBox="-20 -40 40 42"
          className="block text-sakura animate-petal-sway"
          style={{ width: p.size, height: p.size, animationDuration: `${p.sway}s` }}
        >
          <path d={PETAL} fill="currentColor" opacity="0.9" />
        </svg>
      </div>
    ))}
  </div>
)

/** A slender river fish (ayu) in profile, facing right. */
const Fish: React.FC<{ size: number; wiggle: number }> = ({ size, wiggle }) => (
  <svg
    viewBox="0 0 100 40"
    className="block animate-fish-wiggle origin-[70%_50%]"
    style={{ width: size, height: size * 0.4, animationDuration: `${wiggle}s` }}
  >
    {/* Forked tail */}
    <path d="M14 20 C 8 14 4 10 0 5 C 4 13 5 17 4 20 C 5 23 4 27 0 35 C 4 30 8 26 14 20 Z" className="fill-hanada" />
    {/* Fins */}
    <path d="M40 10 C 45 2 54 1 59 8 Z" className="fill-hanada" />
    <path d="M47 28 C 51 34 57 35 59 30 Z" className="fill-hanada" />
    {/* Body, darker back, lateral line, eye */}
    <path d="M10 20 C 24 7 60 5 84 15 C 90 17 94 19 97 21 C 93 24 89 25 84 26 C 60 34 26 32 10 20 Z" className="fill-on-ai-soft" />
    <path d="M12 20 C 26 9 60 7 84 15 C 62 13 32 14 12 20 Z" className="fill-hanada" opacity="0.7" />
    <path d="M18 21 C 40 19 64 19 86 21" fill="none" className="stroke-hanada" strokeWidth="0.8" />
    <circle cx="87" cy="19" r="1.9" className="fill-sumi" />
  </svg>
)

/**
 * Three fish swimming through the waves, surfacing and dipping out of view.
 * Only three exist, so never more than three are on screen.
 */
const FISH: { top: number; size: number; swim: number; dip: number; delay: number; leftward: boolean; wiggle: number }[] = [
  { top: 18, size: 72, swim: 28, dip: 10, delay: -4, leftward: false, wiggle: 0.8 },
  { top: 58, size: 54, swim: 35, dip: 12, delay: -21, leftward: true, wiggle: 0.65 },
  { top: 36, size: 62, swim: 31, dip: 8, delay: -13, leftward: false, wiggle: 0.75 },
]

export const FishSchool: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div aria-hidden="true" className={`pointer-events-none overflow-hidden ${className}`}>
    {FISH.map((f, i) => (
      // Mirroring the full-width lane makes a leftward fish travel and face left.
      <div key={i} className="absolute inset-0" style={f.leftward ? { transform: 'scaleX(-1)' } : undefined}>
        <div
          className="absolute inset-x-0 animate-fish-swim"
          style={{ top: `${f.top}%`, animationDuration: `${f.swim}s`, animationDelay: `${f.delay}s` }}
        >
          <div
            className="w-fit animate-fish-dip"
            style={{ animationDuration: `${f.dip}s`, animationDelay: `${f.delay}s` }}
          >
            <Fish size={f.size} wiggle={f.wiggle} />
          </div>
        </div>
      </div>
    ))}
  </div>
)

/** Brush-stroke ensō, used as the loading indicator. */
export const Enso: React.FC<{ label?: string; className?: string }> = ({
  label = 'Loading…',
  className = '',
}) => (
  <div role="status" className={`flex flex-col items-center gap-4 ${className}`}>
    <svg viewBox="0 0 100 100" className="w-20 h-20" aria-hidden="true">
      <circle
        cx="50"
        cy="50"
        r="40"
        fill="none"
        className="stroke-sumi animate-enso origin-center"
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray="260"
        style={{ transformBox: 'fill-box' }}
      />
    </svg>
    <span className="font-display text-lg text-sumi-soft">{label}</span>
  </div>
)

/** Layered wave edge that closes a blue band onto paper. */
export const WaveEdge: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 1440 60"
    preserveAspectRatio="none"
    className={`block w-full h-10 md:h-14 ${className}`}
  >
    <path
      d="M0 34 C 120 10 240 10 360 30 S 600 54 720 34 S 960 6 1080 26 S 1320 52 1440 30 V60 H0 Z"
      className="fill-hanada"
      opacity="0.35"
    />
    <path
      d="M0 44 C 160 24 280 26 420 42 S 700 60 860 40 S 1160 20 1300 38 S 1400 46 1440 42 V60 H0 Z"
      className="fill-washi"
    />
  </svg>
)
