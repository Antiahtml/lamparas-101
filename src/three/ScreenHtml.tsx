import { useFrame } from '@react-three/fiber'
import { useId, useLayoutEffect, useRef, type ReactNode } from 'react'
import * as THREE from 'three'
import { create } from 'zustand'

// Etiquetas HTML ancladas a puntos 3D.
// Sustituye a <Html> de drei: aquel crea una raíz de React por etiqueta y, al desmontar muchas a la vez
// (cambiar de lámpara), React 19 falla («removeChild… not a child of this node»). Aquí todas las etiquetas
// se pintan en una sola capa HTML encima del lienzo y un único useFrame las coloca.

type Entry = { id: string; node: ReactNode; center: boolean }
const useAnchors = create<{ list: Map<string, Entry> }>(() => ({ list: new Map() }))
const objects = new Map<string, THREE.Object3D>()
const elements = new Map<string, HTMLDivElement>()
const last = new Map<string, string>()

const setEntry = (id: string, e: Entry | null) =>
  useAnchors.setState((s) => {
    const list = new Map(s.list)
    if (e) list.set(id, e)
    else list.delete(id)
    return { list }
  })

/** Ancla en la escena 3D: su contenido se dibuja en la capa HTML (ScreenOverlay). */
export function ScreenHtml({ position, center = false, children }: { position: [number, number, number]; center?: boolean; children: ReactNode }) {
  const id = useId()
  const group = useRef<THREE.Group>(null)
  useLayoutEffect(() => {
    objects.set(id, group.current!)
    return () => {
      objects.delete(id)
      last.delete(id)
      setEntry(id, null)
    }
  }, [id])
  useLayoutEffect(() => {
    setEntry(id, { id, node: children, center })
  }, [id, children, center])
  return <group ref={group} position={position} />
}

/** Dentro del Canvas: coloca cada etiqueta en pantalla en cada fotograma. */
export function ScreenSync() {
  const v = useRef(new THREE.Vector3()).current
  useFrame(({ camera, size }) => {
    for (const [id, obj] of objects) {
      const el = elements.get(id)
      if (!el) continue
      obj.getWorldPosition(v)
      const dist = camera.position.distanceTo(v)
      v.project(camera)
      let css: string
      if (v.z > 1 || v.z < -1) css = 'none'
      else {
        const x = (v.x * 0.5 + 0.5) * size.width
        const y = (-v.y * 0.5 + 0.5) * size.height
        css = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)|${Math.max(0, Math.round(30 - dist * 10))}`
      }
      if (last.get(id) === css) continue
      last.set(id, css)
      if (css === 'none') el.style.display = 'none'
      else {
        const [t, z] = css.split('|')
        el.style.display = ''
        el.style.transform = t
        el.style.zIndex = z
      }
    }
  })
  return null
}

/** Fuera del Canvas, encima: la capa HTML con todas las etiquetas. */
export function ScreenOverlay() {
  const list = useAnchors((s) => s.list)
  return (
    <div className="pointer-events-none absolute inset-0 z-[5] overflow-hidden">
      {[...list.values()].map((e) => (
        <div
          key={e.id}
          ref={(el) => {
            if (el) elements.set(e.id, el)
            else (elements.delete(e.id), last.delete(e.id))
          }}
          style={{ position: 'absolute', top: 0, left: 0, display: 'none' }}
        >
          <div style={e.center ? { transform: 'translate3d(-50%,-50%,0)' } : undefined}>{e.node}</div>
        </div>
      ))}
    </div>
  )
}
