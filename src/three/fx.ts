import * as THREE from 'three'
import type CameraControlsImpl from 'camera-controls'

/**
 * Valores animables compartidos. GSAP los interpola y useFrame los lee.
 * No pasan por React: así una demo se puede pausar, reiniciar o arrastrar sin re-render por fotograma.
 */
export const fx = {
  /** 0 = montada, 1 = explosionada */
  explode: 0,
  /** caída inicial de las piezas (intro) 0..1 */
  drop: 0,
  /** escala de toda la lámpara (0 = oculta) */
  lampScale: 1,
  /** giro de la lámpara para ver la trasera 0..1 (media vuelta) */
  lampTurn: 0,
  /** etiquetas de componentes eléctricos 0..1 */
  compTags: 0,
  /** brillo de la bombilla 0..1 */
  glow: 0,
  /** atenuación de las piezas que no pertenecen al grupo resaltado (0 = nada atenuado) */
  dim: 0,
  /** grupo resaltado: 'contrachapado' | 'pino' | 'electrico' | '' */
  focus: '',
  /** apariciones de etiquetas de piezas (0..n) */
  labelReveal: 0,
  /** cotas generales 0..1 */
  dims: 0,
  /** materiales y herramientas sobre el banco: escala de aparición por id */
  props: {} as Record<string, number>,
  /** pulso del flujo de corriente en el esquema 0..1 */
  current: 0,
  /** cámara dirigida por una timeline */
  camDriven: false,
  cam: { px: 0.75, py: 0.5, pz: 0.98, tx: 0, ty: 0.16, tz: 0 },
}

export const HOME_VIEW = { px: 0.75, py: 0.5, pz: 0.98, tx: 0, ty: 0.16, tz: 0 }
export type View = typeof HOME_VIEW

/** Acceso a CameraControls fuera de React (barra de cámara, timelines). */
export const camApi: { controls: CameraControlsImpl | null } = { controls: null }

export function flyTo(v: View, smooth = true) {
  camApi.controls?.setLookAt(v.px, v.py, v.pz, v.tx, v.ty, v.tz, smooth)
}

export function currentView(): View {
  const c = camApi.controls
  if (!c) return { ...HOME_VIEW }
  const p = c.getPosition(new THREE.Vector3())
  const t = c.getTarget(new THREE.Vector3())
  return { px: p.x, py: p.y, pz: p.z, tx: t.x, ty: t.y, tz: t.z }
}

export const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

export function resetFx() {
  fx.explode = 0
  fx.lampScale = 1
  fx.dim = 0
  fx.focus = ''
  fx.labelReveal = 0
  fx.dims = 0
  fx.current = 0
  fx.camDriven = false
  for (const k of Object.keys(fx.props)) delete fx.props[k]
}

// depuración en desarrollo: acceso a la cámara desde la consola
if (import.meta.env.DEV && typeof window !== 'undefined') (window as unknown as { __camApi: typeof camApi }).__camApi = camApi
