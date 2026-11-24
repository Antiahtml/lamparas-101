import type { ReactNode } from 'react'
import { useMemo } from 'react'
import type { PieceSpec } from '../content/model'
import type { LampManifest } from '../content/types'
import { useApp, type Inventory, type PanelTab, type SheetTab } from '../state/store'
import { Icon } from './Icon'
import { InlinePhoto } from './PhotoHint'
import { Schematic } from './Schematic'

const fmt = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(1).replace('.', ','))

export function InfoPanel({ lamp }: { lamp: LampManifest }) {
  const selected = useApp((s) => s.selected)
  const inv = useApp((s) => s.inventory)
  const toggle = useApp((s) => s.togglePanel)
  const T = inv.T ?? lamp.validatedBoard
  const pieces = useMemo(() => lamp.build(T, inv.holder), [lamp, T, inv.holder])
  const piece = pieces.find((p) => p.id === selected)
  const comp = lamp.components.find((c) => c.id === selected)
  const item = selected?.startsWith('item:') ? lamp.catalog.find((c) => `item:${c.id}` === selected) : undefined

  return (
    <aside aria-label="Informació" className="flex h-full flex-col border-l-[1.5px] border-ink/80 bg-card">
      <button onClick={toggle} className="tool-btn absolute top-3 right-3 z-10" aria-label="Amagar el plafó" title="Amagar el plafó">
        <Icon name="panel" />
      </button>
      {piece ? (
        <PieceSheet key={piece.id} lamp={lamp} piece={piece} pieces={pieces} inv={inv} />
      ) : comp ? (
        <Sheet kicker="Part elèctrica" title={comp.name}>
          <ComponentBody lamp={lamp} id={comp.id} inv={inv} />
        </Sheet>
      ) : item ? (
        <Sheet kicker={item.category === 'herramienta' ? 'Eina' : 'Material'} title={item.name}>
          <ItemBody lamp={lamp} id={item.id} inv={inv} pieces={pieces} />
        </Sheet>
      ) : (
        <Overview lamp={lamp} />
      )}
    </aside>
  )
}

function Sheet({ kicker, title, children }: { kicker: string; title: string; children: ReactNode }) {
  const select = useApp((s) => s.select)
  return (
    <>
      <header className="px-5 pt-4 pr-12">
        <button onClick={() => select(null)} className="btn btn-quiet -ml-3 !min-h-0 !py-1 text-[13px]">
          ← Tota la làmpada
        </button>
        <div className="mt-1 text-[13px] font-semibold text-ink-2">{kicker}</div>
        <h2 className="wide mt-0.5 text-[23px] leading-[1.1] font-extrabold tracking-tight">{title}</h2>
      </header>
      <div className="scroll-thin mt-3 flex-1 overflow-y-auto px-5 pb-5">{children}</div>
    </>
  )
}

/* ------------------------------------ vista general ------------------------------------ */

function Overview({ lamp }: { lamp: LampManifest }) {
  const tab = useApp((s) => s.panelTab)
  const setTab = useApp((s) => s.setPanelTab)
  const tabs: { id: PanelTab; label: string }[] = [
    { id: 'lampara', label: 'La teva làmpada' },
    { id: 'esquema', label: 'Esquema' },
    { id: 'documentos', label: 'Plànols' },
  ]
  return (
    <>
      <header className="px-5 pt-5 pr-12">
        <div className="text-[13px] font-semibold text-ink-2">
          {lamp.name} · {lamp.tagline}
        </div>
        <h2 className="wide mt-0.5 text-[23px] leading-[1.1] font-extrabold tracking-tight">Toca qualsevol peça</h2>
      </header>
      <Tabs tabs={tabs} value={tab} onChange={setTab} />
      <div className="scroll-thin flex-1 overflow-y-auto px-5 py-4">
        {tab === 'lampara' && (
          <div className="space-y-4">
            <p className="text-[15px]">Cada peça que toquis surt de la làmpada i et mostra les seves mesures, com tallar-la, com preparar-la i on es munta.</p>
            <ul className="space-y-1.5 text-[14px]">
              <Hint icon="hand">Arrossega sobre l'escena per girar; roda o dos dits per apropar-te.</Hint>
              <Hint icon="explode">Amb «Separar les peces» arribes a les de dins, com els llistons.</Hint>
              <Hint icon="tag">Les eines i els materials del banc també es poden tocar.</Hint>
            </ul>
            <MissingSummary lamp={lamp} />
          </div>
        )}
        {tab === 'esquema' && <Circuit lamp={lamp} />}
        {tab === 'documentos' && <Documents lamp={lamp} />}
      </div>
    </>
  )
}

function MissingSummary({ lamp }: { lamp: LampManifest }) {
  const inv = useApp((s) => s.inventory)
  const missing = lamp.catalog.filter((c) => inv.have[c.id] === false)
  if (inv.T === null) return null
  return (
    <div className={`rounded-xl border-[1.5px] p-3 text-[14px] ${missing.length ? 'border-no/50 bg-[#F6E1D9]' : 'border-accent bg-accent-soft'}`}>
      <div className="font-bold">{missing.length ? "Et falta material" : 'Tens tot el material'}</div>
      {missing.length > 0 && (
        <>
          <ul className="mt-1 list-inside list-disc">
            {missing.map((m) => (
              <li key={m.id}>{m.name}</li>
            ))}
          </ul>
          <p className="mt-1.5 text-[13px]">Demana-ho al professor abans del pas en què ho necessitis. Cada peça t'avisa.</p>
        </>
      )}
    </div>
  )
}

function Hint({ icon, children }: { icon: string; children: ReactNode }) {
  return (
    <li className="flex items-start gap-2.5">
      <span className="mt-0.5 text-accent">
        <Icon name={icon} size={18} />
      </span>
      <span>{children}</span>
    </li>
  )
}

function Tabs<T extends string>({ tabs, value, onChange }: { tabs: { id: T; label: string }[]; value: T; onChange: (t: T) => void }) {
  return (
    <div className="mt-3 flex gap-4 border-b border-line px-5" role="tablist">
      {tabs.map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={value === t.id}
          onClick={() => onChange(t.id)}
          className={`-mb-px border-b-[2.5px] pb-2 text-[14px] font-semibold ${value === t.id ? 'border-accent text-ink' : 'border-transparent text-ink-2 hover:text-ink'}`}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

/* ------------------------------------ ficha de pieza ------------------------------------ */

function PieceSheet({ lamp, piece, pieces, inv }: { lamp: LampManifest; piece: PieceSpec; pieces: PieceSpec[]; inv: Inventory }) {
  const tab = useApp((s) => s.sheetTab)
  const setTab = useApp((s) => s.setSheetTab)
  const tabs: { id: SheetTab; label: string }[] = [
    { id: 'medidas', label: 'Mesures' },
    { id: 'cortar', label: 'Tallar' },
    { id: 'preparar', label: 'Preparar' },
    { id: 'montar', label: 'Muntar' },
  ]
  const T = inv.T ?? lamp.validatedBoard
  return (
    <>
      <header className="px-5 pt-4 pr-12">
        <BackToLamp />
        <div className="mt-1 flex items-center gap-3">
          <span className="font-hand grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent text-[19px] font-bold text-white">{piece.ref}</span>
          <div className="min-w-0">
            <h2 className="wide text-[22px] leading-[1.1] font-extrabold tracking-tight">{piece.name}</h2>
            <div className="text-[13px] text-ink-2">
              {piece.kind === 'pino' ? 'Llistó de pi' : 'Contraxapat'} · {piece.qty > 1 ? `${piece.qty} peces iguals (núm. ${piece.ref})` : 'peça única'}
            </div>
          </div>
        </div>
      </header>
      <Tabs tabs={tabs} value={tab} onChange={setTab} />
      <div className="scroll-thin flex-1 space-y-4 overflow-y-auto px-5 py-4 text-[14.5px]">
        {piece.kind === 'contrachapado' && T !== lamp.validatedBoard && (
          <Note tone="warn">
            Mesures calculades per al teu tauler de {fmt(T)} mm. Els plànols es van comprovar amb {lamp.validatedBoard} mm: ensenya-les al professor abans de tallar.
          </Note>
        )}
        {tab === 'medidas' && <Measures piece={piece} />}
        {tab === 'cortar' && <Cut lamp={lamp} piece={piece} inv={inv} />}
        {tab === 'preparar' && <Prepare lamp={lamp} piece={piece} inv={inv} />}
        {tab === 'montar' && <Assemble lamp={lamp} piece={piece} pieces={pieces} inv={inv} />}
      </div>
    </>
  )
}

function BackToLamp() {
  const select = useApp((s) => s.select)
  return (
    <button onClick={() => select(null)} className="btn btn-quiet -ml-3 !min-h-0 !py-1 text-[13px]">
      ← Tota la làmpada
    </button>
  )
}

function Measures({ piece }: { piece: PieceSpec }) {
  const [l, a, g] = piece.cut
  return (
    <>
      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          ['Llarg', l],
          ['Ample', a],
          ['Gruix', g],
        ].map(([k, v]) => (
          <div key={k} className="rounded-xl bg-paper px-2 py-2.5">
            <div className="font-hand text-[24px] leading-none font-bold text-cota">{fmt(v as number)}</div>
            <div className="mt-1 text-[12px] text-ink-2">{k} (mm)</div>
          </div>
        ))}
      </div>
      <p>
        Les cotes també surten sobre la peça, a l'escena. {piece.qty > 1 ? `Hi ha ${piece.qty} peces iguals amb el número ${piece.ref}.` : ''}
      </p>
      {piece.holes.length > 0 && <HoleTable piece={piece} />}
    </>
  )
}

function HoleTable({ piece }: { piece: PieceSpec }) {
  return (
    <div>
      <div className="text-[13px] font-semibold text-ink-2">Forats (des del cantó inferior esquerre, tal com veus la peça)</div>
      <table className="mt-1.5 w-full text-[13.5px]">
        <thead>
          <tr className="text-left text-ink-2">
            <th className="py-1 font-semibold"></th>
            <th className="font-semibold">Ø</th>
            <th className="font-semibold">→</th>
            <th className="font-semibold">↑</th>
          </tr>
        </thead>
        <tbody className="tabular-nums">
          {piece.holes.map((h) => (
            <tr key={h.id} className="border-t border-line">
              <td className="py-1">
                <span className={`hole-tag ${h.provisional ? 'is-prov' : ''}`}>{h.id}</span>
              </td>
              <td>{h.kind === 'ranura' ? `ranura ${h.w} × ${h.h}` : h.d === null ? '¿?' : fmt(h.d)}</td>
              <td>{fmt(h.u)}</td>
              <td>{h.kind === 'ranura' ? 'cantell inferior' : fmt(h.v)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {piece.holes.some((h) => h.provisional) && <p className="mt-1.5 text-[12.5px] text-no">En vermell: mesura de la proposta del kit elèctric (provisional).</p>}
    </div>
  )
}

/** Lista de lo que hace falta, cruzada con el inventario del alumno */
function Needs({ lamp, ids, inv }: { lamp: LampManifest; ids: string[]; inv: Inventory }) {
  const items = ids.map((id) => lamp.catalog.find((c) => c.id === id)).filter(Boolean) as LampManifest['catalog']
  const missing = items.filter((c) => inv.have[c.id] === false)
  return (
    <div>
      <div className="text-[13px] font-semibold text-ink-2">Necessites</div>
      <ul className="mt-1.5 flex flex-wrap gap-1.5">
        {items.map((c) => {
          const no = inv.have[c.id] === false
          return (
            <li key={c.id} className={`flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[13px] font-semibold ${no ? 'border-no/60 bg-[#F6E1D9] text-no' : 'border-line'}`}>
              {no ? <Icon name="x" size={13} /> : <Icon name="check" size={13} />}
              {c.name}
            </li>
          )
        })}
      </ul>
      {missing.length > 0 && <p className="mt-1.5 text-[13px] text-no">No tens: {missing.map((m) => m.name.toLowerCase()).join(', ')}. Demana-ho al professor abans d'aquest pas.</p>}
    </div>
  )
}

function Steps({ items }: { items: ReactNode[] }) {
  return (
    <ol className="space-y-2">
      {items.map((t, i) => (
        <li key={i} className="flex gap-3">
          <span className="font-hand mt-px grid h-6 w-6 shrink-0 place-items-center rounded-full border-[1.5px] border-ink text-[13px] font-bold">{i + 1}</span>
          <span>{t}</span>
        </li>
      ))}
    </ol>
  )
}

function Note({ tone, children }: { tone: 'warn' | 'info' | 'safe'; children: ReactNode }) {
  const cls = tone === 'warn' ? 'bg-[#F6E1D9]' : tone === 'safe' ? 'bg-accent-soft' : 'bg-paper'
  return <div className={`rounded-xl p-3 text-[13.5px] ${cls}`}>{children}</div>
}

function Cut({ lamp, piece, inv }: { lamp: LampManifest; piece: PieceSpec; inv: Inventory }) {
  const [l, a] = piece.cut
  if (piece.kind === 'pino') {
    return (
      <>
        <Needs lamp={lamp} ids={['liston', 'lapiz', 'serrucho', 'sargentos']} inv={inv} />
        <Steps
          items={[
            <>
              Marca {piece.qty > 1 ? `${piece.qty} trossos` : 'un tros'} de <b>{fmt(l)} mm</b> al llistó de pi de 15 × 15.
            </>,
            'Talla-ls amb el xerrac i la caixa de biaixos a 90°.',
            'Poleix les testes (els extrems) amb paper de vidre.',
            piece.cutTip ?? (piece.qty > 1 ? 'Comprova que tots fan el mateix.' : 'Comprova la llargada amb el regle.'),
          ]}
        />
        <Safety />
      </>
    )
  }
  return (
    <>
      <Needs lamp={lamp} ids={[piece.stock ?? 'contrachapado', 'calibre', 'lapiz', 'serrucho', 'sargentos']} inv={inv} />
      <Steps
        items={[
          <>
            Marca amb llapis una peça de <b>{fmt(l)} × {fmt(a)} mm</b> al tauler de {fmt(piece.t)} mm{piece.qty > 1 ? ` (${piece.qty} iguals)` : ''}.
          </>,
          <>Escriu el número {piece.ref} amb llapis a la cara interior.</>,
          <>
            Talla primer la tira a l'ample (<b>{fmt(a)} mm</b>) i després la peça a la llargada (<b>{fmt(l)} mm</b>).
          </>,
          <>Entre peça i peça deixa {fmt(lamp.hw.kerf)} mm: és el que s'emporta la serra.</>,
          ...(piece.qty > 1 ? ['Les peces iguals es poden tallar i polir juntes perquè quedin idèntiques.'] : []),
        ]}
      />
      <Note tone="info">Si el taller té làser o CNC, el fitxer «Tall del tauler» (pestanya Plànols) té totes les peces col·locades.</Note>
      <Safety />
    </>
  )
}

function Safety() {
  return (
    <Note tone="safe">
      <b>Seguretat.</b> Subjecta la peça al banc amb un serjant abans de tallar i no posis la mà davant de la serra. Fes servir ulleres de protecció.
    </Note>
  )
}

function Prepare({ lamp, piece, inv }: { lamp: LampManifest; piece: PieceSpec; inv: Inventory }) {
  const screwHoles = piece.holes.filter((h) => h.kind === 'tornillo')
  const shelf = piece.holes.find((h) => h.kind === 'portalamparas')
  const slot = piece.holes.find((h) => h.kind === 'ranura')
  const noScrews = inv.have.tornillos === false
  const needs = ['lija', ...(screwHoles.length ? ['taladro', 'punzon'] : []), ...(slot && lamp.catalog.some((c) => c.id === 'marqueteria') ? ['marqueteria'] : [])]
  const seen = screwHoles.filter((h) => h.face !== 'oculta').map((h) => h.id)
  const hidden = screwHoles.filter((h) => h.face === 'oculta').map((h) => h.id)
  const csk = `Ø${fmt(lamp.hw.cskD)}`
  const countersink = !screwHoles.some((h) => h.face)
    ? `per la cara exterior`
    : hidden.length === 0
      ? 'per la cara que veus a la fitxa'
      : seen.length === 0
        ? 'per la cara de darrere (la que no veus a la fitxa)'
        : `${seen.join(', ')} per la cara que veus; ${hidden.join(', ')} per la de darrere`
  return (
    <>
      <Needs lamp={lamp} ids={needs} inv={inv} />
      <Steps
        items={[
          piece.kind === 'pino' ? 'Poleix les testes i les arestes amb paper de vidre.' : 'Poleix cantells i cares amb paper de vidre de gra 120 i després 180.',
          ...(screwHoles.length
            ? [
                <>
                  Imprimeix la làmina d'aquesta peça al 100 % (pestanya Plànols), enganxa-la amb cinta i marca amb el punxó els centres {screwHoles.map((h) => h.id).join(', ')}.
                </>,
                <>
                  Trepa Ø{fmt(lamp.hw.screwD)} i avellana {csk} {countersink}. Posa-hi un tauler de sacrifici a sota.
                </>,
              ]
            : []),
          ...(shelf
            ? [
                shelf.d !== null ? (
                  <>
                    Forat {shelf.id} del portalàmpades: <b>Ø{fmt(shelf.d)} mm</b> (la posició és a Mesures). {shelf.note}
                  </>
                ) : inv.holder === 'E14' ? (
                  'Forat central del portalàmpades E14: mesura el diàmetre de la rosca i suma-hi 1 mm de joc. Confirma-ho amb el professor.'
                ) : (
                  'Forat central del portalàmpades: sense portalàmpades no se’n pot decidir la mida. Pregunta-ho al professor.'
                ),
              ]
            : []),
          ...(slot ? [<>Fes la ranura <b>R</b> de {slot.w} × {slot.h} mm al cantell inferior, per on sortirà el cable.</>] : []),
          ...(piece.kind === 'pino' ? [`Els forats guia de ${lamp.hw.pilot} es fan en muntar, a través del forat del panell.`] : []),
        ]}
      />
      {piece.notes && piece.notes.length > 0 && (
        <div>
          <div className="text-[13px] font-semibold text-ink-2">Notes de la làmina</div>
          <ul className="mt-1.5 space-y-1">
            {piece.notes.map((n) => (
              <li key={n} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ink-2" />
                {n}
              </li>
            ))}
          </ul>
        </div>
      )}
      {screwHoles.length > 0 && noScrews && inv.have.clavos && !lamp.assembly.find((s) => s.n === piece.step)?.screwsOnly && (
        <Note tone="warn">Aquests forats són per a cargols. Tu tens claus: pregunta al professor si cal fer-los.</Note>
      )}
      {(shelf || slot) && <Note tone="info">El forat del portalàmpades i la ranura del cable són de la proposta del kit elèctric: es confirmaran amb els components rebuts.</Note>}
      {piece.holes.length > 0 && (
        <Note tone="safe">
          <b>Seguretat.</b> Subjecta la peça amb un serjant per trepar, mai amb la mà.
        </Note>
      )}
    </>
  )
}

function Assemble({ lamp, piece, pieces, inv }: { lamp: LampManifest; piece: PieceSpec; pieces: PieceSpec[]; inv: Inventory }) {
  const step = lamp.assembly.find((s) => s.n === piece.step)!
  const placing = useApp((s) => s.placing)
  const setPlacing = useApp((s) => s.setPlacing)
  const select = useApp((s) => s.select)
  const hasScrews = inv.have.tornillos !== false
  const hasNails = inv.have.clavos === true
  const needs = [...(step.glue === false ? [] : ['cola']), ...(step.screws ? (hasScrews || step.screwsOnly ? ['tornillos', 'destornillador', 'taladro'] : ['clavos', 'martillo']) : []), ...(step.glue === false ? [] : ['sargentos']), ...(step.tools ?? [])]
  const others = step.pieces.filter((id) => id !== piece.id).map((id) => pieces.find((p) => p.id === id)!)
  const prev = lamp.assembly.find((s) => s.n === step.n - 1)
  const next = lamp.assembly.find((s) => s.n === step.n + 1)
  return (
    <>
      <div className="flex items-baseline gap-2">
        <span className="text-[13px] font-semibold text-ink-2">
          Pas {step.n} de {lamp.assembly.length}
        </span>
        <span className="font-bold">{step.title}</span>
      </div>
      <button className={`btn w-full ${placing ? 'btn-primary' : ''}`} aria-pressed={placing} onClick={() => setPlacing(!placing)}>
        <Icon name="arrow" size={18} />
        {placing ? 'Tornar a veure la peça' : 'Veure on encaixa'}
      </button>
      <Needs lamp={lamp} ids={needs} inv={inv} />
      <p>{step.text}</p>
      <Note tone="info">
        <b>Com s’uneix:</b> {step.union}
      </Note>
      {step.screwsOnly && (
        <Note tone="warn">
          {step.screwsOnly}
          {!hasScrews && ' No tens cargols: demana-los al professor.'}
        </Note>
      )}
      {step.screws && !step.screwsOnly && !hasScrews && hasNails && (
        <Note tone="warn">No tens cargols, però sí claus: clava a les mateixes posicions, sense avellanar, sobre el llistó. Confirma-ho abans amb el professor.</Note>
      )}
      {step.screws && !step.screwsOnly && !hasScrews && !hasNails && <Note tone="warn">No tens cargols ni claus: encara no pots fer aquest pas. Demana'ls al professor.</Note>}
      {others.length > 0 && (
        <div>
          <div className="text-[13px] font-semibold text-ink-2">En aquest pas també hi van</div>
          <ul className="mt-1.5 space-y-1">
            {others.map((o) => (
              <li key={o.id}>
                <button onClick={() => select(o.id)} className="flex items-center gap-2 rounded-lg px-1 py-0.5 hover:bg-paper">
                  <span className="font-hand grid h-6 w-6 place-items-center rounded-full border-[1.5px] border-ink text-[13px] font-bold">{o.ref}</span>
                  <span className="font-semibold">{o.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {(prev || next) && (
        <p className="text-[13px] text-ink-2">
          {prev && <>Abans: pas {prev.n}, {prev.title.toLowerCase()}. </>}
          {next && <>Després: pas {next.n}, {next.title.toLowerCase()}.</>}
        </p>
      )}
    </>
  )
}

/* ------------------------------- componentes y objetos del banco ------------------------------- */

function ComponentBody({ lamp, id, inv }: { lamp: LampManifest; id: string; inv: Inventory }) {
  const c = lamp.components.find((x) => x.id === id)!
  const have = id === 'portalamparas' ? (inv.holder && inv.holder !== 'ninguno' ? true : inv.holder ? false : undefined) : inv.have[id]
  return (
    <div className="space-y-4 text-[14.5px]">
      <InlinePhoto id={id} name={c.name} />
      <HaveBadge have={have} extra={id === 'portalamparas' && inv.holder && inv.holder !== 'ninguno' ? `(${inv.holder})` : ''} />
      <Section title="Què fa">{c.role}</Section>
      <Section title="On va">{c.where}</Section>
      <Section title="Com és">{c.spec}</Section>
      <Note tone="warn">
        <b>Seguretat.</b> El kit funciona a 230 V. El col·loca i el comprova personal qualificat abans d'endollar-lo. Tu no connectes ni manipules cables de xarxa.
      </Note>
      {c.provisional && <p className="text-[12.5px] text-ink-2">Forma i mesures provisionals: s'ajustaran quan es mesuri el component rebut.</p>}
    </div>
  )
}

function ItemBody({ lamp, id, inv, pieces }: { lamp: LampManifest; id: string; inv: Inventory; pieces: PieceSpec[] }) {
  const c = lamp.catalog.find((x) => x.id === id)!
  // en qué pasos de montaje se usa
  const usedIn = useMemo(() => {
    if (['cola', 'sargentos'].includes(id)) return 'Muntatge de gairebé totes les peces.'
    const stepsWith = (t: string) => lamp.assembly.filter((s) => s.tools?.includes(t)).map((s) => s.n)
    const list = (ns: (string | number)[]) => (ns.length > 1 ? `${ns.slice(0, -1).join(', ')} i ${ns[ns.length - 1]}` : String(ns[0] ?? ''))
    const refsOf = (f: (p: PieceSpec) => boolean) => [...new Set(pieces.filter(f).map((p) => p.ref))]
    if (id === 'escuadra') return `Muntatge, ${stepsWith('escuadra').length > 1 ? 'passos' : 'pas'} ${list(stepsWith('escuadra'))}: comprovar els 90°.`
    if (id === 'fieltros' || id === 'barniz') return stepsWith(id).length ? `Muntatge, pas ${list(stepsWith(id))}.` : 'Acabat.'
    if (id === 'marqueteria') return `Preparar la ranura del cable (peça ${list(refsOf((p) => p.holes.some((h) => h.kind === 'ranura')))}).`
    if (id === 'contrachapado5') return `Peça ${list(refsOf((p) => p.stock === 'contrachapado5'))}.`
    if (['tornillos', 'destornillador'].includes(id)) return `Muntatge, passos ${list(lamp.assembly.filter((s) => s.screws).map((s) => s.n))}.`
    if (['clavos', 'martillo'].includes(id)) return 'Muntatge, si no hi ha cargols (confirma-ho amb el professor).'
    if (['serrucho', 'lapiz', 'calibre'].includes(id)) return 'Tallar totes les peces.'
    if (['taladro', 'punzon'].includes(id)) return `Preparar les peces amb forats: ${list(refsOf((p) => p.holes.some((h) => h.kind === 'tornillo')))}.`
    if (id === 'contrachapado') return `Peces ${list(refsOf((p) => p.kind === 'contrachapado' && !p.stock))}.`
    if (id === 'liston') return `Peces ${list(refsOf((p) => p.kind === 'pino'))}.`
    if (id === 'lija') return 'Preparar totes les peces i acabat final (gra 240).'
    return ''
  }, [id, lamp, pieces])
  return (
    <div className="space-y-4 text-[14.5px]">
      <InlinePhoto id={id} name={c.name} />
      <HaveBadge have={inv.have[id]} />
      <Section title="Per a què serveix">{c.use}</Section>
      {usedIn && <Section title="Quan el fas servir">{usedIn}</Section>}
      <Section title="Detall">{c.detail}</Section>
      <p className="text-[12.5px] text-ink-2">
        Font: {c.source}
        {c.unverified ? ' · sense verificar al taller' : ''}
      </p>
    </div>
  )
}

function HaveBadge({ have, extra = '' }: { have: boolean | undefined; extra?: string }) {
  if (have === undefined) return null
  return (
    <div className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[13px] font-bold ${have ? 'bg-accent-soft text-accent' : 'bg-[#F6E1D9] text-no'}`}>
      <Icon name={have ? 'check' : 'x'} size={15} />
      {have ? `En tens ${extra}` : "No en tens: demana-ho al professor"}
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <div className="text-[13px] font-semibold text-ink-2">{title}</div>
      <p className="mt-0.5">{children}</p>
    </div>
  )
}

/* ------------------------------------ esquema y planos ------------------------------------ */

function Circuit({ lamp }: { lamp: LampManifest }) {
  const on = useApp((s) => s.switchOn)
  const setSwitch = useApp((s) => s.setSwitch)
  return (
    <div className="space-y-4">
      <div className="rounded-xl border-[1.5px] border-ink bg-paper/60 p-3">
        <Schematic />
      </div>
      <button onClick={() => setSwitch(!on)} className={`btn w-full ${on ? 'btn-primary' : ''}`} aria-pressed={on}>
        <Icon name="bolt" size={18} />
        {on ? 'Obrir el circuit' : 'Tancar el circuit'}
      </button>
      <p className="text-[14px]">
        La làmpada s'endolla a la xarxa de <b>{lamp.electric.voltage}</b>. El corrent surt per la clavilla, recorre el cable i passa per l'<b>interruptor de pas</b>. Si està
        tancat, el corrent arriba a la bombeta i torna: el circuit és complet i la bombeta fa llum.
      </p>
      <Note tone="warn">
        <b>Seguretat.</b> 230 V és perillós. El kit ve muntat de fàbrica; el col·loca i el comprova abans d'endollar-lo personal qualificat. L'alumnat no connecta
        ni manipula cables de xarxa.
      </Note>
      <p className="text-[12.5px] text-ink-2">{lamp.electric.source}</p>
    </div>
  )
}

function Documents({ lamp }: { lamp: LampManifest }) {
  return (
    <div className="space-y-5">
      <ul className="space-y-1.5">
        {lamp.documents.map((d) => (
          <li key={d.file}>
            <a href={d.file} target="_blank" rel="noreferrer" download={d.kind === 'dxf' ? true : undefined} className="flex gap-3 rounded-xl px-2 py-2 hover:bg-paper">
              <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg border-[1.5px] border-ink text-[10px] font-bold uppercase">{d.kind}</span>
              <span>
                <span className="block font-semibold">{d.label}</span>
                <span className="block text-[13px] text-ink-2">{d.description}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
      <Note tone="info">Els plànols en PDF i DXF estan dibuixats amb tauler de {lamp.validatedBoard} mm. Si el teu tauler fa una altra mida, fes servir les mesures que et dona cada peça a l'app.</Note>
      <div>
        <div className="text-[13px] font-semibold text-ink-2">Avisos</div>
        <ul className="mt-2 space-y-1.5 text-[14px]">
          {lamp.notes.map((n) => (
            <li key={n} className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ink-2" />
              {n}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
