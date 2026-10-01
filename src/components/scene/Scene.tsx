import { Suspense, useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { CanvasTexture, Group, SRGBColorSpace } from 'three'
import Penguin from './Penguin'
import Director from './Director'
import { installPointerTracking } from '../../attention'
import { getMode, subscribeMode, walker } from '../../walk/state'

export default function Scene() {
  const host = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(true)
  const [ready, setReady] = useState(false)
  const onReady = useCallback(() => setReady(true), [])
  const resume = useSyncExternalStore(subscribeMode, getMode) === 'resume'

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
        frameloop={visible || resume ? 'always' : 'never'}
        camera={{ fov: 28, near: 0.1, far: 400 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        aria-hidden
      >
        <Director />
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
 * It follows the penguin along the path but keeps to the sun, not the body.
 */
function FloorShadow() {
  const group = useRef<Group>(null)
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
  useFrame(() => group.current?.position.set(walker.x, 0, walker.z))
  return (
    <group ref={group}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.1, 0.002, 0.02]} scale={[1.25, 0.62, 1]} renderOrder={-1}>
        <planeGeometry />
        <meshBasicMaterial map={texture} transparent opacity={0.38} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  )
}
