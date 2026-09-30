import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import {
  Euler,
  Group,
  MathUtils,
  Matrix3,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  Plane,
  Quaternion,
  Raycaster,
  Vector2,
  Vector3,
} from 'three'
import { attention } from '../../attention'

const MODEL_URL = '/penguin.glb'

const SCALE = 1
const MODEL_HEIGHT = 1.334 // model units, feet at y = 0
export const PENGUIN_HEIGHT = MODEL_HEIGHT * SCALE
const FACING = -0.42 // body yaw: a three-quarter turn toward the menu

// Model-space landmarks (the model is Y-up, beak toward +Z).
const NECK_PIVOT = new Vector3(0, 0.95, 0.01)
const NECK_BLEND = { from: 0.88, to: 1.02 } // head weight ramps up over this height
const HEAD_HALF_WIDTH = { from: 0.16, to: 0.24 } // |x| mask keeps flipper tops still
const HEAD_POINT = new Vector3(0, 1.18, 0.12) // roughly between the eyes

// Flippers: the model's flippers flare away from the body, which reads as a
// loose plank on the near side in three-quarter view. Swing them in slightly
// about the shoulder so they hang against the body.
const FLIPPER = {
  shoulder: new Vector3(0.235, 0.84, -0.02), // mirrored for the other side
  mask: { from: 0.235, to: 0.29 }, // |x| where flipper weight ramps in
  top: { from: 0.78, to: 0.88 }, // weight fades out toward the shoulder
  tuck: 0.2, // radians
  length: 0.88, // shorten slightly so the thin tip doesn't dangle below the body line
}

// Gaze limits, in radians. Positive pitch looks down.
const YAW = 0.45
const PITCH = { up: -0.1, down: 0.16 }
const ROLL = 0.09
const FOCUS_YAW = 0.5
const FOCUS_PITCH = { up: -0.14, down: 0.3 }

type Gaze = { yaw: number; pitch: number; roll: number }

function pickGaze(prev: Gaze, home: Gaze): Gaze {
  // Usually glance somewhere new; sometimes settle back toward home.
  if (Math.random() < 0.35) {
    return { yaw: home.yaw + MathUtils.randFloatSpread(0.12), pitch: home.pitch, roll: 0 }
  }
  let yaw = MathUtils.randFloat(-YAW, YAW)
  if (Math.abs(yaw - prev.yaw) < 0.15) yaw = -yaw * 0.8 // avoid imperceptible moves
  return {
    yaw,
    pitch: MathUtils.randFloat(PITCH.up, PITCH.down),
    roll: Math.random() < 0.35 ? MathUtils.randFloatSpread(ROLL * 2) : 0,
  }
}

const reducedMotionQuery =
  typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null

export default function Penguin({ onReady }: { onReady?: () => void }) {
  const { scene } = useGLTF(MODEL_URL)
  const outer = useRef<Group>(null)
  const body = useRef<Group>(null)
  const camera = useThree((s) => s.camera)
  const gl = useThree((s) => s.gl)

  const uniforms = useMemo(
    () => ({
      uHead: { value: new Matrix3() },
      uNeckPivot: { value: NECK_PIVOT },
      uNeckBlend: { value: [NECK_BLEND.from, NECK_BLEND.to] },
      uHeadWidth: { value: [HEAD_HALF_WIDTH.from, HEAD_HALF_WIDTH.to] },
      uShoulder: { value: FLIPPER.shoulder },
      uFlipMask: { value: [FLIPPER.mask.from, FLIPPER.mask.to] },
      uFlipTop: { value: [FLIPPER.top.from, FLIPPER.top.to] },
      uTuck: { value: FLIPPER.tuck },
      uFlipLen: { value: FLIPPER.length },
    }),
    [],
  )

  // Bend the head (and settle the flippers) in the vertex shader: the mesh has
  // no skeleton, so vertices rotate about pivots with smooth falloffs.
  useEffect(() => {
    scene.traverse((obj) => {
      if (!(obj as Mesh).isMesh) return
      const material = (obj as Mesh).material as MeshStandardMaterial
      // Matte, flat-colored faces: no sheen, so each facet reads as one tone.
      material.roughness = 1
      material.metalness = 0
      material.onBeforeCompile = (shader) => {
        Object.assign(shader.uniforms, uniforms)
        shader.vertexShader = shader.vertexShader
          .replace(
            '#include <common>',
            `#include <common>
            uniform mat3 uHead;
            uniform vec3 uNeckPivot;
            uniform vec2 uNeckBlend;
            uniform vec2 uHeadWidth;
            uniform vec3 uShoulder;
            uniform vec2 uFlipMask;
            uniform vec2 uFlipTop;
            uniform float uTuck;
            uniform float uFlipLen;
            mat3 rotZ(float a) {
              float c = cos(a), s = sin(a);
              return mat3(c, s, 0.0, -s, c, 0.0, 0.0, 0.0, 1.0);
            }`,
          )
          .replace(
            '#include <beginnormal_vertex>',
            `#include <beginnormal_vertex>
            float side = sign(position.x);
            float flipW = smoothstep(uFlipMask.x, uFlipMask.y, abs(position.x))
              * (1.0 - smoothstep(uFlipTop.x, uFlipTop.y, position.y));
            mat3 flipRot = rotZ(-side * uTuck * flipW);
            vec3 shoulder = vec3(side * uShoulder.x, uShoulder.yz);
            float headW = smoothstep(uNeckBlend.x, uNeckBlend.y, position.y)
              * (1.0 - smoothstep(uHeadWidth.x, uHeadWidth.y, abs(position.x)));
            objectNormal = flipRot * objectNormal;
            objectNormal = normalize(mix(objectNormal, uHead * objectNormal, headW));`,
          )
          .replace(
            '#include <begin_vertex>',
            `#include <begin_vertex>
            vec3 fromShoulder = transformed - shoulder;
            fromShoulder.y *= mix(1.0, uFlipLen, flipW);
            transformed = shoulder + flipRot * fromShoulder;
            transformed = mix(transformed, uNeckPivot + uHead * (transformed - uNeckPivot), headW);`,
          )
      }
      material.customProgramCacheKey = () => 'penguin-head-flippers'
      material.needsUpdate = true
    })
    // Reveal after the patched shader has had a frame to compile.
    const id = requestAnimationFrame(() => requestAnimationFrame(() => onReady?.()))
    return () => cancelAnimationFrame(id)
  }, [scene, uniforms, onReady])

  const state = useMemo(
    () => ({
      home: { yaw: 0, pitch: 0.02, roll: 0 } as Gaze,
      gaze: { yaw: 0, pitch: 0.02, roll: 0 } as Gaze,
      target: { yaw: 0, pitch: 0.02, roll: 0 } as Gaze,
      nextChange: 1.5,
      seen: attention.version,
      euler: new Euler(0, 0, 0, 'YXZ'),
      m4: new Matrix4(),
      ray: new Raycaster(),
      ndc: new Vector2(),
      plane: new Plane(new Vector3(0, 0, -1), 1.1), // z = 1.1, in front of the penguin
      hit: new Vector3(),
      head: new Vector3(),
      q: new Quaternion(),
    }),
    [],
  )

  // Turn the latest DOM attention point into a head gaze in the penguin's frame.
  function gazeTowardAttention(): Gaze | null {
    if (!outer.current) return null
    const rect = gl.domElement.getBoundingClientRect()
    if (!rect.width || !rect.height) return null
    state.ndc.set(
      ((attention.x - rect.left) / rect.width) * 2 - 1,
      -((attention.y - rect.top) / rect.height) * 2 + 1,
    )
    state.ray.setFromCamera(state.ndc, camera)
    if (!state.ray.ray.intersectPlane(state.plane, state.hit)) return null
    outer.current.updateWorldMatrix(true, false)
    state.head.copy(HEAD_POINT).applyMatrix4(outer.current.matrixWorld)
    const dir = state.hit.sub(state.head)
    dir.applyQuaternion(state.q.setFromRotationMatrix(outer.current.matrixWorld).invert())
    const yaw = Math.atan2(dir.x, dir.z)
    const pitch = Math.atan2(-dir.y, Math.hypot(dir.x, dir.z))
    return {
      yaw: MathUtils.clamp(yaw, -FOCUS_YAW, FOCUS_YAW),
      pitch: MathUtils.clamp(pitch, FOCUS_PITCH.up, FOCUS_PITCH.down),
      roll: MathUtils.clamp(-yaw * 0.08, -ROLL, ROLL),
    }
  }

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime
    const dt = Math.min(delta, 0.1) // avoid a jump after a backgrounded tab
    const still = reducedMotionQuery?.matches ?? false

    if (attention.version !== state.seen) {
      state.seen = attention.version
      const focus = gazeTowardAttention()
      if (focus) {
        state.target = focus
        state.home = { yaw: focus.yaw * 0.5, pitch: focus.pitch * 0.5, roll: 0 }
        state.nextChange = t + (attention.kind === 'panel' ? 5.5 : 3.2)
      }
    } else if (!still && t > state.nextChange) {
      state.target = pickGaze(state.target, state.home)
      state.nextChange = t + MathUtils.randFloat(2.4, 5.5)
    }

    // Critically-damped easing: quick but soft head turns, then a still hold.
    // With reduced motion the head snaps to where it should look, no idling.
    const { gaze, target } = state
    const k = still ? 1e3 : 1
    gaze.yaw = MathUtils.damp(gaze.yaw, target.yaw, 3.2 * k, dt)
    gaze.pitch = MathUtils.damp(gaze.pitch, target.pitch, 2.6 * k, dt)
    gaze.roll = MathUtils.damp(gaze.roll, target.roll, 2.2 * k, dt)

    state.euler.set(gaze.pitch, gaze.yaw, gaze.roll)
    uniforms.uHead.value.setFromMatrix4(state.m4.makeRotationFromEuler(state.euler))

    // Body: slow breathing, a gentle weight shift, and a slight follow of the head.
    if (body.current && !still) {
      const breath = Math.sin(t * 1.7)
      body.current.scale.set(1 - breath * 0.004, 1 + breath * 0.008, 1 - breath * 0.004)
      body.current.rotation.z = Math.sin(t * 0.45) * 0.012
      body.current.rotation.y = MathUtils.damp(body.current.rotation.y, gaze.yaw * 0.18, 1.2, dt)
    }
  })

  return (
    <group ref={outer} rotation={[0, FACING, 0]} scale={SCALE}>
      <group ref={body}>
        <primitive object={scene} />
      </group>
    </group>
  )
}

useGLTF.preload(MODEL_URL)
