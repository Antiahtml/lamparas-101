import gsap from 'gsap'
import { useEffect } from 'react'
import { useApp } from '../state/store'
import { flyTo, fx, reducedMotion } from '../three/fx'
import { views } from '../three/views'

/**
 * Traduce el estado de la interfaz en la escena. Solo hay transiciones cortas (< 1 s)
 * provocadas por una acción del alumno: no hay secuencias que avancen solas.
 */
export function SceneSync() {
  const switchOn = useApp((s) => s.switchOn)
  const exploded = useApp((s) => s.exploded)
  const dims = useApp((s) => s.dims)
  const selected = useApp((s) => s.selected)
  const placing = useApp((s) => s.placing)
  const view = useApp((s) => s.view)
  const viewTick = useApp((s) => s.viewTick)
  const d = (t: number) => (reducedMotion() ? 0 : t)

  useEffect(() => {
    gsap.to(fx, { glow: switchOn ? 1 : 0, duration: d(0.3), ease: 'power2.out', overwrite: 'auto' })
  }, [switchOn])

  useEffect(() => {
    gsap.to(fx, { explode: exploded ? 1 : 0, duration: d(0.7), ease: 'power2.inOut', overwrite: 'auto' })
  }, [exploded])

  useEffect(() => {
    gsap.to(fx, { dims: dims ? 1 : 0, duration: d(0.5), ease: 'power1.out', overwrite: 'auto' })
  }, [dims])

  // al seleccionar algo de la lámpara, el resto se atenúa (menos mientras la pieza vuelve a su sitio)
  useEffect(() => {
    const onLamp = !!selected && !selected.startsWith('item:')
    gsap.to(fx, { dim: onLamp && !placing ? 1 : 0, duration: d(0.35), overwrite: 'auto' })
  }, [selected, placing])

  useEffect(() => {
    if (viewTick === 0) return
    flyTo(views[view] ?? views.home, !reducedMotion())
  }, [view, viewTick])

  return null
}
