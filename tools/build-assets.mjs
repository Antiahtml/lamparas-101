// Convierte los OBJ de cada lámpara (mm, Z arriba) en GLB (m, Y arriba) con un nodo por pieza,
// y copia planos y foto a public/docs. Nunca escribe en las carpetas de origen.
//   node tools/build-assets.mjs            -> todas las lámparas de SOURCES
import { readFileSync, mkdirSync, copyFileSync, existsSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve, basename } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Document, NodeIO } from '@gltf-transform/core'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SRC_BASE = resolve(ROOT, '..') // carpeta LÁMPARA

const SOURCES = [
  {
    id: 'lampara_01',
    obj: 'lampara_01/modelo_3d/lampara_01.obj',
    docs: [
      'lampara_01/planos/lampara_01_planos.pdf',
      'lampara_01/planos/plano_general.dxf',
      'lampara_01/planos/piezas_cotadas.dxf',
      'lampara_01/planos/corte_tablero.dxf',
      'lampara_01/foto_lampara_01.jpg',
    ],
  },
  {
    id: 'lampara_02',
    obj: 'lampara_02/modelo_3d/lampara_02.obj',
    docs: [
      'lampara_02/planos/lampara_02_planos.pdf',
      'lampara_02/planos/plano_general.dxf',
      'lampara_02/planos/piezas_cotadas.dxf',
      'lampara_02/planos/corte_tablero.dxf',
      'lampara_02/foto_lampara_02.jpg',
    ],
  },
]

function parseObj(text) {
  const verts = []
  const objects = []
  let cur = null
  for (const raw of text.split('\n')) {
    const line = raw.trim()
    if (line.startsWith('v ')) verts.push(line.slice(2).trim().split(/\s+/).map(Number))
    else if (line.startsWith('o ') || line.startsWith('g ')) {
      cur = { name: line.slice(2).trim(), faces: [] }
      objects.push(cur)
    } else if (line.startsWith('f ')) {
      if (!cur) objects.push((cur = { name: 'objeto', faces: [] }))
      const idx = line.slice(2).trim().split(/\s+/).map((t) => parseInt(t.split('/')[0], 10) - 1)
      for (let i = 1; i < idx.length - 1; i++) cur.faces.push([idx[0], idx[i], idx[i + 1]])
    }
  }
  return { verts, objects }
}

// mm, Z arriba, Y hacia atrás  ->  m, Y arriba, Z hacia delante
const toGl = ([x, y, z]) => [x / 1000, z / 1000, -y / 1000]

async function convert(src) {
  const { verts, objects } = parseObj(readFileSync(join(SRC_BASE, src.obj), 'utf8'))
  const doc = new Document()
  const buffer = doc.createBuffer()
  const scene = doc.createScene(src.id)
  const root = doc.createNode(src.id)
  scene.addChild(root)
  const manifest = []

  for (const o of objects) {
    const tris = o.faces.map((f) => f.map((i) => toGl(verts[i])))
    const all = tris.flat()
    const min = [0, 1, 2].map((k) => Math.min(...all.map((p) => p[k])))
    const max = [0, 1, 2].map((k) => Math.max(...all.map((p) => p[k])))
    const c = min.map((m, k) => (m + max[k]) / 2)
    // geometría no indexada con normales planas, centrada en el origen del nodo
    const pos = []
    const nor = []
    for (const t of tris) {
      const [a, b, d] = t.map((p) => p.map((v, k) => v - c[k]))
      const u = b.map((v, k) => v - a[k])
      const w = d.map((v, k) => v - a[k])
      const n = [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]]
      const l = Math.hypot(...n) || 1
      for (const p of [a, b, d]) {
        pos.push(...p)
        nor.push(...n.map((v) => v / l))
      }
    }
    const prim = doc
      .createPrimitive()
      .setAttribute('POSITION', doc.createAccessor().setType('VEC3').setArray(new Float32Array(pos)).setBuffer(buffer))
      .setAttribute('NORMAL', doc.createAccessor().setType('VEC3').setArray(new Float32Array(nor)).setBuffer(buffer))
    const mesh = doc.createMesh(o.name).addPrimitive(prim)
    root.addChild(doc.createNode(o.name).setMesh(mesh).setTranslation(c))
    manifest.push({ node: o.name, center: c.map((v) => +v.toFixed(4)), size: max.map((v, k) => +(v - min[k]).toFixed(4)) })
  }

  const outDir = join(ROOT, 'public/models', src.id)
  mkdirSync(outDir, { recursive: true })
  await new NodeIO().write(join(outDir, `${src.id}.glb`), doc)
  writeFileSync(join(outDir, 'nodes.json'), JSON.stringify(manifest, null, 2))
  console.log(`✔ ${src.id}.glb  (${objects.length} piezas)`)

  const docsDir = join(ROOT, 'public/docs', src.id)
  mkdirSync(docsDir, { recursive: true })
  for (const d of src.docs) {
    const from = join(SRC_BASE, d)
    if (existsSync(from)) copyFileSync(from, join(docsDir, basename(d)))
    else console.warn(`  ! falta ${d}`)
  }
}

for (const s of SOURCES) await convert(s)
