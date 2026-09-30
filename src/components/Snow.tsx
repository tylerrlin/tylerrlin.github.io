import { useEffect, useRef } from 'react'

// Sparse, slow snowfall on a 2D canvas. Cheap: a few dozen dots, no allocation
// per frame, paused while the tab is hidden, and a still frame under reduced motion.

type Flake = { x: number; y: number; r: number; vy: number; sway: number; phase: number; a: number }

export default function Snow() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
    let flakes: Flake[] = []
    let w = 0
    let h = 0
    let raf = 0
    let last = performance.now()

    const spawn = (y?: number): Flake => {
      const depth = Math.random() // 0 = far, 1 = near
      return {
        x: Math.random() * w,
        y: y ?? Math.random() * h,
        r: 0.7 + depth * 1.9,
        vy: 9 + depth * 22,
        sway: 6 + depth * 14,
        phase: Math.random() * Math.PI * 2,
        a: 0.45 + depth * 0.5,
      }
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const count = Math.min(90, Math.round((w * h) / 16000))
      flakes = Array.from({ length: count }, () => spawn())
    }

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = '#ffffff'
      for (const f of flakes) {
        // Fade flakes out as they reach the bright snowfield.
        const fade = Math.min(1, Math.max(0, (h * 0.82 - f.y) / (h * 0.3)))
        ctx.globalAlpha = f.a * fade
        ctx.beginPath()
        ctx.arc(f.x + Math.sin(t / 1000 + f.phase) * f.sway, f.y, f.r, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
    }

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      for (const f of flakes) {
        f.y += f.vy * dt
        if (f.y > h + 4) Object.assign(f, spawn(-4))
      }
      draw(now)
      raf = requestAnimationFrame(tick)
    }

    const start = () => {
      cancelAnimationFrame(raf)
      if (reduce.matches) {
        draw(0)
        return
      }
      last = performance.now()
      raf = requestAnimationFrame(tick)
    }

    resize()
    start()
    const onResize = () => {
      resize()
      if (reduce.matches) draw(0)
    }
    window.addEventListener('resize', onResize)
    reduce.addEventListener('change', start)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      reduce.removeEventListener('change', start)
    }
  }, [])

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 h-svh w-full md:fixed md:h-lvh"
    />
  )
}
