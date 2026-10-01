import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useLoader, useThree } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
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
import { attention, currentPointer } from '../../attention'
import { walker } from '../../walk/state'

const MODEL_URL = '/penguin.glb'

const SCALE = 1
const MODEL_HEIGHT = 1.334 // model units, feet at y = 0
export const PENGUIN_HEIGHT = MODEL_HEIGHT * SCALE

// Walking, procedurally (the mesh has no skeleton). Feet: measured from the
// mesh, the feet are the vertices below y ≈ 0.1 with |x| > 0.1, from z = -0.05
// to 0.19; the tail also reaches the ground but sits at |x| < 0.1, z < -0.2.
// Each foot slides back under the body while planted and swings forward,
// lifted, while the other one bears the weight. The body waddles over the
// planted foot, bobs twice per cycle, and holds its flippers out for balance.
const FEET = {
  height: { from: 0.05, to: 0.115 }, // weight fades out up the ankle
  inner: { from: 0.07, to: 0.1 }, // |x| ramp: excludes the tail
  back: { from: -0.16, to: -0.09 }, // z ramp: excludes the tail
  lift: 0.07,
}
const WADDLE = { roll: 0.085, bob: 0.022, twist: 0.07, lean: 0.07, flare: 0.26, flap: 0.1 }

// Model-space landmarks (the model is Y-up, beak toward +Z).
const NECK_PIVOT = new Vector3(0, 0.95, 0.01)
const NECK_BLEND = { from: 0.88, to: 1.02 } // head weight ramps up over this height
const HEAD_HALF_WIDTH = { from: 0.16, to: 0.24 } // |x| mask keeps flipper tops still
const HEAD_POINT = new Vector3(0, 1.18, 0.12) // roughly between the eyes

// Flippers: the model's flippers flare away from the body, which reads as a
// loose plank on the near side in three-quarter view. Swing them in slightly
// about the shoulder so they hang against the body.
//
// Measured from the mesh: body vertices never exceed |x| = 0.221, flipper
// vertices start at |x| = 0.224 and span y = 0.25..0.9. A narrow |x| ramp right
// at that seam moves each flipper as one rigid piece. (A wider ramp bends the
// flipper's inner edge less than its outer edge, which opened a light sliver
// along the inner edge near the tip.) The y ramp at the bottom keeps the few
// foot vertices that sit just past the seam from being dragged along.
const FLIPPER = {
  shoulder: new Vector3(0.235, 0.84, -0.02), // mirrored for the other side
  mask: { from: 0.2215, to: 0.2235 }, // |x| where flipper weight ramps in
  top: { from: 0.8, to: 0.9 }, // weight fades out toward the shoulder
  bottom: { from: 0.2, to: 0.24 }, // and is zero on the feet
  tuck: 0.2, // radians
  length: 0.93, // shorten slightly so the thin tip doesn't dangle below the body line
}

// Gaze limits, in radians. Positive pitch looks down.
// The body already faces left (toward the text), so turns to the right are
// capped tighter: at most the beak swings round to about face the viewer.
const YAW = { left: -0.45, right: 0.15 } // positive yaw turns the head to screen-right
const PITCH = { up: -0.1, down: 0.16 }
const ROLL = 0.09
const FOCUS_YAW = { left: -0.5, right: 0.2 }
const FOCUS_PITCH = { up: -0.14, down: 0.3 }

type Gaze = { yaw: number; pitch: number; roll: number }

// Cursor following: how long a glance at a hovered link holds before the cursor
// can take over, how long an idle glance holds before a moving cursor interrupts
// it (seconds), and the follow turn speed.
const FOLLOW = { linkHold: 0.9, interrupt: 0.5, speed: 0.95 }

function pickGaze(prev: Gaze, home: Gaze): Gaze {
  // Usually glance somewhere new; sometimes settle back toward home.
  if (Math.random() < 0.35) {
    return { yaw: home.yaw + MathUtils.randFloatSpread(0.12), pitch: home.pitch, roll: 0 }
  }
  let yaw = MathUtils.randFloat(YAW.left, YAW.right)
  if (Math.abs(yaw - prev.yaw) < 0.15) yaw = yaw > -0.15 ? YAW.left * 0.7 : YAW.right * 0.8 // avoid imperceptible moves
  return {
    yaw,
    pitch: MathUtils.randFloat(PITCH.up, PITCH.down),
    roll: Math.random() < 0.35 ? MathUtils.randFloatSpread(ROLL * 2) : 0,
  }
}

const reducedMotionQuery =
  typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null

export default function Penguin({ onReady }: { onReady?: () => void }) {
  const { scene } = useLoader(GLTFLoader, MODEL_URL)
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
      uFlipBottom: { value: [FLIPPER.bottom.from, FLIPPER.bottom.to] },
      uTuck: { value: FLIPPER.tuck },
      uFlipLen: { value: FLIPPER.length },
      uWalk: { value: 0 },
      uPhase: { value: 0 },
      uStride: { value: 0.3 },
      uFeetY: { value: [FEET.height.from, FEET.height.to] },
      uFeetX: { value: [FEET.inner.from, FEET.inner.to] },
      uFeetZ: { value: [FEET.back.from, FEET.back.to] },
      uLift: { value: FEET.lift },
      uFlare: { value: [WADDLE.flare, WADDLE.flap] },
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
            uniform vec2 uFlipBottom;
            uniform float uTuck;
            uniform float uFlipLen;
            uniform float uWalk;
            uniform float uPhase;
            uniform float uStride;
            uniform vec2 uFeetY;
            uniform vec2 uFeetX;
            uniform vec2 uFeetZ;
            uniform float uLift;
            uniform vec2 uFlare;
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
              * (1.0 - smoothstep(uFlipTop.x, uFlipTop.y, position.y))
              * smoothstep(uFlipBottom.x, uFlipBottom.y, position.y);
            // Each side's step phase: the right foot (-x) runs half a cycle behind.
            float footPhase = uPhase + (side > 0.0 ? 0.0 : PI);
            // Walking, the flippers come out for balance and swing gently.
            float flare = uWalk * (uFlare.x + uFlare.y * sin(footPhase + 1.2));
            mat3 flipRot = rotZ(-side * (uTuck - flare) * flipW);
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
            transformed = mix(transformed, uNeckPivot + uHead * (transformed - uNeckPivot), headW);
            // Feet: planted for the first half of each foot's cycle, sliding
            // back under the body exactly as fast as the body moves forward
            // (the phase advances with distance), then lifted and swung ahead.
            float footW = (1.0 - smoothstep(uFeetY.x, uFeetY.y, position.y))
              * smoothstep(uFeetX.x, uFeetX.y, abs(position.x))
              * smoothstep(uFeetZ.x, uFeetZ.y, position.z) * uWalk;
            if (footW > 0.0) {
              float u = fract(footPhase / (2.0 * PI));
              float reach;
              float lift = 0.0;
              if (u < 0.5) {
                reach = 0.5 - 2.0 * u;
              } else {
                float w = (u - 0.5) * 2.0;
                reach = -0.5 + smoothstep(0.0, 1.0, w);
                lift = sin(PI * w);
              }
              transformed.z += footW * reach * uStride;
              transformed.y += footW * lift * uLift;
            }`,
          )
      }
      material.customProgramCacheKey = () => 'penguin-head-flippers-walk'
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
      following: false,
      focusUntil: 0,
      glanceAt: 0,
      euler: new Euler(0, 0, 0, 'YXZ'),
      m4: new Matrix4(),
      ray: new Raycaster(),
      ndc: new Vector2(),
      plane: new Plane(new Vector3(0, 0, -1), 1.1), // z = 1.1, in front of the penguin
      hit: new Vector3(),
      head: new Vector3(),
      q: new Quaternion(),
      bodyYaw: 0,
    }),
    [],
  )

  // Turn a viewport point into a head gaze in the penguin's frame.
  function gazeToward(x: number, y: number): Gaze | null {
    if (!outer.current) return null
    const rect = gl.domElement.getBoundingClientRect()
    if (!rect.width || !rect.height) return null
    state.ndc.set(
      ((x - rect.left) / rect.width) * 2 - 1,
      -((y - rect.top) / rect.height) * 2 + 1,
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
      yaw: MathUtils.clamp(yaw, FOCUS_YAW.left, FOCUS_YAW.right),
      pitch: MathUtils.clamp(pitch, FOCUS_PITCH.up, FOCUS_PITCH.down),
      roll: MathUtils.clamp(-yaw * 0.08, -ROLL, ROLL),
    }
  }

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime
    const dt = Math.min(delta, 0.1) // avoid a jump after a backgrounded tab
    const still = reducedMotionQuery?.matches ?? false
    // Dev only: window.__penguinPose = { phase, amount } freezes the step
    // cycle at a pose, for inspecting the walk frame by frame.
    const pose = import.meta.env.DEV
      ? (window as { __penguinPose?: { phase: number; amount: number } }).__penguinPose
      : undefined
    const walking = pose?.amount ?? walker.amount
    const away = walker.resume > 0.02 // on the resume walk, or flying there

    // The scene's walk places and turns the whole bird.
    if (outer.current) {
      outer.current.position.set(walker.x, 0, walker.z)
      outer.current.rotation.y = walker.heading
    }
    state.plane.constant = walker.z + 1.1 // keep the gaze plane in front of it

    let speed = 1
    if (away) {
      // Eyes on the path: level, a touch down, no glances at the cursor.
      state.target.yaw = 0
      state.target.pitch = 0.12
      state.target.roll = 0
      state.seen = attention.version
      state.following = false
      state.nextChange = t + 1.5
    } else if (attention.version !== state.seen) {
      // A link was hovered or focused: look at it and hold a moment.
      state.seen = attention.version
      const focus = gazeToward(attention.x, attention.y)
      if (focus) {
        state.target = focus
        state.home = { yaw: focus.yaw * 0.5, pitch: focus.pitch * 0.5, roll: 0 }
        state.focusUntil = t + FOLLOW.linkHold
        state.nextChange = state.focusUntil
        state.following = false
      }
    } else if (!still) {
      // A moving cursor takes over shortly after a focus glance ends, or after
      // an idle glance has held for a beat; otherwise keep idling.
      const p = t > state.focusUntil ? currentPointer(performance.now()) : null
      const follow = p && gazeToward(p.x, p.y)
      if (follow && (state.following || t > state.nextChange || t - state.glanceAt > FOLLOW.interrupt)) {
        // Follow at a little less than the full angle: attentive, not fixated.
        state.target = { yaw: follow.yaw * 0.8, pitch: follow.pitch * 0.7, roll: follow.roll * 0.6 }
        state.following = true
        speed = FOLLOW.speed
      } else if (!follow && state.following) {
        // The cursor went still: hold that look briefly before idling again.
        state.following = false
        state.nextChange = t + MathUtils.randFloat(1.2, 2.2)
      } else if (!state.following && t > state.nextChange) {
        state.target = pickGaze(state.target, state.home)
        state.glanceAt = t
        state.nextChange = t + MathUtils.randFloat(2.4, 5.5)
      }
    }

    // Critically-damped easing: quick but soft head turns, then a still hold.
    // With reduced motion the head snaps to where it should look, no idling.
    const { gaze, target } = state
    const k = still ? 1e3 : speed
    gaze.yaw = MathUtils.damp(gaze.yaw, target.yaw, 3.2 * k, dt)
    gaze.pitch = MathUtils.damp(gaze.pitch, target.pitch, 2.6 * k, dt)
    gaze.roll = MathUtils.damp(gaze.roll, target.roll, 2.2 * k, dt)

    // The waddle: roll over the planted foot (the left foot, +x, swings while
    // sin(phase) < 0), bob up at each mid-stance, twist the hips toward the
    // swinging foot and lean into the walk. The head counters most of the roll.
    const phase = pose?.phase ?? walker.phase
    const roll = -Math.sin(phase) * WADDLE.roll * walking

    state.euler.set(gaze.pitch, gaze.yaw, gaze.roll - roll * 0.75)
    uniforms.uHead.value.setFromMatrix4(state.m4.makeRotationFromEuler(state.euler))
    uniforms.uWalk.value = walking
    uniforms.uPhase.value = phase
    uniforms.uStride.value = walker.stride

    // Body: slow breathing, a gentle weight shift, and a slight follow of the
    // head when idle; the waddle when walking.
    if (body.current) {
      const b = body.current
      const breath = still ? 0 : Math.sin(t * 1.7) * (1 - walking)
      b.scale.set(1 - breath * 0.004, 1 + breath * 0.008, 1 - breath * 0.004)
      state.bodyYaw = MathUtils.damp(state.bodyYaw, gaze.yaw * 0.18, 1.2, dt)
      b.rotation.z = (still ? 0 : Math.sin(t * 0.45) * 0.012 * (1 - walking)) + roll
      b.rotation.y = state.bodyYaw + Math.sin(phase) * WADDLE.twist * walking
      b.rotation.x = WADDLE.lean * walking
      b.position.y = ((1 - Math.cos(2 * phase)) / 2) * WADDLE.bob * walking
    }
  })

  return (
    <group ref={outer} rotation={[0, walker.heading, 0]} scale={SCALE}>
      <group ref={body}>
        <primitive object={scene} />
      </group>
    </group>
  )
}

useLoader.preload(GLTFLoader, MODEL_URL)
