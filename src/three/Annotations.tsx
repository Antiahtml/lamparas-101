import { Line } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Line2 } from 'three-stdlib'
import { fx } from './fx'
import { C } from './materials'
import { ScreenHtml } from './ScreenHtml'

type Vec3 = [number, number, number]

/** Etiqueta HTML anclada a un punto 3D. `show` se evalúa en cada fotograma (sin re-render). */
export function Tag({
  position,
  n,
  text,
  sub,
  show,
  tone = 'ink',
  lamp = false,
}: {
  position: Vec3
  n?: string
  text: string
  sub?: string
  show: () => boolean
  tone?: 'ink' | 'accent' | 'glow'
  /** pertenece a la lámpara: se oculta si la lámpara está retirada */
  lamp?: boolean
}) {
  const el = useRef<HTMLDivElement>(null)
  const v = useRef(0)
  useFrame((_, dt) => {
    const target = show() && (!lamp || fx.lampScale > 0.5) ? 1 : 0
    v.current += (target - v.current) * Math.min(1, dt * 10)
    if (el.current) {
      el.current.style.opacity = v.current.toFixed(3)
      el.current.style.transform = `translateY(${(1 - v.current) * 6}px) scale(${0.9 + v.current * 0.1})`
      el.current.style.visibility = v.current < 0.02 ? 'hidden' : 'visible'
    }
  })
  return (
    <ScreenHtml position={position} center>
      <div ref={el} className={`tag tag-${tone}`} style={{ opacity: 0, visibility: 'hidden' }}>
        {n && <span className="tag-n">{n}</span>}
        <span className="tag-t">{text}</span>
        {sub && <span className="tag-s">{sub}</span>}
      </div>
    </ScreenHtml>
  )
}

/** Cota: línea con remates y texto manuscrito. `amount` 0..1 la dibuja progresivamente. */
export function Dim({ a, b, text, amount }: { a: Vec3; b: Vec3; text: string; amount: () => number }) {
  const line = useRef<Line2>(null)
  const ticks = useRef<Line2>(null)
  const label = useRef<HTMLDivElement>(null)
  const dir: Vec3 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]]
  const mid: Vec3 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2]
  // remates perpendiculares (en vertical si la cota es horizontal, en horizontal si es vertical)
  const t = 0.012
  const perp: Vec3 = Math.abs(dir[1]) > 0.01 ? [t, 0, 0] : [0, t, 0]
  useFrame(() => {
    const k = amount()
    const g = line.current?.geometry as unknown as { setPositions?: (p: number[]) => void }
    if (line.current) {
      const e = [a[0] + dir[0] * k, a[1] + dir[1] * k, a[2] + dir[2] * k]
      g?.setPositions?.([...a, ...e])
      line.current.visible = k > 0.01
    }
    if (ticks.current) ticks.current.visible = k > 0.98
    if (label.current) {
      label.current.style.opacity = Math.max(0, (k - 0.7) / 0.3).toFixed(2)
    }
  })
  return (
    <group>
      <Line ref={line} points={[a, b]} color={C.cota} lineWidth={2} />
      <Line
        ref={ticks}
        segments
        points={[
          [a[0] - perp[0], a[1] - perp[1], a[2] - perp[2]],
          [a[0] + perp[0], a[1] + perp[1], a[2] + perp[2]],
          [b[0] - perp[0], b[1] - perp[1], b[2] - perp[2]],
          [b[0] + perp[0], b[1] + perp[1], b[2] + perp[2]],
        ]}
        color={C.cota}
        lineWidth={2}
      />
      <ScreenHtml position={mid} center>
        <div ref={label} className="dim" style={{ opacity: 0 }}>
          {text}
        </div>
      </ScreenHtml>
    </group>
  )
}
