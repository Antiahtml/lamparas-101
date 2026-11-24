// Modelo paramétrico de lampara_01.
// Fórmulas copiadas de ../lampara_01/generador/generar_planos.py (build_items, build_pieces, ASSEMBLY).
// El grosor del tablero T lo introduce el alumno; el resto de parámetros son los validados en la v1.
// Lo que viene de la propuesta de la iteración 2 (kit 230 V) se marca como provisional.

export const V1 = {
  H: 350, // altura total
  W: 270, // anchura total
  D: 140, // profundidad
  HB: 110, // suelo -> cara superior del estante
  L: 15, // sección de los listones de pino
  S: 10, // retranqueo de los listones superiores
  SCREW_D: 3.5,
  CSK_D: 7,
  KERF: 3,
  T_VALIDATED: 10,
}
/** propuesta iteración 2, revisión B (generar_propuesta.py, C = dict) */
export const REV_B = { sockD: 40, holeClear: 1, slotW: 8, slotH: 15, slotFromRight: 60 }

import type { AssemblyStep, ElectricPlacement, Hole, Holder, PieceSpec } from '../model'
export type { AssemblyStep, Hole, Holder, PieceSpec }

export function buildPieces(T: number, holder: Holder | undefined): PieceSpec[] {
  const { H, W, D, HB, L, S, SCREW_D: sd } = V1
  const HP = HB - T
  const IW = W - 2 * T
  const zt = H - T - L / 2
  const sideHoles: Hole[] = [
    { id: 'A', u: T + L / 2, v: 25, d: sd, kind: 'tornillo' },
    { id: 'B', u: T + L / 2, v: 70, d: sd, kind: 'tornillo' },
    { id: 'C', u: D - T - L / 2, v: 25, d: sd, kind: 'tornillo' },
    { id: 'D', u: D - T - L / 2, v: 70, d: sd, kind: 'tornillo' },
    { id: 'E', u: 40, v: zt, d: sd, kind: 'tornillo' },
    { id: 'F', u: D - 40, v: zt, d: sd, kind: 'tornillo' },
  ]
  const topHoles: Hole[] = [
    { id: 'A', u: T + L / 2, v: 40, d: sd, kind: 'tornillo' },
    { id: 'B', u: T + L / 2, v: D - 40, d: sd, kind: 'tornillo' },
    { id: 'C', u: W - T - L / 2, v: 40, d: sd, kind: 'tornillo' },
    { id: 'D', u: W - T - L / 2, v: D - 40, d: sd, kind: 'tornillo' },
  ]
  const shelfHole: Hole = {
    id: 'A',
    u: IW / 2,
    v: D / 2,
    d: holder === 'E27' ? REV_B.sockD + REV_B.holeClear : null,
    kind: 'portalamparas',
    provisional: true,
  }
  const backHoles: Hole[] = [
    { id: 'A', u: L / 2, v: 35, d: sd, kind: 'tornillo' },
    { id: 'B', u: L / 2, v: 80, d: sd, kind: 'tornillo' },
    { id: 'C', u: IW - L / 2, v: 35, d: sd, kind: 'tornillo' },
    { id: 'D', u: IW - L / 2, v: 80, d: sd, kind: 'tornillo' },
    // ranura para el cable del kit, en el canto inferior (vista desde delante)
    { id: 'R', u: IW - REV_B.slotFromRight, v: REV_B.slotH / 2, d: null, kind: 'ranura', w: REV_B.slotW, h: REV_B.slotH, provisional: true },
  ]

  const LISTON6_TIP = `Comprova que fan exactament el mateix que l'alçada del frontal (${HP} mm): si són més llargs, el prestatge no hi recolzarà bé.`
  return [
    { id: 'lateral-izq', ref: '1', name: 'Lateral esquerre', kind: 'contrachapado', qty: 2, box: [0, T, 0, D, 0, H - T], view: 'side', w: D, h: H - T, t: T, cut: [H - T, D, T], holes: sideHoles, step: 2, explode: [-0.13, 0, 0] },
    { id: 'lateral-der', ref: '1', name: 'Lateral dret', kind: 'contrachapado', qty: 2, box: [W - T, W, 0, D, 0, H - T], view: 'side', w: D, h: H - T, t: T, cut: [H - T, D, T], holes: sideHoles, step: 3, explode: [0.13, 0, 0] },
    { id: 'tapa', ref: '2', name: 'Tapa superior', kind: 'contrachapado', qty: 1, box: [0, W, 0, D, H - T, H], view: 'top', w: W, h: D, t: T, cut: [W, D, T], holes: topHoles, step: 6, explode: [0, 0.16, 0] },
    { id: 'estante', ref: '3', name: 'Prestatge', kind: 'contrachapado', qty: 1, box: [T, W - T, 0, D, HP, HB], view: 'top', w: IW, h: D, t: T, cut: [IW, D, T], holes: [shelfHole], step: 4, explode: [0, 0.07, 0] },
    { id: 'frente', ref: '4', name: 'Frontal de la base', kind: 'contrachapado', qty: 1, box: [T, W - T, 0, T, 0, HP], view: 'front', w: IW, h: HP, t: T, cut: [IW, HP, T], holes: [], step: 1, explode: [0, 0, 0.12] },
    { id: 'trasera', ref: '5', name: 'Tapa del darrere', kind: 'contrachapado', qty: 1, box: [T, W - T, D - T, D, 0, HP], view: 'front', w: IW, h: HP, t: T, cut: [IW, HP, T], holes: backHoles, step: 3, explode: [0, 0, -0.13] },
    { id: 'liston-di', ref: '6', cutTip: LISTON6_TIP, name: 'Llistó de base davanter esq.', kind: 'pino', qty: 4, box: [T, T + L, T, T + L, 0, HP], view: 'front', w: L, h: HP, t: L, cut: [HP, L, L], holes: [], step: 1, explode: [-0.05, 0, 0.06] },
    { id: 'liston-dd', ref: '6', cutTip: LISTON6_TIP, name: 'Llistó de base davanter dr.', kind: 'pino', qty: 4, box: [W - T - L, W - T, T, T + L, 0, HP], view: 'front', w: L, h: HP, t: L, cut: [HP, L, L], holes: [], step: 1, explode: [0.05, 0, 0.06] },
    { id: 'liston-ti', ref: '6', cutTip: LISTON6_TIP, name: 'Llistó de base posterior esq.', kind: 'pino', qty: 4, box: [T, T + L, D - T - L, D - T, 0, HP], view: 'front', w: L, h: HP, t: L, cut: [HP, L, L], holes: [], step: 2, explode: [-0.05, 0, -0.06] },
    { id: 'liston-td', ref: '6', cutTip: LISTON6_TIP, name: 'Llistó de base posterior dr.', kind: 'pino', qty: 4, box: [W - T - L, W - T, D - T - L, D - T, 0, HP], view: 'front', w: L, h: HP, t: L, cut: [HP, L, L], holes: [], step: 3, explode: [0.05, 0, -0.06] },
    { id: 'liston-si', ref: '7', name: 'Llistó superior esq.', kind: 'pino', qty: 2, box: [T, T + L, S, D - S, H - T - L, H - T], view: 'side', w: D - 2 * S, h: L, t: L, cut: [D - 2 * S, L, L], holes: [], step: 5, explode: [-0.06, 0.08, 0] },
    { id: 'liston-sd', ref: '7', name: 'Llistó superior dr.', kind: 'pino', qty: 2, box: [W - T - L, W - T, S, D - S, H - T - L, H - T], view: 'side', w: D - 2 * S, h: L, t: L, cut: [D - 2 * S, L, L], holes: [], step: 5, explode: [0.06, 0.08, 0] },
  ]
}

/** Secuencia de montaje de los planos v1 (lámina «Montaje»). */
export const ASSEMBLY: AssemblyStep[] = [
  { n: 1, title: 'Frontal i llistons davanters', pieces: ['frente', 'liston-di', 'liston-dd'], text: 'Encola els dos llistons 6 a la cara interior del frontal 4, arran dels cantells laterals i inferior. Estreny amb serjants 30 min.', union: 'Només cola + serjants 30 min. Sense cargols a la vista.', screws: false },
  { n: 2, title: 'Primer lateral', pieces: ['lateral-izq', 'liston-ti'], text: "Encola i cargola el lateral esquerre 1 als llistons (forat guia de Ø2 a través del forat). Col·loca el llistó posterior 6 fent servir la tapa del darrere 5 com a galga (sense cola a la tapa del darrere).", union: 'Cola + 2 cargols 3 × 20 per llistó, des de fora (forats A-D).', screws: true },
  { n: 3, title: 'Segon lateral i tapa del darrere', pieces: ['lateral-der', 'liston-td', 'trasera'], text: "Fes el mateix amb el lateral dret. Cargola la tapa del darrere 5 als llistons posteriors SENSE cola. Comprova amb l'escaire que els laterals són a 90°.", union: 'Lateral: cola + 2 cargols per llistó. Tapa del darrere: 2 cargols per llistó, sense cola, per poder-la obrir.', screws: true, tools: ['escuadra'] },
  { n: 4, title: 'Prestatge', pieces: ['estante'], text: 'Posa cola sobre els 4 llistons i el cantell del frontal (no sobre la tapa del darrere). Col·loca el prestatge 3 amb el forat centrat i posa-hi pes a sobre.', union: 'Cola, recolzat per gravetat. Sense cola sobre la tapa del darrere.', screws: false },
  { n: 5, title: 'Llistons superiors', pieces: ['liston-si', 'liston-sd'], text: 'Encola i cargola els llistons 7 per dins dels laterals, arran del cantell superior i centrats (10 mm a cada costat).', union: 'Cola + 1 cargol 3 × 20 des de fora (forats E-F del lateral).', screws: true },
  { n: 6, title: 'Tapa', pieces: ['tapa'], text: 'Encola i cargola la tapa 2 des de dalt. Mesura les dues diagonals del buit: han de ser iguals. Neteja la cola sobrant amb un drap humit.', union: 'Cola + 2 cargols 3 × 20 per llistó, des de dalt.', screws: true },
]

/** Kit eléctrico: portalámparas en el centro del estante y cable por la ranura de la tapa del darrere. */
export function placeElectric(T: number): ElectricPlacement {
  const { W, D, HB } = V1
  const slotX = W - T - REV_B.slotFromRight
  return {
    socket: [W / 2, D / 2],
    plateTop: HB,
    plateT: T,
    cable: [
      [W / 2, D / 2, HB - 16],
      [W / 2, D / 2, HB - 31],
      [W / 2 + 20, D / 2 + 30, 62],
      [slotX - 6, D - T - 10, 56],
      [slotX, D - T - 4, 22],
      [slotX, D - T + 2, 4.25],
      [slotX, D + 10, 3.25],
    ],
  }
}
