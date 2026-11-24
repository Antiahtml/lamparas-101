// Tipos de datos del contenido. Una lámpara nueva = un objeto LampManifest más.

import type { AssemblyStep, ElectricPlacement, Holder, PieceSpec } from './model'

export interface ElectricComponent {
  id: 'clavija' | 'cable' | 'interruptor' | 'portalamparas' | 'bombilla'
  name: string
  role: string
  spec: string
  /** dónde va en la lámpara */
  where: string
  /** true = geometría simplificada, no es el modelo comercial */
  provisional: boolean
}

export interface CatalogItem {
  id: string
  name: string
  category: 'material' | 'herramienta'
  /** cantidad o uso, tomado de la lista de materiales / montaje */
  detail: string
  /** para qué sirve (una frase) */
  use: string
  /** componente 3D que lo representa (ver three/props) */
  prop: string
  /** de dónde sale el dato y si está verificado */
  source: string
  /** true = no se ha comprobado en el inventario real */
  unverified?: boolean
  /** zona del banco: 'kit' para el kit eléctrico */
  zone?: 'kit'
  /** grupo en el inventario del alumno */
  group: 'madera' | 'union' | 'acabado' | 'kit' | 'herramienta'
}

export interface LampDocument {
  label: string
  file: string
  kind: 'pdf' | 'dxf' | 'img'
  description: string
}

export interface LampManifest {
  id: string
  name: string
  status: string
  /** modelo CAD convertido (referencia; la geometría de la app sale de `build`) */
  model: string
  /** medidas generales validadas (mm) */
  dims: { width: number; height: number; depth: number; baseHeight: number; batten: number }
  /** grosor del tablero con el que se validaron los planos (mm) */
  validatedBoard: number
  /** piezas calculadas con el grosor real del tablero */
  build: (T: number, holder: Holder | undefined) => PieceSpec[]
  assembly: AssemblyStep[]
  /** dónde va el kit eléctrico con ese grosor de tablero */
  place: (T: number) => ElectricPlacement & { lift?: number }
  /** tornillería y corte de los planos (mm) */
  hw: { kerf: number; screwD: number; cskD: number; pilot: string }
  /** frase corta que describe la lámpara */
  tagline: string
  /** kit eléctrico (mm). Valores PROVISIONALES de la iteración 2: medir los componentes recibidos. */
  electric: {
    voltage: string
    socketDiameter: number
    socketHeight: number
    /** parte del portalámparas por debajo de la cara superior del estante */
    socketBelow: number
    ringDiameter: number
    ringThickness: number
    bulbDiameter: number
    bulbLength: number
    /** casquillo que entra en el portalámparas */
    bulbEngage: number
    cableDiameter: number
    slotWidth: number
    slotHeight: number
    switchSize: [number, number, number]
    plugSize: [number, number, number]
    source: string
  }
  components: ElectricComponent[]
  catalog: CatalogItem[]
  documents: LampDocument[]
  notes: string[]
}
