import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { CanvasTexture, SRGBColorSpace } from 'three'
import Penguin, { PENGUIN_HEIGHT } from './Penguin'
import { installPointerTracking } from '../../attention'

const FOV = 28

// Frame the camera from the container's shape instead of fixed numbers, so the
// penguin keeps the same presence (and its feet stay on the painted snowfield)
// at any viewport size.
function Rig() {
  const camera = useThree((s) => s.camera)
  const size = useThree((s) => s.size)

  useEffect(() => {
    const mobile = size.width < 560
    const heightShare = mobile ? 0.66 : 0.53 // penguin height / canvas height
    const feetAt = mobile ? 0.9 : 0.835 // feet position from the top, 0..1
    const aspect = size.width / size.height
    // Keep ~1.9 model units of width in view (the penguin plus its beak mid
    // head-turn and its shadow), so tall, narrow columns — portrait tablets —
    // shrink the penguin instead of cropping it.
    const viewH = Math.max(PENGUIN_HEIGHT / heightShare, 1.9 / aspect)
    const dist = viewH / (2 * Math.tan((FOV * Math.PI) / 360))
    const targetY = (feetAt - 0.5) * viewH
    // On desktop, nudge the penguin toward the menu so the two read as one group.
    const shiftX = mobile ? 0 : 0.12 * viewH * aspect
    camera.position.set(shiftX, targetY + dist * 0.07, dist)
    camera.lookAt(shiftX, targetY, 0)
    camera.updateProjectionMatrix()
  }, [camera, size.width, size.height])

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
        dpr={[1, 1.75]}
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
