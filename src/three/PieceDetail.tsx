import { Edges } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { PieceSpec } from '../content/model'
import { useApp } from '../state/store'
import { Dim } from './Annotations'
import { flyTo, fx, reducedMotion } from './fx'
import { C, toonRamp } from './materials'
import { ScreenHtml } from './ScreenHtml'
import { views } from './views'

const mm = (v: number) => v / 1000
/** dónde se presenta la pieza seleccionada (coordenadas del mundo): delante de la lámpara */
const STAGE = new THREE.Vector3(0, 0.12, 0.26)

/** giro que lleva la cara presentada (frente al alumno) a la orientación que tiene dentro de la lámpara */
function mountedRotation(view: PieceSpec['view']) {
  const q = new THREE.Quaternion()
  if (view === 'side') q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2)
  if (view === 'left') q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 2)
  if (view === 'back') q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI)
  if (view === 'top') q.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2)
  return q
}

const ease = (k: number) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2)

/** Ficha 3D: la pieza seleccionada sale de la lámpara, se pone de frente y muestra sus cotas y agujeros. */
export function PieceDetail({ pieces, offset, T, cskD }: { pieces: PieceSpec[]; offset: THREE.Vector3; T: number; cskD: number }) {
  const selected = useApp((s) => s.selected)
  const piece = pieces.find((p) => p.id === selected)
  if (!piece) return null
  return <Body key={`${piece.id}-${T}`} piece={piece} offset={offset} cskD={cskD} />
}

function Body({ piece, offset, cskD }: { piece: PieceSpec; offset: THREE.Vector3; cskD: number }) {
  const group = useRef<THREE.Group>(null)
  const k = useRef(reducedMotion() ? 1 : 0)
  const placing = useApp((s) => s.placing)
  const w = mm(piece.w)
  const h = mm(piece.h)
  const t = mm(piece.t)
  const geometry = useMemo(() => new THREE.BoxGeometry(w, h, t), [w, h, t])
  const mat = useMemo(() => new THREE.MeshToonMaterial({ color: piece.kind === 'pino' ? C.pine : C.ply, gradientMap: toonRamp }), [piece.kind])
  const q0 = useMemo(() => mountedRotation(piece.view), [piece.view])
  const qi = useMemo(() => new THREE.Quaternion(), [])
  const home = useMemo(() => {
    const [x0, x1, y0, y1, z0, z1] = piece.box
    return new THREE.Vector3(mm(x0 + x1) / 2, mm(z0 + z1) / 2, -mm(y0 + y1) / 2)
  }, [piece.box])
  // posición de presentación en coordenadas de la lámpara
  const stage = useMemo(() => new THREE.Vector3(STAGE.x, STAGE.y + h / 2, STAGE.z).sub(offset), [h, offset])
  const tmp = useMemo(() => new THREE.Vector3(), [])

  // cámara: encuadra la pieza presentada, o la lámpara entera cuando la pieza vuelve a su sitio
  useEffect(() => {
    if (placing) {
      flyTo(views.hero, !reducedMotion())
      return
    }
    const size = Math.max(w, h * 1.25)
    const d = size * 1.9 + 0.18
    const cy = STAGE.y + h / 2
    flyTo({ px: 0.08, py: cy + 0.06, pz: STAGE.z + d, tx: 0, ty: cy, tz: STAGE.z }, !reducedMotion())
  }, [placing, w, h])

  useEffect(() => () => flyTo(views.home, !reducedMotion()), [])

  useFrame((_, dt) => {
    const g = group.current
    if (!g) return
    const target = placing ? 0 : 1
    k.current = reducedMotion() ? target : THREE.MathUtils.damp(k.current, target, 5, dt)
    const e = ease(k.current)
    tmp.set(home.x + piece.explode[0] * fx.explode, home.y + piece.explode[1] * fx.explode, home.z + piece.explode[2] * fx.explode)
    g.position.lerpVectors(tmp, stage, e)
    g.quaternion.slerpQuaternions(q0, qi, e)
  })

  const shown = () => (useApp.getState().placing ? 0 : Math.max(0, (k.current - 0.8) / 0.2))
  const z = t / 2 + 0.0006

  return (
    <group ref={group}>
      <mesh geometry={geometry} material={mat} castShadow>
        <Edges threshold={20} color={C.accent} lineWidth={2.2} />
      </mesh>
      {/* cotas de la cara */}
      <Dim a={[-w / 2, -h / 2 - 0.022, z]} b={[w / 2, -h / 2 - 0.022, z]} text={`${fmt(piece.w)} mm`} amount={shown} />
      <Dim a={[w / 2 + 0.022, -h / 2, z]} b={[w / 2 + 0.022, h / 2, z]} text={`${fmt(piece.h)} mm`} amount={shown} />
      <Label position={[-w / 2, h / 2 + 0.02, z]} show={shown} className="dim">
        gruix {fmt(piece.t)} mm
      </Label>
      {piece.holes.map((ho) => (
        <HoleMark key={ho.id} hole={ho} w={w} h={h} z={z} show={shown} cskD={cskD} />
      ))}
    </group>
  )
}

const fmt = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(1).replace('.', ','))

function Label({ position, show, className, children }: { position: [number, number, number]; show: () => number; className: string; children: React.ReactNode }) {
  const el = useRef<HTMLDivElement>(null)
  useFrame(() => {
    if (el.current) el.current.style.opacity = show().toFixed(2)
  })
  return (
    <ScreenHtml position={position}>
      <div ref={el} className={className} style={{ opacity: 0, transform: 'translate(0, -100%)' }}>
        {children}
      </div>
    </ScreenHtml>
  )
}

function HoleMark({ hole, w, h, z, show, cskD }: { hole: PieceSpec['holes'][number]; w: number; h: number; z: number; show: () => number; cskD: number }) {
  const x = mm(hole.u) - w / 2
  const y = mm(hole.v) - h / 2
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: hole.provisional ? C.red : C.cota, transparent: true, opacity: 0 }), [hole.provisional])
  const fill = useMemo(() => new THREE.MeshBasicMaterial({ color: '#4A3420', transparent: true, opacity: 0 }), [])
  // avellanado por la cara de detrás: anillo más tenue (como la línea oculta de la lámina)
  const ringK = hole.face === 'oculta' ? 0.4 : 1
  useFrame(() => {
    mat.opacity = show() * ringK
    fill.opacity = show() * 0.85
  })
  if (hole.kind === 'ranura') {
    const sw = mm(hole.w ?? 0)
    const sh = mm(hole.h ?? 0)
    return (
      <group position={[x, -h / 2 + sh / 2, z]}>
        <mesh material={fill}>
          <planeGeometry args={[sw, sh]} />
        </mesh>
        <Label position={[sw / 2 + 0.006, sh / 2, 0]} show={show} className={`hole-tag ${hole.provisional ? 'is-prov' : ''}`}>
          {hole.id}
        </Label>
      </group>
    )
  }
  const r = mm(hole.d ?? 20) / 2
  const csk = hole.kind === 'tornillo' ? mm(cskD) / 2 : 0
  return (
    <group position={[x, y, z]}>
      <mesh material={fill}>
        <circleGeometry args={[r, 24]} />
      </mesh>
      {csk > 0 && (
        <mesh material={mat}>
          <ringGeometry args={[csk - 0.0007, csk, 24]} />
        </mesh>
      )}
      {hole.d === null && (
        <mesh material={mat}>
          <ringGeometry args={[r - 0.0012, r, 32]} />
        </mesh>
      )}
      <Label position={[Math.max(r, csk) + 0.003, 0.004, 0]} show={show} className={`hole-tag ${hole.provisional ? 'is-prov' : ''}`}>
        {hole.id}
      </Label>
    </group>
  )
}
