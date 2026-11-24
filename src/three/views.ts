import { HOME_VIEW, type View } from './fx'

/** Vistas de cámara con nombre. Las lecciones las piden por nombre desde los datos. */
export const views: Record<string, View> = {
  home: HOME_VIEW,
  front: { px: 0.04, py: 0.3, pz: 1.15, tx: 0, ty: 0.17, tz: 0 },
  back: { px: 0.4, py: 0.3, pz: -0.4, tx: 0.06, ty: 0.05, tz: -0.08 },
  base: { px: 0.42, py: 0.26, pz: 0.72, tx: 0, ty: 0.09, tz: 0 },
  hero: { px: 0.6, py: 0.5, pz: 0.95, tx: 0, ty: 0.18, tz: 0 },
  switch: { px: 0.55, py: 0.45, pz: 0.55, tx: 0.3, ty: 0.02, tz: -0.12 },
}
