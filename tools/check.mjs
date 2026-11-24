// Prueba de humo en Chrome (headless).  node tools/check.mjs <url> <carpeta-capturas>
import puppeteer from 'puppeteer-core'

const url = process.argv[2] ?? 'http://localhost:5179/'
const out = process.argv[3] ?? '.'
const W = Number(process.env.W ?? 1366)
const H = Number(process.env.H ?? 768)
const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new',
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
})
const page = await browser.newPage()
await page.setViewport({ width: W, height: H })
const errors = []
page.on('console', (m) => (m.type() === 'error' || m.type() === 'warning') && errors.push(`[${m.type()}] ${m.text()}`))
page.on('pageerror', (e) => errors.push(`[pageerror] ${e.message}`))
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
const shot = (n) => page.screenshot({ path: `${out}/${n}.png` })
const log = (...a) => console.log('•', ...a)
const clickText = async (sel, text) => {
  const ok = await page.evaluate(
    (sel, text) => {
      const el = [...document.querySelectorAll(sel)].find((e) => e.textContent.trim().includes(text))
      el?.click()
      return !!el
    },
    sel,
    text,
  )
  if (!ok) log('NO encontrado:', text)
  return ok
}
const text = (sel) => page.evaluate((s) => document.querySelector(s)?.textContent ?? null, sel)

await page.goto(url, { waitUntil: 'networkidle0' })
await wait(3500)
await shot('01-inventario')
log('inventario abierto:', !!(await page.$('[role=dialog]')))

// 1. grosor
await page.type('[role=dialog] input', '9,5')
await clickText('[role=dialog] button', 'Següent')
await wait(300)
// 2. material: tornillos NO, lija NO, resto sí; portalámparas E27
await page.evaluate(() => {
  for (const g of document.querySelectorAll('[role=dialog] [role=radiogroup]')) {
    const label = g.getAttribute('aria-label')
    const want = label === 'Portalàmpades' ? 'E27' : ['Cargols 3 × 20', 'Paper de vidre'].includes(label) ? 'No' : 'En tinc'
    ;[...g.querySelectorAll('button')].find((b) => b.textContent.trim() === want)?.click()
  }
})
await wait(200)
await shot('02-inventario-material')
// pista con foto
await page.click('[role=dialog] button[aria-label="Pista: com és serjants"]')
await wait(1500)
await shot('02b-pista')
log('pista:', await page.evaluate(() => { const d = [...document.querySelectorAll('[role=dialog]')].pop(); const img = d.querySelector('img'); return d.getAttribute('aria-label') + ' | imatge carregada: ' + (img ? img.naturalWidth > 0 : 'sense imatge') }))
await page.keyboard.press('Escape')
await wait(300)
const allPhotos = await page.evaluate(async () => {
  const files = [...document.querySelectorAll('[role=dialog] button[aria-label^="Pista"]')].length
  return files
})
log('botons de pista:', allPhotos)
await clickText('[role=dialog] button', 'Explorar la meva làmpada')
await wait(1200)
log('inventario cerrado:', !(await page.$('[role=dialog]')), '| resumen:', await text('nav button[aria-label="Revisar el meu material"]'))
await shot('03-lampara')

// clic en el lateral derecho de la lámpara (lado derecho de la imagen)
const b = (await (await page.$('canvas')).boundingBox())
let got = null
for (const [fx, fy] of [[0.62, 0.45], [0.6, 0.5], [0.58, 0.4], [0.5, 0.65]]) {
  await page.mouse.click(b.x + b.width * fx, b.y + b.height * fy)
  await wait(500)
  got = await text('aside h2')
  if (got && got !== 'Toca qualsevol peça') break
}
log('pieza seleccionada:', got)
await wait(1200)
await shot('04-pieza-medidas')
log('medidas:', await page.evaluate(() => [...document.querySelectorAll('aside .font-hand.text-cota')].map((e) => e.textContent).join(' × ')))
for (const t of ['Tallar', 'Preparar', 'Muntar']) {
  await clickText('aside [role=tab]', t)
  await wait(400)
  await shot('05-pieza-' + t)
  log(t + ':', (await text('aside .scroll-thin'))?.slice(0, 160))
}
await clickText('aside button', 'Veure on encaixa')
await wait(1500)
await shot('06-encaja')

// estante desde el índice
await clickText('nav button', 'Prestatge')
await wait(400)
await clickText('aside [role=tab]', 'Mesures')
await wait(1500)
await shot('07-estante')
log('estante, agujeros:', await page.evaluate(() => [...document.querySelectorAll('aside tbody tr')].map((r) => r.textContent).join(' | ')))

// listón
await clickText('nav button', 'Llistó de base')
await wait(1500)
await clickText('aside [role=tab]', 'Tallar')
await shot('08-liston')
log('listón:', (await text('aside .scroll-thin'))?.slice(0, 200))

// objeto del banco
await clickText('nav button', 'Trepant')
await wait(800)
await shot('09-taladro')
log('taladro:', await text('aside h2'), '|', (await text('aside .scroll-thin'))?.slice(0, 120), '| foto:', await page.evaluate(() => { const i = document.querySelector('aside img'); return i ? i.naturalWidth > 0 : 'cap' }))

// componente + interruptor
await clickText('nav button', 'Interruptor de pas')
await wait(800)
log('componente:', await text('aside h2'))
await clickText('aside button', 'Tota la làmpada')
await wait(400)
await clickText('aside [role=tab]', 'Esquema')
await wait(300)
await page.click('g[aria-label="Interruptor de pas"]')
await wait(700)
log('esquema:', await page.evaluate(() => document.querySelector('svg[role=img]')?.getAttribute('aria-label')))
await shot('10-encendida')

// ---------------- làmpada 02 ----------------
await clickText('aside button', 'Tota la làmpada')
await clickText('nav [role=group] button', 'L02')
await wait(1500)
log('L02 activa:', await page.evaluate(() => document.querySelector('nav [role=group] button[aria-pressed=true]')?.textContent), '| inventari obert:', !!(await page.$('[role=dialog]')))
log('L02 per respondre:', await page.evaluate(() => [...document.querySelectorAll('[role=dialog] [role=radiogroup]')].filter((g) => !g.querySelector('[aria-checked=true]')).map((g) => g.getAttribute('aria-label')).join(', ')))
await page.evaluate(() => {
  for (const g of document.querySelectorAll('[role=dialog] [role=radiogroup]')) if (!g.querySelector('[aria-checked=true]')) [...g.querySelectorAll('button')].find((b) => b.textContent.trim() === 'En tinc')?.click()
})
await wait(200)
await clickText('[role=dialog] button', 'Explorar la meva làmpada')
await wait(2500)
await shot('11-L02')
log('L02 sidebar:', await page.evaluate(() => [...document.querySelectorAll('nav li button')].slice(0, 15).map((b) => b.textContent.trim()).join(' / ')))
await page.click('button[aria-label="Mostrar les mesures"]')
await wait(800)
await shot('11b-L02-mesures')
await page.click('button[aria-label="Mostrar les mesures"]')
for (const [name, file] of [['Tapa de la base', '12-L02-tapa'], ['Darrere de la base', '13-L02-darrere'], ['Frontal de la columna', '14-L02-frontal'], ['Lateral de la columna', '15-L02-lateral'], ['Fons', '16-L02-fons']]) {
  await clickText('nav button', name)
  await wait(400)
  await clickText('aside [role=tab]', 'Mesures')
  await wait(1600)
  await shot(file)
  log(name + ':', await page.evaluate(() => [...document.querySelectorAll('aside .font-hand.text-cota')].map((e) => e.textContent).join(' × ')), '| forats:', await page.evaluate(() => [...document.querySelectorAll('aside tbody tr')].map((r) => [...r.children].map((c) => c.textContent).join(' ')).join(' | ')))
  await clickText('aside [role=tab]', 'Preparar')
  await wait(300)
  log('   preparar:', (await text('aside .scroll-thin'))?.slice(0, 420))
  await clickText('aside [role=tab]', 'Muntar')
  await wait(300)
  log('   muntar:', (await text('aside .scroll-thin'))?.slice(0, 260))
}
await clickText('aside [role=tab]', 'Muntar')
await clickText('aside button', 'Veure on encaixa')
await wait(1600)
await shot('17-L02-encaixa')
await clickText('aside button', 'Tota la làmpada')
await wait(1200)
await page.click('button[aria-label="Separar les peces"]')
await wait(1500)
await shot('18-L02-separada')
await page.click('button[aria-label="Separar les peces"]')
await clickText('aside [role=tab]', 'Esquema')
await wait(200)
await page.click('g[aria-label="Interruptor de pas"]')
await wait(1200)
await shot('19-L02-encesa')
await clickText('aside [role=tab]', 'Plànols')
await wait(200)
log('L02 plànols:', await page.evaluate(async () => {
  const links = [...document.querySelectorAll('aside a[href^="docs/"]')].map((a) => a.getAttribute('href'))
  const st = await Promise.all(links.map((h) => fetch(h).then((r) => r.status)))
  return links.map((h, i) => `${h.split('/').pop()} ${st[i]}`).join(', ')
}))
log('L02 serra de marqueteria:', await clickText('nav button', 'Serra de marqueteria'), (await text('aside .scroll-thin'))?.slice(0, 200), '| foto:', await page.evaluate(() => { const i = document.querySelector('aside img'); return i ? i.naturalWidth > 0 : 'cap' }))
await wait(800)
await shot('20-L02-marqueteria')

const fps = await page.evaluate(
  () =>
    new Promise((r) => {
      let n = 0
      const t0 = performance.now()
      const f = () => (++n, performance.now() - t0 < 2000 ? requestAnimationFrame(f) : r(n / 2))
      requestAnimationFrame(f)
    }),
)
log('fps (headless, software):', fps)
console.log('\nCONSOLA:\n' + (errors.length ? [...new Set(errors)].join('\n') : '(sin errores ni avisos)'))
await browser.close()
