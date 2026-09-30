// The polar setting: a soft dawn sky, a low sun, faceted ridges that echo the
// penguin's low-poly build, and a snowfield for it to stand on. Pure CSS/SVG.

type Peak = { x: number; h: number; w: number; lean?: number }

// Ridge peaks in a 1440 x 240 box, base at y = 240. `lean` shifts the crease.
const FAR: Peak[] = [
  { x: 40, h: 46, w: 220 },
  { x: 360, h: 34, w: 230, lean: 20 },
  { x: 700, h: 70, w: 250 },
  { x: 960, h: 150, w: 270, lean: -30 },
  { x: 1180, h: 205, w: 250 },
  { x: 1390, h: 128, w: 220, lean: 25 },
  { x: 1560, h: 90, w: 200 },
]

// Near ridges stay low on the left so the menu reads on open sky.
const NEAR: Peak[] = [
  { x: 120, h: 22, w: 240 },
  { x: 520, h: 30, w: 260, lean: 30 },
  { x: 880, h: 64, w: 240, lean: 30 },
  { x: 1090, h: 98, w: 230, lean: -20 },
  { x: 1340, h: 70, w: 230, lean: 30 },
  { x: 1520, h: 52, w: 180 },
]

function Ridge({ peaks, lit, shade }: { peaks: Peak[]; lit: string; shade: string }) {
  return (
    <>
      {peaks.map(({ x, h, w, lean = 0 }, i) => {
        const top = 240 - h
        const crease = x + lean + w * 0.12
        return (
          <g key={i}>
            <polygon points={`${x - w},240 ${x},${top} ${crease},240`} fill={lit} />
            <polygon points={`${x},${top} ${x + w},240 ${crease},240`} fill={shade} />
          </g>
        )
      })}
    </>
  )
}

export default function Backdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 h-svh overflow-hidden md:fixed md:h-lvh"
    >
      {/* Sky: cool at the zenith, warming toward the horizon. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, #aebdd0 0%, #c6d0dd 26%, #dcdfe3 48%, #eee4d6 var(--horizon), #eee4d6 100%)',
        }}
      />
      {/* Low sun and its glow, behind the penguin. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 42% at var(--sun-x) var(--horizon), rgba(238,150,42,0.30), rgba(238,150,42,0.10) 45%, transparent 72%)',
        }}
      />
      <div
        className="absolute size-28 -translate-x-1/2 -translate-y-1/2 rounded-full md:size-36"
        style={{
          left: 'var(--sun-x)',
          top: 'calc(var(--horizon) - 13%)',
          background: 'radial-gradient(circle, #fbf1e2 0%, #f8e6cc 55%, rgba(248,230,204,0) 71%)',
        }}
      />

      {/* Ridges sit on the horizon line. */}
      <svg
        className="absolute inset-x-0 h-[23vh] w-full md:h-[26vh]"
        style={{ bottom: 'calc(100% - var(--horizon))' }}
        viewBox="0 0 1440 240"
        preserveAspectRatio="xMidYMax slice"
      >
        <Ridge peaks={FAR} lit="#cdd5e0" shade="#b8c3d2" />
        <Ridge peaks={NEAR} lit="#e3e6ea" shade="#c4cdd9" />
      </svg>

      {/* Snowfield: bright at the horizon line, settling to warm ice. */}
      <div
        className="absolute inset-x-0 bottom-0"
        style={{
          top: 'var(--horizon)',
          background: 'linear-gradient(180deg, #f7f5f1 0%, #efece5 40%, var(--color-ice) 100%)',
        }}
      />
      <div
        className="absolute inset-x-0 h-px"
        style={{ top: 'var(--horizon)', background: 'rgba(31,37,54,0.08)' }}
      />
    </div>
  )
}
