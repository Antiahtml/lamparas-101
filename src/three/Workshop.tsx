import { CameraControls, Edges, RoundedBox } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { LampManifest } from '../content/types'
import { useApp } from '../state/store'
import { camApi, fx, HOME_VIEW } from './fx'
import { Lamp } from './Lamp'
import { C, toon } from './materials'
import { BenchProps } from './props/BenchProps'

export function Workshop({ lamp }: { lamp: LampManifest }) {
  const select = useApp((s) => s.select)
  const T = useApp((s) => s.inventory.T) ?? lamp.validatedBoard
  const holder = useApp((s) => s.inventory.holder)
  return (
    <>
      <Lights />
      <CameraRig />
      <group onPointerMissed={() => select(null)}>
        <Bench />
        <Lamp lamp={lamp} T={T} holder={holder} />
        <BenchProps lamp={lamp} />
      </group>
    </>
  )
}

function Lights() {
  return (
    <>
      <hemisphereLight args={['#FFF4DF', '#B48A5E', 1.6]} />
      <directionalLight
        position={[-0.9, 1.8, 1.2]}
        intensity={2.2}
        color="#FFF1DA"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-camera-left={-1}
        shadow-camera-right={1}
        shadow-camera-top={1}
        shadow-camera-bottom={-1}
        shadow-camera-near={0.5}
        shadow-camera-far={4}
      />
    </>
  )
}

function CameraRig() {
  const ref = useRef<CameraControls>(null)
  const invalidate = useThree((s) => s.invalidate)
  useEffect(() => {
    const c = ref.current
    if (!c) return
    camApi.controls = c
    c.setLookAt(HOME_VIEW.px, HOME_VIEW.py, HOME_VIEW.pz, HOME_VIEW.tx, HOME_VIEW.ty, HOME_VIEW.tz, false)
    return () => {
      camApi.controls = null
    }
  }, [invalidate])
  useFrame(() => {
    const c = ref.current
    if (c && fx.camDriven) {
      const v = fx.cam
      c.setLookAt(v.px, v.py, v.pz, v.tx, v.ty, v.tz, false)
    }
  })
  return (
    <CameraControls
      ref={ref}
      makeDefault
      minDistance={0.3}
      maxDistance={3.4}
      minPolarAngle={0.15}
      maxPolarAngle={Math.PI / 2 - 0.05}
      smoothTime={0.35}
      draggingSmoothTime={0.12}
      dollySpeed={0.6}
    />
  )
}

function pegTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const g = c.getContext('2d')!
  g.fillStyle = C.peg
  g.fillRect(0, 0, 64, 64)
  g.fillStyle = '#B9A47C'
  g.beginPath()
  g.arc(32, 32, 5, 0, Math.PI * 2)
  g.fill()
  const t = new THREE.CanvasTexture(c)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(36, 11)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

function Bench() {
  const peg = useMemo(() => new THREE.MeshToonMaterial({ map: pegTexture(), gradientMap: toon(C.peg).gradientMap }), [])
  const legs: [number, number][] = [
    [-0.78, 0.33],
    [0.78, 0.33],
    [-0.78, -0.33],
    [0.78, -0.33],
  ]
  return (
    <group>
      {/* tablero del banco */}
      <RoundedBox args={[1.8, 0.07, 0.86]} radius={0.012} smoothness={2} position={[0, -0.035, -0.02]} material={toon(C.benchTop)}>
        <Edges threshold={30} color={C.ink} lineWidth={1.4} />
      </RoundedBox>
      {/* listones del tablero, dibujados */}
      {[-0.24, 0.0, 0.24].map((z) => (
        <mesh key={z} position={[0, 0.0003, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.78, 0.002]} />
          <meshBasicMaterial color={C.benchDark} transparent opacity={0.35} />
        </mesh>
      ))}
      <mesh position={[0, -0.1, 0.39]} material={toon(C.bench)}>
        <boxGeometry args={[1.7, 0.08, 0.03]} />
        <Edges threshold={30} color={C.ink} lineWidth={1.2} />
      </mesh>
      {legs.map(([x, z]) => (
        <mesh key={`${x}${z}`} position={[x, -0.5, z]} material={toon(C.bench)}>
          <boxGeometry args={[0.07, 0.86, 0.07]} />
          <Edges threshold={30} color={C.ink} lineWidth={1.2} />
        </mesh>
      ))}
      <mesh position={[0, -0.78, 0]} material={toon(C.bench)}>
        <boxGeometry args={[1.5, 0.04, 0.5]} />
        <Edges threshold={30} color={C.ink} lineWidth={1.2} />
      </mesh>
      {/* panel perforado del fondo */}
      <mesh position={[0, 0.33, -0.44]} material={peg} receiveShadow>
        <boxGeometry args={[1.8, 0.66, 0.02]} />
        <Edges threshold={30} color={C.ink} lineWidth={1.4} />
      </mesh>
      <mesh position={[0, 0.675, -0.43]} material={toon(C.bench)}>
        <boxGeometry args={[1.84, 0.04, 0.05]} />
        <Edges threshold={30} color={C.ink} lineWidth={1.2} />
      </mesh>
      {/* sombra suave de contacto: plano que recibe sombras */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.0006, -0.02]} receiveShadow>
        <planeGeometry args={[1.78, 0.84]} />
        <shadowMaterial opacity={0.18} color="#5A3A1E" />
      </mesh>
    </group>
  )
}
