import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { ContactShadows } from '@react-three/drei'
import Penguin from './Penguin'

export default function Scene() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0.15, 3.9], fov: 38 }}
      gl={{ powerPreference: 'high-performance', antialias: true }}
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 5, 2]} intensity={1.4} />
      <Suspense fallback={null}>
        <Penguin />
        <ContactShadows
          position={[0, -0.55, 0]}
          opacity={0.3}
          blur={2.5}
          far={3}
          frames={1}
        />
      </Suspense>
    </Canvas>
  )
}
