import { Edges, Outlines, RoundedBox } from '@react-three/drei'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { ElectricPlacement, Holder, PieceSpec } from '../content/model'
import type { LampManifest } from '../content/types'
import { useApp } from '../state/store'
import { Dim, Tag } from './Annotations'
import { fx } from './fx'
import { C, toon, toonRamp } from './materials'
import { PieceDetail } from './PieceDetail'

const mm = (v: number) => v / 1000
const fmt = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(1).replace('.', ','))
const tmpColor = new THREE.Color()
const hoverTint = new THREE.Color('#FFF3D6')

/** centro de una pieza en coordenadas de la lámpara (m, Y arriba, Z hacia delante) */
export function pieceCenter(p: PieceSpec): THREE.Vector3 {
  const [x0, x1, y0, y1, z0, z1] = p.box
  return new THREE.Vector3(mm(x0 + x1) / 2, mm(z0 + z1) / 2, -mm(y0 + y1) / 2)
}

export function Lamp({ lamp, T, holder }: { lamp: LampManifest; T: number; holder: Holder | undefined }) {
  const pieces = useMemo(() => lamp.build(T, holder), [lamp, T, holder])
  const labelled = useMemo(() => {
    const seen = new Set<string>()
    return pieces.filter((p) => (seen.has(p.ref) ? false : (seen.add(p.ref), true))).map((p) => p.id)
  }, [pieces])
  // medidas generales: caja que envuelve todas las piezas (cambian con el grosor en algunas lámparas)
  const [W, D, H] = useMemo(() => [0, 1, 2].map((k) => Math.max(...pieces.map((p) => p.box[2 * k + 1]))).map((v) => Math.round(v * 10) / 10), [pieces])
  const place = useMemo(() => lamp.place(T), [lamp, T])
  const offset = useMemo(() => new THREE.Vector3(-mm(W) / 2, 0, mm(D) / 2), [W, D])

  return (
    <group>
      <group position={offset}>
        {pieces.map((p) => (
          <Part key={p.id} piece={p} labelled={labelled.includes(p.id)} />
        ))}
        <Electrics lamp={lamp} place={place} D={D} />
        {/* cotas generales (valores validados, no dependen del grosor) */}
        <Dim a={[0, mm(H) + 0.03, 0.02]} b={[mm(W), mm(H) + 0.03, 0.02]} text={`${fmt(W)} mm`} amount={() => fx.dims} />
        <Dim a={[mm(W) + 0.03, 0, 0.02]} b={[mm(W) + 0.03, mm(H), 0.02]} text={`${fmt(H)} mm`} amount={() => fx.dims} />
        <Dim a={[-0.03, 0, 0]} b={[-0.03, 0, -mm(D)]} text={`${fmt(D)} mm`} amount={() => fx.dims} />
        <PieceDetail pieces={pieces} offset={offset} T={T} cskD={lamp.hw.cskD} />
      </group>
    </group>
  )
}

function Part({ piece, labelled }: { piece: PieceSpec; labelled: boolean }) {
  const ref = useRef<THREE.Group>(null)
  const [x0, x1, y0, y1, z0, z1] = piece.box
  const geometry = useMemo(() => new THREE.BoxGeometry(mm(x1 - x0), mm(z1 - z0), mm(y1 - y0)), [x0, x1, y0, y1, z0, z1])
  const base = useMemo(() => pieceCenter(piece), [piece])
  const baseColor = useMemo(() => new THREE.Color(piece.kind === 'pino' ? C.pine : C.ply), [piece.kind])
  // material propio: cada pieza se resalta y atenúa por separado
  const mat = useMemo(() => new THREE.MeshToonMaterial({ color: baseColor, gradientMap: toonRamp, transparent: true }), [baseColor])
  const select = useApp((s) => s.select)
  const hover = useApp((s) => s.hover)
  const selected = useApp((s) => s.selected === piece.id)
  const isHover = useApp((s) => s.hovered === piece.id)

  useFrame((_, dt) => {
    const g = ref.current
    if (!g) return
    const e = fx.explode
    g.position.set(base.x + piece.explode[0] * e, base.y + piece.explode[1] * e, base.z + piece.explode[2] * e)
    // seleccionada: queda un "hueco fantasma" mientras la ficha 3D está fuera; las demás se atenúan
    const sel = useApp.getState().selected
    const target = selected ? 0.14 : sel && fx.dim > 0 ? 1 - fx.dim * 0.65 : 1
    mat.opacity = THREE.MathUtils.damp(mat.opacity, target, 10, dt)
    mat.depthWrite = mat.opacity > 0.95
    tmpColor.copy(baseColor)
    if (isHover && !selected) tmpColor.lerp(hoverTint, 0.5)
    mat.color.lerp(tmpColor, Math.min(1, dt * 12))
  })

  return (
    <group ref={ref} position={base}>
      <mesh
        geometry={geometry}
        material={mat}
        castShadow
        receiveShadow
        onClick={(e) => {
          e.stopPropagation()
          select(selected ? null : piece.id)
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          hover(piece.id)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          hover(null)
          document.body.style.cursor = ''
        }}
      >
        <Edges threshold={20} color={selected ? C.accent : C.ink} lineWidth={selected ? 1.6 : 1.3} />
      </mesh>
      <Tag
        lamp
        position={[0, mm(z1 - z0) / 2 + 0.018, 0]}
        n={piece.ref}
        text={labelled ? piece.name.replace(/ (esq\.|dr\.|esquerre|dret|davanter.*|posterior.*)$/i, '') : piece.name}
        show={() => (labelled && useApp.getState().labels) || (useApp.getState().hovered === piece.id && !useApp.getState().selected)}
      />
    </group>
  )
}

/* ------------- Kit eléctrico 230 V (geometría PROVISIONAL, cotas de la iteración 2) ------------- */

function useComponentInteraction(id: string) {
  const select = useApp((s) => s.select)
  const hover = useApp((s) => s.hover)
  const selected = useApp((s) => s.selected === id)
  const hovered = useApp((s) => s.hovered === id)
  const handlers = {
    onClick: (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation()
      select(selected ? null : id)
    },
    onPointerOver: (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation()
      hover(id)
      document.body.style.cursor = 'pointer'
    },
    onPointerOut: () => {
      hover(null)
      document.body.style.cursor = ''
    },
  }
  return { selected, hovered, handlers, outline: selected ? C.accent : C.ink, thick: selected ? 0.0022 : hovered ? 0.0016 : 0.0011 }
}

function glowTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const g = c.getContext('2d')!
  const r = g.createRadialGradient(64, 64, 0, 64, 64, 64)
  r.addColorStop(0, 'rgba(255,214,120,0.95)')
  r.addColorStop(0.35, 'rgba(255,190,80,0.45)')
  r.addColorStop(1, 'rgba(255,170,60,0)')
  g.fillStyle = r
  g.fillRect(0, 0, 128, 128)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

const show = (id: string) => () => useApp.getState().labels || useApp.getState().selected === id || useApp.getState().hovered === id

function Electrics({ lamp, place, D }: { lamp: LampManifest; place: ElectricPlacement & { lift?: number }; D: number }) {
  const el = lamp.electric
  const HB = place.plateTop
  const T = place.plateT
  const cx = mm(place.socket[0])
  const cz = -mm(place.socket[1])
  // alturas como en generar_propuesta.py: zc()
  const sock0 = HB - el.socketBelow
  const mouth = sock0 + el.socketHeight
  const bulbTop = mouth - el.bulbEngage + el.bulbLength
  const bulbR = mm(el.bulbDiameter) / 2
  const bulbCy = mm(bulbTop) - bulbR
  const backZ = -mm(D)
  const exit = place.cable[place.cable.length - 1]
  const slotX = mm(exit[0])
  const cableR = mm(el.cableDiameter) / 2

  const glass = useMemo(() => new THREE.MeshBasicMaterial({ color: '#EEF3EE', transparent: true, opacity: 0.3, depthWrite: false }), [])
  const filament = useMemo(() => new THREE.MeshBasicMaterial({ color: '#8A6A3A' }), [])
  const halo = useMemo(() => new THREE.SpriteMaterial({ map: glowTexture(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 }), [])
  const light = useRef<THREE.PointLight>(null)
  const rocker = useRef<THREE.Group>(null)
  const off = useMemo(() => new THREE.Color('#EEF3EE'), [])
  const on = useMemo(() => new THREE.Color(C.glow), [])
  const filOff = useMemo(() => new THREE.Color('#8A6A3A'), [])
  const filOn = useMemo(() => new THREE.Color('#FFF6D0'), [])

  const bulb = useComponentInteraction('bombilla')
  const sock = useComponentInteraction('portalamparas')
  const sw = useComponentInteraction('interruptor')
  const plug = useComponentInteraction('clavija')
  const wire = useComponentInteraction('cable')
  const setSwitch = useApp((s) => s.setSwitch)

  // recorrido del cable en coordenadas locales de la lámpara: portalámparas -> ranura -> banco
  const inner = useMemo(() => {
    const pts = place.cable.map(([x, y, z]) => new THREE.Vector3(mm(x), mm(z), -mm(y)))
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 64, cableR, 8, false)
  }, [place.cable, cableR])
  const startZ = -mm(exit[1])

  // posición del interruptor de paso y de la clavija sobre el banco (ilustrativa)
  const swPos = new THREE.Vector3(slotX + 0.17, 0, backZ - 0.12)
  const plugPos = new THREE.Vector3(slotX + 0.43, 0.2, -0.426 - mm(D) / 2)
  const outerA = useMemo(() => {
    const pts = [
      new THREE.Vector3(slotX, mm(exit[2]), startZ),
      new THREE.Vector3(slotX + 0.01, cableR, backZ - 0.07),
      new THREE.Vector3(swPos.x - 0.07, cableR, swPos.z + 0.01),
      new THREE.Vector3(swPos.x - mm(el.switchSize[0]) / 2, mm(el.switchSize[2]) / 2, swPos.z),
    ]
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 48, cableR, 8, false)
  }, [slotX, exit, startZ, backZ, cableR, swPos.x, swPos.z, el.switchSize])
  const outerB = useMemo(() => {
    const pts = [
      new THREE.Vector3(swPos.x + mm(el.switchSize[0]) / 2, mm(el.switchSize[2]) / 2, swPos.z),
      new THREE.Vector3(swPos.x + 0.07, cableR, swPos.z - 0.01),
      new THREE.Vector3(plugPos.x - 0.05, cableR, plugPos.z + 0.07),
      new THREE.Vector3(plugPos.x, cableR + 0.004, plugPos.z + 0.03),
      new THREE.Vector3(plugPos.x, 0.06, plugPos.z + 0.016),
      new THREE.Vector3(plugPos.x, plugPos.y - mm(el.plugSize[0]) / 2 - 0.002, plugPos.z + 0.014),
    ]
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 48, cableR, 8, false)
  }, [swPos.x, swPos.z, plugPos.x, plugPos.y, plugPos.z, cableR, el.switchSize, el.plugSize])

  useFrame(() => {
    const g = fx.glow
    glass.color.copy(off).lerp(on, g)
    glass.opacity = 0.3 + g * 0.55
    filament.color.copy(filOff).lerp(filOn, g)
    halo.opacity = g * 0.6 * fx.lampScale
    if (light.current) light.current.intensity = g * 0.55
    if (rocker.current) rocker.current.rotation.z = THREE.MathUtils.lerp(rocker.current.rotation.z, useApp.getState().switchOn ? -0.22 : 0.22, 0.3)
  })

  const group = useRef<THREE.Group>(null)
  const bulbGroup = useRef<THREE.Group>(null)
  useFrame(() => {
    if (bulbGroup.current) bulbGroup.current.position.y = (place.lift ?? 0.12) * fx.explode
  })
  const cableMat = toon(wire.selected ? C.accent : '#2E2B28')
  const toggle = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    setSwitch(!useApp.getState().switchOn)
    useApp.getState().select('interruptor')
  }

  return (
    <group ref={group}>
      {/* portalámparas con doble anillo + bombilla */}
      <group ref={bulbGroup}>
        <group {...sock.handlers}>
          <mesh position={[cx, mm(sock0 + el.socketHeight / 2), cz]} material={toon(C.white)} castShadow>
            <cylinderGeometry args={[mm(el.socketDiameter) / 2, mm(el.socketDiameter) / 2, mm(el.socketHeight), 28]} />
            <Outlines thickness={sock.thick} color={sock.outline} />
          </mesh>
          <mesh position={[cx, mm(HB + el.ringThickness / 2), cz]} material={toon(C.white)}>
            <cylinderGeometry args={[mm(el.ringDiameter) / 2, mm(el.ringDiameter) / 2, mm(el.ringThickness), 32]} />
            <Outlines thickness={sock.thick} color={sock.outline} />
          </mesh>
          <mesh position={[cx, mm(HB - T - el.ringThickness / 2), cz]} material={toon(C.white)}>
            <cylinderGeometry args={[mm(el.ringDiameter) / 2, mm(el.ringDiameter) / 2, mm(el.ringThickness), 32]} />
          </mesh>
        </group>
        <group {...bulb.handlers}>
          <mesh position={[cx, mm(mouth) + 0.012, cz]} material={toon(C.metal)}>
            <cylinderGeometry args={[0.013, 0.013, 0.024, 20]} />
          </mesh>
          <mesh position={[cx, bulbCy, cz]} material={glass}>
            <sphereGeometry args={[bulbR, 40, 28]} />
          </mesh>
          {[-0.009, -0.003, 0.003, 0.009].map((x) => (
            <mesh key={x} position={[cx + x, bulbCy - 0.004, cz]} material={filament}>
              <boxGeometry args={[0.0012, 0.05, 0.0012]} />
            </mesh>
          ))}
          <sprite position={[cx, bulbCy, cz]} scale={[0.36, 0.36, 1]} material={halo} raycast={() => null} />
          <pointLight ref={light} position={[cx, bulbCy, cz]} color="#FFB54A" intensity={0} distance={0.9} decay={1.6} />
        </group>
      </group>

      {/* cable: interior (se ve al separar las piezas) y exterior */}
      <group {...wire.handlers}>
        <mesh geometry={inner} material={cableMat} />
        <mesh geometry={outerA} material={cableMat} castShadow />
        <mesh geometry={outerB} material={cableMat} castShadow />
        {place.clamp && (
          <mesh position={[mm(place.clamp[0] + place.clamp[1]) / 2, mm(place.clamp[4] + place.clamp[5]) / 2, -mm(place.clamp[2] + place.clamp[3]) / 2]} material={toon(C.white)}>
            <boxGeometry args={[mm(place.clamp[1] - place.clamp[0]), mm(place.clamp[5] - place.clamp[4]), mm(place.clamp[3] - place.clamp[2])]} />
            <Edges color={C.ink} threshold={20} lineWidth={1} />
          </mesh>
        )}
      </group>

      {/* interruptor de paso en el cable: clic para abrir y cerrar */}
      <group position={swPos} rotation={[0, 0, 0]} onClick={toggle} onPointerOver={sw.handlers.onPointerOver} onPointerOut={sw.handlers.onPointerOut}>
        <RoundedBox args={[mm(el.switchSize[0]), mm(el.switchSize[2]), mm(el.switchSize[1])]} radius={0.008} smoothness={3} position={[0, mm(el.switchSize[2]) / 2, 0]} material={toon('#2E2B28')} castShadow>
          <Outlines thickness={sw.thick} color={sw.selected || sw.hovered ? C.accent : C.ink} />
        </RoundedBox>
        {/* zona de clic más grande que el interruptor, cómoda con touchpad */}
        <mesh position={[0, 0.02, 0]} visible={false}>
          <boxGeometry args={[0.1, 0.05, 0.06]} />
        </mesh>
        <group ref={rocker} position={[0, mm(el.switchSize[2]), 0]}>
          <mesh position={[0, 0.002, 0]} material={toon(C.red)}>
            <boxGeometry args={[0.03, 0.006, 0.016]} />
            <Edges color={C.ink} threshold={20} lineWidth={1.2} />
          </mesh>
        </group>
        <Tag lamp position={[0, 0.05, 0]} text="Interruptor de pas" sub="clica per encendre o apagar" show={() => fx.lampScale > 0.5} tone="accent" />
      </group>

      {/* clavija enchufada a la base del panel */}
      <group {...plug.handlers}>
        <mesh position={[plugPos.x, plugPos.y + 0.0, plugPos.z - 0.0]} material={toon(C.white)}>
          <boxGeometry args={[0.07, 0.07, 0.008]} />
          <Edges color={C.ink} threshold={20} lineWidth={1.2} />
        </mesh>
        <mesh position={[plugPos.x, plugPos.y - 0.002, plugPos.z + 0.013]} material={toon('#2E2B28')} castShadow>
          <boxGeometry args={[mm(el.plugSize[1]), mm(el.plugSize[0]), mm(el.plugSize[2])]} />
          <Edges color={plug.outline} threshold={20} lineWidth={plug.selected ? 2.4 : 1.2} />
        </mesh>
        <Tag lamp position={[plugPos.x, plugPos.y + 0.06, plugPos.z + 0.02]} text="Clavilla · 230 V" show={show('clavija')} />
      </group>

      <Tag lamp position={[cx, bulbCy + bulbR + 0.02, cz]} text="Bombeta LED G95" show={show('bombilla')} tone="glow" />
      <Tag lamp position={[cx + 0.045, mm(HB) + 0.02, cz + 0.03]} text="Portalàmpades E27" show={show('portalamparas')} />
      <Tag lamp position={[slotX, 0.04, backZ - 0.03]} text="Cable tèxtil" show={show('cable')} />
    </group>
  )
}

