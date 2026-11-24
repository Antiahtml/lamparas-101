// Modelo paramétrico de lampara_02 (columna en L con luz escondida).
// Fórmulas copiadas de ../lampara_02/generador/generar_planos_02.py (VERSIÓN 1, validada el 22/11/2026):
// P, G(), zc(), wood_items(), screws(), screw_pieces(), MAP, piece_holes(), build_pieces(), cable_path(), ASSEMBLY.
// El alumno introduce el grosor T del tablero; el resto de parámetros son los validados.
// Las cotas del kit 230 V (portalámparas, ranura, abrazadera) son PROVISIONALES (iteración 2 de lampara_01).
// tools/check-model.mjs compara este modelo con el generador (T = 10, 9,5 y 12) y con el OBJ.

import type { AssemblyStep, Box, ElectricPlacement, Hole, Holder, PieceSpec, View } from '../model'

export const P2 = {
  T: 10, // contrachapado (validado)
  TF: 5, // fondo de contrachapado de 5 mm
  L: 15, // listón de pino 15 × 15
  BW: 250, // anchura de la base
  HF: 45, // altura de los cantos de la base
  H_ALTO: 350, // panel trasero alto (izquierda)
  H_COL: 330, // columna en L
  H_BAJO: 310, // panel trasero bajo (derecha)
  CLR: 25, // holgura bombilla - madera
  BULB_TOL: 3,
  GAP_S: 35, // rendija de luz entre la columna y los paneles
  COL_Y: 40, // retranqueo de la columna
  REAR_M: 10, // margen trasero de la base
  TIE_Z: 240, // altura del listón de unión trasero
  SLOT_X: 175, // x de la ranura del cable (desde la izquierda)
  SCREW_D: 3.5,
  CSK_D: 7,
  SCREW_L: 20,
  KERF: 3,
}
/** kit 230 V: cotas PROVISIONALES (lampara_01/iteracion_02/generar_propuesta.py, C) */
export const KIT2 = { bulbD: 95, sockD: 40, holeClear: 1, slotW: 8, slotH: 15, clampL: 30, clampW: 10, clampH: 12, clampZ: 27 }

/** Cotas derivadas: G() del generador */
export function derived(T: number) {
  const { L, CLR, BULB_TOL, BW, HF, COL_Y, GAP_S, REAR_M } = P2
  const up5 = (v: number) => 5 * Math.ceil(v / 5 - 1e-9)
  const DE = KIT2.bulbD + BULB_TOL
  const R = DE / 2
  const COL_W = up5(T + CLR + DE + 5)
  const COL_X = (BW - COL_W) / 2
  const CAV = up5(2 * CLR + DE)
  const BACK_Y = COL_Y + T + CAV
  const COL_D = BACK_Y - GAP_S - (COL_Y + T)
  return {
    HB: HF + T,
    COL_W,
    COL_X,
    BACK_Y,
    COL_D,
    BD: BACK_Y + T + L + REAR_M,
    BACK_X: T,
    BACK_W: (BW - 2 * T) / 2,
    BX: COL_X + T + CLR + R,
    BY: (COL_Y + T + BACK_Y) / 2,
    TIE_L: BW - 2 * T - 40, // 2 · BACK_W - 40
  }
}

interface Item {
  ref: string
  /** nombre del generador (identifica la pieza en los tornillos y en el OBJ) */
  gen: string
  box: Box
}

/** wood_items() */
function woodItems(T: number): Item[] {
  const { L, BW, HF, TF, COL_Y: Y0, H_COL, H_ALTO, H_BAJO, TIE_Z } = P2
  const g = derived(T)
  const { HB, BD, COL_X: X0, COL_W: CW, COL_D: CD, BACK_Y: BY, BACK_X: BXL, BACK_W: BWW } = g
  const xm = BW / 2
  const it: Item[] = [
    { ref: '1', gen: 'Tapa base', box: [0, BW, 0, BD, HF, HB] },
    { ref: '2', gen: 'Frente base', box: [0, BW, 0, T, 0, HF] },
    { ref: '3', gen: 'Trasera base', box: [0, BW, BD - T, BD, 0, HF] },
    { ref: '4', gen: 'Lateral base izq.', box: [0, T, T, BD - T, 0, HF] },
    { ref: '4', gen: 'Lateral base der.', box: [BW - T, BW, T, BD - T, 0, HF] },
    { ref: '5', gen: 'Fondo', box: [T, BW - T, T, BD - T, 0, TF] },
  ]
  for (const [nm, x0, y0] of [
    ['del.-izq.', T, T],
    ['del.-der.', BW - T - L, T],
    ['tras.-izq.', T, BD - T - L],
    ['tras.-der.', BW - T - L, BD - T - L],
  ] as const)
    it.push({ ref: '10', gen: `Listón esquina base ${nm}`, box: [x0, x0 + L, y0, y0 + L, TF, HF] })
  it.push(
    { ref: '6', gen: 'Frente columna', box: [X0, X0 + CW, Y0, Y0 + T, HB, H_COL] },
    { ref: '7', gen: 'Lateral columna', box: [X0, X0 + T, Y0 + T, Y0 + T + CD, HB, H_COL] },
    { ref: '8', gen: 'Panel trasero alto', box: [BXL, BXL + BWW, BY, BY + T, HB, H_ALTO] },
    { ref: '9', gen: 'Panel trasero bajo', box: [BXL + BWW, BXL + 2 * BWW, BY, BY + T, HB, H_BAJO] },
    { ref: '11', gen: 'Listón esquina columna', box: [X0 + T, X0 + T + L, Y0 + T, Y0 + T + L, HB, H_COL] },
    { ref: '12', gen: 'Listón pie frente', box: [X0 + T + L, X0 + CW, Y0 + T, Y0 + T + L, HB, HB + L] },
    { ref: '13', gen: 'Listón pie lateral', box: [X0 + T, X0 + T + L, Y0 + T + L, Y0 + T + CD, HB, HB + L] },
    { ref: '14', gen: 'Listón pie trasero', box: [BXL, BXL + 2 * BWW, BY + T, BY + T + L, HB, HB + L] },
    { ref: '15', gen: 'Listón unión trasero', box: [xm - g.TIE_L / 2, xm + g.TIE_L / 2, BY + T, BY + T + L, TIE_Z, TIE_Z + L] },
  )
  return it
}

type Vec = [number, number, number]
type Screw = { pt: Vec; ax: 0 | 1 | 2; sg: 1 | -1; ln: number }

/** screws(): tornillos 3 × 20 avellanados (y 3 × 16 en el fondo) */
export function screws(T: number): Screw[] {
  const { L, BW, HF, COL_Y: Y0, H_COL, TIE_Z, SCREW_L } = P2
  const g = derived(T)
  const { HB, BD, COL_X: X0, COL_W: CW, COL_D: CD, BACK_Y: BY } = g
  const xm = BW / 2
  const m = L / 2
  const s: Screw[] = []
  const add = (pt: Vec, ax: 0 | 1 | 2, sg: 1 | -1, ln = SCREW_L) => s.push({ pt, ax, sg, ln })
  const cx = [T + m, BW - T - m]
  const cy = [T + m, BD - T - m]
  for (const x of cx) {
    add([x, 0, 23], 1, 1)
    add([x, BD, 23], 1, -1)
  }
  for (const y of cy) {
    add([0, y, 29], 0, 1)
    add([BW, y, 29], 0, -1)
  }
  for (const x of cx)
    for (const y of cy) {
      add([x, y, HB], 2, -1)
      add([x, y, 0], 2, 1, 16)
    }
  const ups: [number, number][] = [
    [X0 + T + m, Y0 + T + m],
    [X0 + T + L + 20, Y0 + T + m],
    [X0 + CW - 25, Y0 + T + m],
    [X0 + T + m, Y0 + T + L + 15],
    [X0 + T + m, Y0 + T + CD - 30],
    ...[xm - 60, xm, xm + 60].map((x) => [x, BY + T + m] as [number, number]),
  ]
  for (const [x, y] of ups) add([x, y, HF], 2, 1)
  for (const zz of [HB + 40, HB + 150, H_COL - 20]) add([X0 + T + m, Y0, zz], 1, 1)
  for (const x of [X0 + T + L + 50, X0 + CW - 10]) add([x, Y0, HB + m], 1, 1)
  for (const zz of [HB + 95, HB + 205]) add([X0, Y0 + T + m, zz], 0, 1)
  for (const y of [Y0 + T + L + 35, Y0 + T + CD - 10]) add([X0, y, HB + m], 0, 1)
  for (const x of [xm - 90, xm - 30, xm + 30, xm + 90]) add([x, BY, HB + m], 1, 1)
  for (const x of [xm - 75, xm - 25, xm + 25, xm + 75]) add([x, BY, TIE_Z + m], 1, 1)
  return s
}

const inside = (b: Box, q: Vec, eps = 1e-6) => [0, 1, 2].every((k) => b[2 * k] + eps < q[k] && q[k] < b[2 * k + 1] - eps)

/** MAP del generador: (eje u, signo, eje v, signo). Ordena y nombra los agujeros igual que las láminas. */
const MAP: Record<string, [number, number, number, number]> = {
  '1': [0, 1, 1, 1],
  '2': [0, 1, 2, 1],
  '3': [0, -1, 2, 1],
  '4': [1, -1, 2, 1],
  '5': [0, 1, 1, 1],
  '6': [2, 1, 0, -1],
  '7': [2, 1, 1, 1],
  '8': [2, 1, 0, -1],
  '9': [2, 1, 0, -1],
}
const MAP_ALT: Record<string, [number, number, number, number]> = { 'Lateral base der.': [1, 1, 2, 1] }

function local(b: Box, mp: [number, number, number, number], q: Vec): [number, number] {
  const [ua, us, va, vs] = mp
  const u = us > 0 ? q[ua] - b[2 * ua] : b[2 * ua + 1] - q[ua]
  const v = vs > 0 ? q[va] - b[2 * va] : b[2 * va + 1] - q[va]
  return [Math.round(u * 100) / 100, Math.round(v * 100) / 100]
}

function viewNormal([ua, us, va, vs]: [number, number, number, number]): Vec {
  const a: Vec = [0, 0, 0]
  const b: Vec = [0, 0, 0]
  a[ua] = us
  b[va] = vs
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
}

/** Coordenadas de la cara tal como la ve el alumno en la ficha 3D (pieza de pie, misma cara que la lámina). */
function project(view: View, b: Box, q: Vec): [number, number] {
  const [x0, x1, y0, y1, z0] = b
  const r = (v: number) => Math.round(v * 100) / 100
  switch (view) {
    case 'front':
      return [r(q[0] - x0), r(q[2] - z0)]
    case 'back':
      return [r(x1 - q[0]), r(q[2] - z0)]
    case 'side':
      return [r(q[1] - y0), r(q[2] - z0)]
    case 'left':
      return [r(y1 - q[1]), r(q[2] - z0)]
    case 'top':
      return [r(q[0] - x0), r(q[1] - y0)]
  }
}

function faceSize(view: View, b: Box): [number, number, number] {
  const e = [b[1] - b[0], b[3] - b[2], b[5] - b[4]]
  if (view === 'front' || view === 'back') return [e[0], e[2], e[1]]
  if (view === 'side' || view === 'left') return [e[1], e[2], e[0]]
  return [e[0], e[1], e[2]]
}

type RawHole = { gu: number; gv: number; q: Vec; kind: Hole['kind']; face?: Hole['face'] }

/** piece_holes(): agujeros en coordenadas de la lámina, en el mismo orden (las letras A, B, C… salen de aquí) */
function rawHoles(it: Item, items: Item[], T: number): RawHole[] {
  const mp = MAP_ALT[it.gen] ?? MAP[it.ref]
  if (!mp) return []
  const n = viewNormal(mp)
  const raw: RawHole[] = []
  for (const s of screws(T)) {
    const d: Vec = [0, 0, 0]
    d[s.ax] = s.sg
    const thru = items.find((w) => inside(w.box, [0, 1, 2].map((k) => s.pt[k] + 0.5 * d[k]) as Vec))
    if (thru?.gen !== it.gen) continue
    const [gu, gv] = local(it.box, mp, s.pt)
    const dn = d[0] * n[0] + d[1] * n[1] + d[2] * n[2]
    raw.push({ gu, gv, q: s.pt, kind: 'tornillo', face: dn < 0 ? 'vista' : 'oculta' })
  }
  if (it.ref === '1') {
    const g = derived(T)
    const q: Vec = [g.BX, g.BY, 0]
    const [gu, gv] = local(it.box, mp, q)
    raw.push({ gu, gv, q, kind: 'portalamparas' })
  }
  raw.sort((a, b) => Number(a.kind === 'portalamparas') - Number(b.kind === 'portalamparas') || a.gv - b.gv || a.gu - b.gu)
  return raw
}

/** Para tools/check-model.mjs: agujeros como en la tabla de la lámina [u, v, Ø, tipo] */
export function sheetHoles(T: number): Record<string, [number, number, number, string][]> {
  const items = woodItems(T)
  const out: Record<string, [number, number, number, string][]> = {}
  for (const it of items)
    out[it.gen] = rawHoles(it, items, T).map((h) => [h.gu, h.gv, h.kind === 'portalamparas' ? KIT2.sockD + KIT2.holeClear : P2.SCREW_D, h.kind === 'portalamparas' ? 'socket' : h.face === 'vista' ? 'csk' : 'csk_back'])
  return out
}

/** Para tools/check-model.mjs: cajas de las piezas por nombre del generador */
export function sheetBoxes(T: number): Record<string, Box> {
  return Object.fromEntries(woodItems(T).map((it) => [it.gen, it.box]))
}

function pieceHoles(it: Item, items: Item[], view: View, T: number, holder: Holder | undefined): Hole[] {
  const raw = rawHoles(it, items, T)
  return raw.map((h, i) => {
    const [u, v] = project(view, it.box, h.q)
    const id = String.fromCharCode(65 + i)
    if (h.kind === 'portalamparas')
      return {
        id,
        u,
        v,
        d: holder === 'E27' ? KIT2.sockD + KIT2.holeClear : null,
        kind: 'portalamparas',
        provisional: true,
        note: 'El fa el professor amb una broca de corona.',
      } satisfies Hole
    return { id, u, v, d: P2.SCREW_D, kind: 'tornillo', face: h.face } satisfies Hole
  })
}

/** Datos de presentación de cada pieza del generador (nombre en catalán, vista, paso de montaje, explosión). */
const PIECES: Record<string, { id: string; name: string; view: View; step: number; explode: Vec }> = {
  'Tapa base': { id: 'tapa-base', name: 'Tapa de la base', view: 'top', step: 5, explode: [0, 0.05, 0] },
  'Frente base': { id: 'frente-base', name: 'Frontal de la base', view: 'front', step: 6, explode: [0, 0, 0.1] },
  'Trasera base': { id: 'trasera-base', name: 'Darrere de la base', view: 'back', step: 6, explode: [0, 0, -0.1] },
  'Lateral base izq.': { id: 'lateral-base-izq', name: 'Lateral de la base esquerre', view: 'left', step: 6, explode: [-0.1, 0, 0] },
  'Lateral base der.': { id: 'lateral-base-der', name: 'Lateral de la base dret', view: 'side', step: 6, explode: [0.1, 0, 0] },
  Fondo: { id: 'fondo', name: 'Fons', view: 'top', step: 10, explode: [0, 0, 0] },
  'Listón esquina base del.-izq.': { id: 'liston-base-di', name: 'Llistó de cantonada de la base davanter esq.', view: 'front', step: 6, explode: [-0.05, 0, 0.05] },
  'Listón esquina base del.-der.': { id: 'liston-base-dd', name: 'Llistó de cantonada de la base davanter dr.', view: 'front', step: 6, explode: [0.05, 0, 0.05] },
  'Listón esquina base tras.-izq.': { id: 'liston-base-ti', name: 'Llistó de cantonada de la base posterior esq.', view: 'front', step: 6, explode: [-0.05, 0, -0.05] },
  'Listón esquina base tras.-der.': { id: 'liston-base-td', name: 'Llistó de cantonada de la base posterior dr.', view: 'front', step: 6, explode: [0.05, 0, -0.05] },
  'Frente columna': { id: 'frente-col', name: 'Frontal de la columna', view: 'front', step: 3, explode: [0, 0.11, 0.1] },
  'Lateral columna': { id: 'lateral-col', name: 'Lateral de la columna', view: 'left', step: 3, explode: [-0.1, 0.11, 0] },
  'Panel trasero alto': { id: 'panel-alto', name: 'Panell del darrere alt', view: 'front', step: 4, explode: [-0.03, 0.11, -0.08] },
  'Panel trasero bajo': { id: 'panel-bajo', name: 'Panell del darrere baix', view: 'front', step: 4, explode: [0.03, 0.11, -0.08] },
  'Listón esquina columna': { id: 'liston-col', name: 'Llistó de cantonada de la columna', view: 'front', step: 3, explode: [0, 0.11, 0] },
  'Listón pie frente': { id: 'liston-pie-frente', name: 'Llistó de peu del frontal', view: 'front', step: 3, explode: [0, 0.08, 0.02] },
  'Listón pie lateral': { id: 'liston-pie-lateral', name: 'Llistó de peu del lateral', view: 'left', step: 3, explode: [-0.03, 0.08, 0] },
  'Listón pie trasero': { id: 'liston-pie-trasero', name: 'Llistó de peu del darrere', view: 'front', step: 4, explode: [0, 0.08, -0.16] },
  'Listón unión trasero': { id: 'liston-union', name: "Llistó d'unió del darrere", view: 'front', step: 4, explode: [0, 0.11, -0.16] },
}

/** Notas de cada lámina de pieza (defs de build_pieces), en catalán. */
const NOTES: Record<string, string[]> = {
  '1': [
    "Forat de Ø41 per al portalàmpades del kit: abans de trepar, comprova'l amb el kit (Ø de la rosca + 1 mm).",
    "Els 4 forats de les cantonades s'avellanen per dalt; els altres per sota (subjecten la columna i els panells del darrere).",
  ],
  '2': ['Avellana per la cara vista.'],
  '3': [
    "Ranura oberta de 8 × 15 al cantell inferior per al cable del kit: el cable hi entra de costat (no s'enfila). Fes-la amb la serra de marqueteria i poleix-ne bé les vores.",
    'Avellana per la cara exterior.',
  ],
  '4': ['Els dos laterals són iguals.', 'Avellana per la cara exterior.'],
  '5': ['Avellana per sota (la cara exterior).', "Es cargola SENSE COLA: és la tapa de registre. Amb 230 V a dins, només s'ha de poder obrir amb tornavís."],
  '6': ['Avellana per la cara vista.', 'La veta de la xapa exterior ha d’anar en vertical.'],
  '7': ['Avellana per la cara exterior.', 'Va darrere del frontal 6: el frontal en tapa el cantell davanter.'],
  '8': ["Va a l'esquerra.", 'Avellana per la cara del davant.', 'Poleix molt bé la cara del davant: és la que il·lumina la bombeta.'],
  '9': ['Va a la dreta.', 'Avellana per la cara del davant.', 'Poleix molt bé la cara del davant: és la que il·lumina la bombeta.'],
}

export function buildPieces2(T: number, holder: Holder | undefined): PieceSpec[] {
  const { L, HF, TF } = P2
  const items = woodItems(T)
  const count = (ref: string) => items.filter((i) => i.ref === ref).length
  const out = items.map((it): PieceSpec => {
    const meta = PIECES[it.gen]
    const pine = Number(it.ref) >= 10
    const [w, h, t] = faceSize(meta.view, it.box)
    const e = [it.box[1] - it.box[0], it.box[3] - it.box[2], it.box[5] - it.box[4]]
    const mp = MAP[it.ref]
    const cut: [number, number, number] = pine ? [Math.max(...e), L, L] : [e[mp[0]], e[mp[2]], e[3 - mp[0] - mp[2]]]
    const holes = pine ? [] : pieceHoles(it, items, meta.view, T, holder)
    if (it.ref === '3') {
      const [u] = project(meta.view, it.box, [P2.SLOT_X, 0, 0])
      holes.push({ id: 'R', u, v: KIT2.slotH / 2, d: null, kind: 'ranura', w: KIT2.slotW, h: KIT2.slotH, provisional: true })
    }
    return {
      id: meta.id,
      ref: it.ref,
      name: meta.name,
      kind: pine ? 'pino' : 'contrachapado',
      stock: it.ref === '5' ? 'contrachapado5' : undefined,
      qty: count(it.ref),
      box: it.box,
      view: meta.view,
      w,
      h,
      t,
      cut,
      holes,
      step: meta.step,
      explode: meta.explode,
      notes: NOTES[it.ref],
      cutTip:
        it.ref === '10'
          ? `Comprova que fan exactament l'alçada interior de la base (${HF - TF} mm): si són més llargs, la tapa no recolzarà sobre els cantells.`
          : undefined,
    }
  })
  return out.sort((a, b) => Number(a.ref) - Number(b.ref))
}

/** Kit eléctrico: portalámparas en la tapa de la base, escondido detrás del frente de la columna (cable_path()). */
export function placeElectric2(T: number): ElectricPlacement & { lift: number } {
  const g = derived(T)
  const { HB, BD, BX, BY } = g
  const { TF, SLOT_X: sx } = P2
  const { clampL, clampW, clampH, clampZ: cz } = KIT2
  const cableD = 6.5
  const sock0 = HB - 16
  const yc = BD - T - clampW / 2
  return {
    socket: [BX, BY],
    plateTop: HB,
    plateT: T,
    cable: [
      [BX, BY, sock0],
      [BX, BY, sock0 - 6],
      [BX + 10, BY + 25, cz + clampH / 2 + 2],
      [sx - 8, yc - 14, cz + clampH / 2 + 3],
      [sx, yc, cz + clampH / 2 + 1],
      [sx, yc, cz - clampH / 2 - 1],
      [sx, yc, TF + 9],
      [sx, BD - T + 2, TF + cableD / 2 + 0.5],
      [sx, BD + 10, cableD / 2 + 1],
    ],
    clamp: [sx - clampL / 2, sx + clampL / 2, BD - T - clampW, BD - T, cz - clampH / 2, cz + clampH / 2],
    lift: 0.05,
  }
}

/** Secuencia de montaje de las láminas de lampara_02 (ASSEMBLY del generador), en catalán. */
export const ASSEMBLY2: AssemblyStep[] = [
  {
    n: 1,
    title: 'Preparar les peces',
    pieces: [],
    text: 'Talla segons el pla de tall (làmina 3) i els llistons (làmina 13). Poleix cares i cantells amb gra 120 i 180. Marca amb llapis el número de cada peça a la cara interior.',
    union: "Encara no s'uneix res.",
    screws: false,
    glue: false,
  },
  {
    n: 2,
    title: 'Trepar amb plantilla',
    pieces: [],
    text: "Imprimeix les làmines de les peces al 100 % (comprova la barra de 100 mm). Enganxa-les amb cinta sobre la peça i marca els centres amb el punxó. Trepa Ø3,5 i avellana per la cara que indica cada taula. La ranura del darrere 3 es fa amb serra de marqueteria. El Ø41 de la tapa 1 el trepa el professor amb broca de corona. Posa-hi un tauler de sacrifici a sota.",
    union: "Encara no s'uneix res.",
    screws: false,
    glue: false,
  },
  {
    n: 3,
    title: 'Columna en L',
    pieces: ['frente-col', 'lateral-col', 'liston-col', 'liston-pie-frente', 'liston-pie-lateral'],
    text: "Encola el llistó 11 a la cantonada del frontal 6 i els llistons 12 i 13 a baix. Encola i cargola el lateral 7 per fora. El frontal tapa el cantell davanter del lateral. Comprova l'escaire.",
    union: 'Cola + 9 cargols 3 × 20 des de fora: 5 pel frontal 6 i 4 pel lateral 7.',
    screws: true,
    tools: ['escuadra'],
  },
  {
    n: 4,
    title: 'Panells del darrere',
    pieces: ['panel-alto', 'panel-bajo', 'liston-pie-trasero', 'liston-union'],
    text: "Amb els panells 8 i 9 de cara avall i ben junts, encola i cargola per darrere el llistó de peu 14 i el llistó d'unió 15. Comprova que els cantells de baix queden arran.",
    union: "Cola + 8 cargols 3 × 20 des de la cara del davant dels panells: 4 al llistó de peu 14 i 4 al llistó d'unió 15.",
    screws: true,
  },
  {
    n: 5,
    title: 'Fixar sobre la tapa',
    pieces: ['tapa-base'],
    text: 'Col·loca la columna i els panells sobre la tapa 1, amb els seus llistons damunt dels forats. Amb la tapa recolzada sobre dos tacs, cargola des de SOTA a través de la tapa. Aquí sense cola, si es vol poder desmuntar.',
    union: '8 cargols 3 × 20 des de sota, a través de la tapa: 5 a la columna i 3 al llistó de peu del darrere.',
    screws: true,
    glue: false,
  },
  {
    n: 6,
    title: 'Caixa de la base',
    pieces: ['frente-base', 'trasera-base', 'lateral-base-izq', 'lateral-base-der', 'liston-base-di', 'liston-base-dd', 'liston-base-ti', 'liston-base-td'],
    text: "Encola i cargola els llistons 10 als cantells 2, 3 i 4. Els cargols de cada llistó van a alçades diferents perquè no xoquin (làmina 14). Comprova l'escaire i que les diagonals són iguals.",
    union: 'Cola + 8 cargols 3 × 20 des de fora: 2 per llistó, a 23 i 29 mm del terra.',
    screws: true,
    tools: ['escuadra'],
  },
  {
    n: 7,
    title: 'Unir tapa i base',
    pieces: [],
    text: 'Posa cola als cantells i als llistons de la caixa, recolza-hi la tapa amb totes les peces i cargola des de dalt a les 4 cantonades. La ranura del darrere 3 queda darrere, a la dreta.',
    union: 'Cola + 4 cargols 3 × 20 des de dalt (els 4 forats de les cantonades de la tapa).',
    screws: true,
  },
  {
    n: 8,
    title: 'Acabat',
    pieces: [],
    text: "Poleix tot amb gra 240 i arrodoneix una mica les arestes. Vernís a l'aigua o oli (2 mans). Deixa-ho assecar abans de la part elèctrica.",
    union: '—',
    screws: false,
    glue: false,
    tools: ['lija', 'barniz', 'pinceles'],
  },
  {
    n: 9,
    title: 'Part elèctrica (personal qualificat)',
    pieces: [],
    text: "Amb la base oberta, personal qualificat col·loca el kit: el portalàmpades s'estreny amb les seves 2 anelles al forat de Ø41, l'abraçadora subjecta el cable i el cable entra de costat a la ranura. No ho fa l'alumnat.",
    union: 'Ho fa personal qualificat.',
    screws: false,
    glue: false,
  },
  {
    n: 10,
    title: 'Tancament i prova',
    pieces: ['fondo'],
    text: "Cargola el fons 5 (sense cola) i enganxa-hi 4 feltres. La bombeta s'enrosca pel buit obert de la dreta. Abans d'endollar-la, personal qualificat revisa i prova la làmpada.",
    union: "4 cargols 3 × 16, sense cola: és la tapa de registre i només s'ha de poder obrir amb tornavís.",
    screws: true,
    glue: false,
    screwsOnly: "El fons ha d'anar cargolat, no clavat: és la tapa de registre de la part elèctrica i només s'ha de poder obrir amb tornavís.",
    tools: ['fieltros'],
  },
]

/** Para tools/check-model.mjs: nombre del generador de cada pieza */
export const GEN_NAME: Record<string, string> = Object.fromEntries(Object.entries(PIECES).map(([gen, m]) => [m.id, gen]))
