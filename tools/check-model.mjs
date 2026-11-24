// Comprueba los modelos paramétricos de la app contra los archivos CAD (solo lectura).
//   lampara_01: T = 10 contra el GLB convertido del OBJ (centro y tamaño de las 12 piezas).
//   lampara_02: T = 10, 9,5 y 12 contra el volcado del generador (tools/ref/lampara_02.json:
//               cajas, medidas de corte, agujeros con su orden/letra, recorrido del cable).
//   node tools/check-model.mjs
import { readFileSync } from 'node:fs'
import { buildPieces } from '../src/content/lamps/lampara_01.model.ts'
import { buildPieces2, GEN_NAME, placeElectric2, screws, sheetBoxes, sheetHoles } from '../src/content/lamps/lampara_02.model.ts'

let bad = 0
const ok = (cond, msg) => {
  if (!cond) bad++
  console.log(cond ? '✔' : '✘', msg)
}
const near = (a, b, e = 1e-6) => Math.abs(a - b) < e

console.log('— lampara_01 (GLB, T = 10)')
const nodes = JSON.parse(readFileSync(new URL('../public/models/lampara_01/nodes.json', import.meta.url)))
const map = { 'lateral-izq': 'P1_Lateral_izquierdo', 'lateral-der': 'P1_Lateral_derecho', tapa: 'P2_Tapa_superior', estante: 'P3_Estante', frente: 'P4_Frente_base', trasera: 'P5_Trasera_base', 'liston-di': 'P6_Listón_base_del.-izq.', 'liston-dd': 'P6_Listón_base_del.-der.', 'liston-ti': 'P6_Listón_base_tras.-izq.', 'liston-td': 'P6_Listón_base_tras.-der.', 'liston-si': 'P7_Listón_superior_izq.', 'liston-sd': 'P7_Listón_superior_der.' }
for (const p of buildPieces(10, 'E27')) {
  const n = nodes.find((x) => x.node === map[p.id])
  const [x0, x1, y0, y1, z0, z1] = p.box
  const c = [(x0 + x1) / 2000, (z0 + z1) / 2000, -(y0 + y1) / 2000]
  const sz = [(x1 - x0) / 1000, (z1 - z0) / 1000, (y1 - y0) / 1000]
  ok(c.every((v, i) => near(v, n.center[i], 1e-4)) && sz.every((v, i) => near(v, n.size[i], 1e-4)), p.id)
}

console.log('— lampara_02 (generador)')
const ref = JSON.parse(readFileSync(new URL('./ref/lampara_02.json', import.meta.url)))
for (const T of [10, 9.5, 12]) {
  const r = ref[T.toFixed(1)]
  const boxes = sheetBoxes(T)
  const holes = sheetHoles(T)
  const pieces = buildPieces2(T, 'E27')
  let e = 0
  for (const w of r.wood) if (!boxes[w.name] || !w.box.every((v, i) => near(v, boxes[w.name][i]))) (e++, console.log('   caja', w.name, w.box, boxes[w.name]))
  ok(e === 0 && Object.keys(boxes).length === r.wood.length, `T=${T}: ${r.wood.length} piezas, cajas iguales`)
  e = 0
  for (const pc of r.pieces) {
    const gen = pc.ref === '4' ? 'Lateral base izq.' : r.wood.find((w) => w.ref === pc.ref).name
    const mine = holes[gen]
    const same = mine.length === pc.holes.length && pc.holes.every((h, i) => near(h[0], mine[i][0]) && near(h[1], mine[i][1]) && near(h[2], mine[i][2]) && h[3] === mine[i][3])
    if (!same) (e++, console.log('   agujeros', pc.ref, JSON.stringify(pc.holes), JSON.stringify(mine)))
    const app = pieces.find((p) => GEN_NAME[p.id] === gen)
    if (![pc.l, pc.a, pc.g].every((v, i) => near(v, app.cut[i]))) (e++, console.log('   corte', pc.ref, [pc.l, pc.a, pc.g], app.cut))
    if (pc.slot && !near(app.holes.find((h) => h.kind === 'ranura').u, pc.slot[0])) (e++, console.log('   ranura', pc.slot))
    if (app.holes.filter((h) => h.kind !== 'ranura').length !== pc.holes.length) e++
  }
  for (const b of r.battens) {
    const app = pieces.filter((p) => p.ref === b.ref)
    if (app.length !== b.qty || !app.every((p) => near(p.cut[0], b.l))) (e++, console.log('   listón', b))
  }
  ok(e === 0, `T=${T}: agujeros (orden y letra), medidas de corte, ranura y listones`)
  ok(screws(T).length === r.n_screws, `T=${T}: ${r.n_screws} tornillos`)
  const cab = placeElectric2(T).cable
  ok(r.cable.slice(0, cab.length).every((q, i) => q.every((v, k) => near(v, cab[i][k]))), `T=${T}: recorrido del cable`)
}

console.log('— lampara_02 (OBJ del CAD, T = 10)')
const obj = readFileSync(new URL('../../lampara_02/modelo_3d/lampara_02.obj', import.meta.url), 'utf8')
const objBoxes = {}
let cur = null
for (const line of obj.split('\n')) {
  if (line.startsWith('o ')) objBoxes[(cur = line.slice(2).trim())] = [Infinity, -Infinity, Infinity, -Infinity, Infinity, -Infinity]
  else if (line.startsWith('v ') && cur) {
    const v = line.slice(2).trim().split(/\s+/).map(Number)
    const b = objBoxes[cur]
    for (let k = 0; k < 3; k++) (b[2 * k] = Math.min(b[2 * k], v[k])), (b[2 * k + 1] = Math.max(b[2 * k + 1], v[k]))
  }
}
let e = 0
for (const p of buildPieces2(10, 'E27')) {
  const key = `P${p.ref}_${GEN_NAME[p.id].replace(/ /g, '_')}`
  if (!objBoxes[key] || !p.box.every((v, i) => near(v, objBoxes[key][i], 1e-3))) (e++, console.log('   ', key, p.box, objBoxes[key]))
}
ok(e === 0 && Object.keys(objBoxes).length === 19, '19 piezas iguales al OBJ')
process.exit(bad ? 1 : 0)
