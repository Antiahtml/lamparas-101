import type { ThreeEvent } from '@react-three/fiber'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { CatalogItem, LampManifest } from '../../content/types'
import { useApp } from '../../state/store'
import { Tag } from '../Annotations'
import { C } from '../materials'
import { propComponents } from './Props'

/** Posición de cada objeto sobre el banco [x, z, giro]. Materiales a la izquierda, herramientas a la derecha. */
export const benchLayout: Record<string, [number, number, number]> = {
  contrachapado: [-0.56, -0.22, 0.08],
  liston: [-0.5, 0.0, -0.12],
  clavos: [-0.74, 0.17, 0.3],
  tornillos: [-0.6, 0.3, -0.2],
  cola: [-0.36, 0.17, 0],
  lija: [-0.46, 0.16, 0.2],
  serrucho: [0.68, -0.14, -0.1],
  taladro: [0.38, 0.12, -0.5],
  martillo: [0.6, 0.3, 0.3],
  punzon: [0.3, 0.38, 0.5],
  destornillador: [0.5, -0.04, -0.3],
  sargentos: [0.82, 0.1, 0.2],
  escuadra: [0.6, 0.1, 0.15],
  calibre: [0.8, 0.32, -0.3],
  lapiz: [0.4, 0.3, 0.1],
  pinceles: [0.78, -0.32, 0.4],
  // làmpada 02
  contrachapado5: [-0.8, -0.04, -0.15],
  barniz: [-0.33, 0.33, 0],
  fieltros: [-0.46, 0.34, 0.2],
  marqueteria: [0.86, -0.12, 0.5],
}

/** Materiales y herramientas del banco. Se pueden pulsar: el panel explica para qué sirven. */
export function BenchProps({ lamp }: { lamp: LampManifest }) {
  return (
    <group>
      {lamp.catalog
        .filter((c) => c.zone !== 'kit' && benchLayout[c.id])
        .map((item) => (
          <BenchItem key={item.id} item={item} />
        ))}
    </group>
  )
}

function BenchItem({ item }: { item: CatalogItem }) {
  const id = `item:${item.id}`
  const [x, z, r] = benchLayout[item.id]
  const Comp = propComponents[item.prop]
  const select = useApp((s) => s.select)
  const hover = useApp((s) => s.hover)
  const ring = useRef<THREE.Mesh>(null)
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: C.accent, transparent: true, opacity: 0 }), [])
  useFrame((_, dt) => {
    const st = useApp.getState()
    const on = st.selected === id ? 0.55 : st.hovered === id ? 0.3 : 0
    mat.opacity = THREE.MathUtils.damp(mat.opacity, on, 12, dt)
  })
  const handlers = {
    onClick: (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation()
      select(useApp.getState().selected === id ? null : id)
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
  return (
    <group position={[x, 0, z]}>
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.0015, 0]} material={mat}>
        <circleGeometry args={[0.1, 32]} />
      </mesh>
      <group rotation={[0, r, 0]} {...handlers}>
        {Comp && <Comp />}
        {/* zona de clic cómoda para touchpad */}
        <mesh position={[0, 0.03, 0]} visible={false}>
          <boxGeometry args={[0.14, 0.07, 0.12]} />
        </mesh>
      </group>
      <Tag
        position={[0, 0.09, 0.03]}
        text={item.name}
        tone={item.category === 'material' ? 'ink' : 'accent'}
        show={() => {
          const s = useApp.getState()
          return s.labels || s.hovered === id || s.selected === id
        }}
      />
    </group>
  )
}
