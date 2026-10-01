import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { CanvasTexture, SRGBColorSpace, type PerspectiveCamera } from 'three'
import Penguin, { PENGUIN_HEIGHT } from './Penguin'
import { installPointerTracking } from '../../attention'

const FOV = 28

// Where the penguin stands, in shares of the hero (which the canvas fills):
// `x` its center, `feet` its feet from the top (keep them just below
// --horizon in index.css), `height` its height. `maxW` caps the height as a
// share of the width, so narrow or squat windows shrink it instead of crowding
// the type.
const STAND = {
  wide: { x: 0.69, feet: 0.855, height: 0.62, maxW: 0.36 },
  narrow: { x: 0.52, feet: 0.7, height: 0.38, maxW: 0.8 },
}

function Rig() {
  const camera = useThree((s) => s.camera) as PerspectiveCamera
  const size = useThree((s) => s.size)

  useEffect(() => {
    const { width: w, height: h } = size
    const stand = w >= 768 && w / h >= 0.8 ? STAND.wide : STAND.narrow // the `wide` variant in index.css
    const px = Math.min(stand.height * h, stand.maxW * w)
    const viewH = (PENGUIN_HEIGHT * h) / px // world units spanned by the canvas height
    const dist = viewH / (2 * Math.tan((FOV * Math.PI) / 360))
    const targetY = (stand.feet - 0.5) * viewH
    camera.position.set(0, targetY + dist * 0.07, dist)
    camera.lookAt(0, targetY, 0)
    // Shift the lens rather than the camera, so the penguin keeps the same
    // straight-on view wherever it stands in the frame.
    camera.setViewOffset(w, h, -(stand.x - 0.5) * w, 0, w, h)
    camera.updateProjectionMatrix()
  }, [camera, size])

  return null
}

export default function Scene() {
  const host = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(true)
  const [ready, setReady] = useState(false)
  const onReady = useCallback(() => setReady(true), [])

  useEffect(installPointerTracking, [])

  // Stop rendering entirely when the scene is scrolled out of view.
  useEffect(() => {
    const el = host.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting))
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div
      ref={host}
      className={[
        'pointer-events-none absolute inset-0 transition-[opacity,translate] duration-1000 ease-out-soft',
        ready ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0',
      ].join(' ')}
    >
      <Canvas
        flat
        dpr={[1, 1.5]}
        frameloop={visible ? 'always' : 'never'}
        camera={{ fov: FOV, near: 0.1, far: 50 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        aria-hidden
      >
        <Rig />
        {/* The model's colors are flat vertex colors (navy, ice, orange) and the
            canvas renders them untonemapped. A strong, near-white sky fill keeps
            the belly white even on facets turned away from the sun; a moderate
            key from the front-left carves the facets; a cool rim separates the
            navy back from the sky. Lambert: lit ≈ albedo × (fill + key·cosθ) / π,
            so fill ≈ 2.4 keeps shade-side white near 85% and the key stays low
            enough that the orange doesn't clip toward yellow. */}
        <hemisphereLight args={['#f5f8ff', '#eeece8', 2.5]} />
        <directionalLight position={[-3.2, 3.6, 4.2]} intensity={1.6} color="#f7f9ff" />
        <directionalLight position={[2.6, 0.8, 3]} intensity={0.35} color="#e9eef6" />
        <directionalLight position={[3.5, 2.4, -3.5]} intensity={1.1} color="#d6e2ff" />
        <Suspense fallback={null}>
          <Penguin onReady={onReady} />
          <FloorShadow />
        </Suspense>
      </Canvas>
    </div>
  )
}

/**
 * A soft navy shadow under the feet: one textured quad, no extra render pass.
 * Wider than deep and nudged to the right, away from the low sun on the left.
 */
function FloorShadow() {
  const texture = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = c.height = 128
    const g = c.getContext('2d')!
    const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64)
    grad.addColorStop(0, 'rgba(31,37,54,1)')
    grad.addColorStop(0.35, 'rgba(31,37,54,0.62)')
    grad.addColorStop(0.7, 'rgba(31,37,54,0.18)')
    grad.addColorStop(1, 'rgba(31,37,54,0)')
    g.fillStyle = grad
    g.fillRect(0, 0, 128, 128)
    const t = new CanvasTexture(c)
    t.colorSpace = SRGBColorSpace
    return t
  }, [])
  useEffect(() => () => texture.dispose(), [texture])
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.1, 0.002, 0.02]} scale={[1.25, 0.62, 1]} renderOrder={-1}>
      <planeGeometry />
      <meshBasicMaterial map={texture} transparent opacity={0.38} depthWrite={false} toneMapped={false} />
    </mesh>
  )
}
