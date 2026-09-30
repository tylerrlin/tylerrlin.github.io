import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { ContactShadows } from '@react-three/drei'
import Penguin, { PENGUIN_HEIGHT } from './Penguin'

const FOV = 28

// Frame the camera from the container's shape instead of fixed numbers, so the
// penguin keeps the same presence (and its feet stay on the painted snowfield)
// at any viewport size.
function Rig() {
  const camera = useThree((s) => s.camera)
  const size = useThree((s) => s.size)

  useEffect(() => {
    const mobile = size.width < 560
    const heightShare = mobile ? 0.7 : 0.53 // penguin height / canvas height
    const feetAt = mobile ? 0.9 : 0.835 // feet position from the top, 0..1
    const viewH = PENGUIN_HEIGHT / heightShare
    const dist = viewH / (2 * Math.tan((FOV * Math.PI) / 360))
    const targetY = (feetAt - 0.5) * viewH
    // On desktop, nudge the penguin toward the menu so the two read as one group.
    const aspect = size.width / size.height
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
        {/* Soft sky fill from above, warm bounce from the snow below. */}
        <hemisphereLight args={['#f4f7fc', '#e9e4dc', 1.35]} />
        {/* Low warm key from the front-left, like the sun on the backdrop. */}
        <directionalLight position={[-3.2, 3.6, 4.2]} intensity={2.35} color="#fbfcff" />
        {/* Cool rim from behind-right to separate the navy back from the sky. */}
        <directionalLight position={[3.5, 2.4, -3.5]} intensity={1.3} color="#d6e2ff" />
        <Suspense fallback={null}>
          <Penguin onReady={onReady} />
          <ContactShadows
            position={[0, 0.001, 0]}
            opacity={0.42}
            scale={2.6}
            blur={2.4}
            far={1.2}
            resolution={512}
            color="#1f2536"
            frames={1}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}
