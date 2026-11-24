// Tipos comunes del modelo paramétrico de las lámparas (piezas, agujeros, montaje, kit eléctrico).
// Cada lámpara tiene su `*.model.ts` con buildPieces(T, portalámparas) y su secuencia de montaje.

export type Holder = 'E27' | 'E14' | 'ninguno'
/** caja en mm, coordenadas del CAD: x ancho, y fondo (0 = delante), z alto */
export type Box = [number, number, number, number, number, number]

/**
 * Cara que se enseña al seleccionar la pieza (la misma que dibujan las láminas):
 * front = desde delante · back = desde detrás · side = desde la derecha · left = desde la izquierda · top = desde arriba
 */
export type View = 'front' | 'back' | 'side' | 'left' | 'top'

export interface Hole {
  id: string
  /** posición en la cara presentada: u horizontal, v vertical, desde la esquina inferior izquierda */
  u: number
  v: number
  /** Ø en mm; null = depende de una medida que falta */
  d: number | null
  kind: 'tornillo' | 'portalamparas' | 'ranura'
  /** solo ranura */
  w?: number
  h?: number
  provisional?: boolean
  /** cara del avellanado: la que se ve en la ficha o la de detrás */
  face?: 'vista' | 'oculta'
  /** quién o cómo se hace (p. ej. el agujero grande lo hace el profesor) */
  note?: string
}

export interface PieceSpec {
  id: string
  ref: string
  name: string
  kind: 'contrachapado' | 'pino'
  /** objeto del catálogo del que sale (por defecto: contrachapado o liston) */
  stock?: string
  /** número de piezas iguales con este número de plano */
  qty: number
  box: Box
  /** cómo se presenta al seleccionarla: cara grande hacia el alumno */
  view: View
  /** medidas de la cara presentada y grosor (mm) */
  w: number
  h: number
  t: number
  /** medidas de corte tal como van en el despiece: largo × ancho × grueso */
  cut: [number, number, number]
  holes: Hole[]
  /** paso de montaje */
  step: number
  explode: [number, number, number]
  /** comprobación después de cortar */
  cutTip?: string
  /** notas de la lámina de la pieza */
  notes?: string[]
}

export interface AssemblyStep {
  n: number
  title: string
  /** piezas que se montan en este paso (puede no haber: preparar, acabado, parte eléctrica) */
  pieces: string[]
  /** texto de los planos */
  text: string
  /** cómo se une (tabla de uniones de los planos) */
  union: string
  /** usa tornillos en los planos */
  screws: boolean
  /** false = sin cola */
  glue?: boolean
  /** solo con tornillos (no se puede cambiar por clavos): motivo */
  screwsOnly?: string
  /** otras herramientas del catálogo que pide el paso (p. ej. escuadra) */
  tools?: string[]
}

/** Dónde va el kit eléctrico en la lámpara (mm, coordenadas del CAD) */
export interface ElectricPlacement {
  /** centro del portalámparas en planta */
  socket: [number, number]
  /** cara superior de la pieza donde se aprieta el portalámparas */
  plateTop: number
  /** grosor de esa pieza */
  plateT: number
  /** recorrido del cable dentro de la lámpara, desde el portalámparas hasta justo fuera de la trasera */
  cable: [number, number, number][]
  /** abrazadera que sujeta el cable por dentro (caja) */
  clamp?: Box
}
