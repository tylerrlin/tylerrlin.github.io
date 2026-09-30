import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import {
  Euler,
  Group,
  MathUtils,
  Matrix3,
  Matrix4,
  Mesh,
  Vector3,
  type Material,
} from 'three'

const MODEL_URL = '/penguin.glb'

// Model-space landmarks (the model is Y-up, beak toward +Z).
const NECK_PIVOT = new Vector3(0, 0.95, 0.01)
const NECK_BLEND = { from: 0.88, to: 1.02 } // head weight ramps up over this height
const HEAD_HALF_WIDTH = { from: 0.16, to: 0.24 } // |x| mask keeps flipper tops still

// Gaze limits, in radians. Positive pitch looks down.
const YAW = 0.45
const PITCH = { up: -0.1, down: 0.16 }
const ROLL = 0.09

type Gaze = { yaw: number; pitch: number; roll: number }

function pickGaze(prev: Gaze): Gaze {
  // Usually glance somewhere new; sometimes settle back toward the viewer.
  if (Math.random() < 0.3) {
    return { yaw: MathUtils.randFloatSpread(0.12), pitch: 0.02, roll: 0 }
  }
  let yaw = MathUtils.randFloat(-YAW, YAW)
  if (Math.abs(yaw - prev.yaw) < 0.15) yaw = -yaw * 0.8 // avoid imperceptible moves
  return {
    yaw,
    pitch: MathUtils.randFloat(PITCH.up, PITCH.down),
    roll: Math.random() < 0.35 ? MathUtils.randFloatSpread(ROLL * 2) : 0,
  }
}

export default function Penguin() {
  const { scene } = useGLTF(MODEL_URL)
  const body = useRef<Group>(null)

  const uniforms = useMemo(
    () => ({
      uHead: { value: new Matrix3() },
      uNeckPivot: { value: NECK_PIVOT },
      uNeckBlend: { value: [NECK_BLEND.from, NECK_BLEND.to] },
      uHeadWidth: { value: [HEAD_HALF_WIDTH.from, HEAD_HALF_WIDTH.to] },
    }),
    [],
  )

  // Bend the head in the vertex shader: the mesh has no skeleton, so vertices
  // above the neck rotate about a pivot with a smooth falloff down the neck.
  useEffect(() => {
    scene.traverse((obj) => {
      if (!(obj as Mesh).isMesh) return
      const material = (obj as Mesh).material as Material
      material.onBeforeCompile = (shader) => {
        Object.assign(shader.uniforms, uniforms)
        shader.vertexShader = shader.vertexShader
          .replace(
            '#include <common>',
            `#include <common>
            uniform mat3 uHead;
            uniform vec3 uNeckPivot;
            uniform vec2 uNeckBlend;
            uniform vec2 uHeadWidth;`,
          )
          .replace(
            '#include <beginnormal_vertex>',
            `#include <beginnormal_vertex>
            float headW = smoothstep(uNeckBlend.x, uNeckBlend.y, position.y)
              * (1.0 - smoothstep(uHeadWidth.x, uHeadWidth.y, abs(position.x)));
            objectNormal = normalize(mix(objectNormal, uHead * objectNormal, headW));`,
          )
          .replace(
            '#include <begin_vertex>',
            `#include <begin_vertex>
            transformed = mix(transformed, uNeckPivot + uHead * (transformed - uNeckPivot), headW);`,
          )
      }
      material.customProgramCacheKey = () => 'penguin-head'
      material.needsUpdate = true
    })
  }, [scene, uniforms])

  const state = useMemo(
    () => ({
      gaze: { yaw: 0, pitch: 0.02, roll: 0 } as Gaze,
      target: { yaw: 0, pitch: 0.02, roll: 0 } as Gaze,
      nextChange: 1.5,
      euler: new Euler(0, 0, 0, 'YXZ'),
      m4: new Matrix4(),
      reducedMotion:
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    }),
    [],
  )

  useFrame(({ clock }, delta) => {
    if (state.reducedMotion) return
    const t = clock.elapsedTime
    const dt = Math.min(delta, 0.1) // avoid a jump after a backgrounded tab

    if (t > state.nextChange) {
      state.target = pickGaze(state.target)
      state.nextChange = t + MathUtils.randFloat(2.2, 5.5)
    }

    // Critically-damped easing: quick but soft head turns, then a still hold.
    const { gaze, target } = state
    gaze.yaw = MathUtils.damp(gaze.yaw, target.yaw, 3.2, dt)
    gaze.pitch = MathUtils.damp(gaze.pitch, target.pitch, 2.6, dt)
    gaze.roll = MathUtils.damp(gaze.roll, target.roll, 2.2, dt)

    state.euler.set(gaze.pitch, gaze.yaw, gaze.roll)
    uniforms.uHead.value.setFromMatrix4(state.m4.makeRotationFromEuler(state.euler))

    // Body: slow breathing, a gentle weight shift, and a slight follow of the head.
    if (body.current) {
      const breath = Math.sin(t * 1.7)
      body.current.scale.set(1 - breath * 0.004, 1 + breath * 0.008, 1 - breath * 0.004)
      body.current.rotation.z = Math.sin(t * 0.45) * 0.012
      body.current.rotation.y = MathUtils.damp(body.current.rotation.y, gaze.yaw * 0.18, 1.2, dt)
    }
  })

  return (
    <group position={[0, -0.55, 0]} rotation={[0, -0.5, 0]} scale={0.85}>
      <group ref={body}>
        <primitive object={scene} />
      </group>
    </group>
  )
}

useGLTF.preload(MODEL_URL)
