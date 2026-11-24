import { useMemo } from 'react'
import { lampList, lamps } from '../content'
import type { LampManifest } from '../content/types'
import { useApp } from '../state/store'
import { Icon } from './Icon'

/** Índice de la lámpara: otra forma de llegar a cada pieza, además de hacer clic en 3D. */
export function Sidebar({ lamp }: { lamp: LampManifest }) {
  const inv = useApp((s) => s.inventory)
  const selected = useApp((s) => s.selected)
  const select = useApp((s) => s.select)
  const openInventory = useApp((s) => s.openInventory)
  const setLamp = useApp((s) => s.setLamp)
  // canviar de làmpada: si té material que encara no has revisat, et pregunta només això
  const switchLamp = (id: string) => {
    if (id === lamp.id) return
    setLamp(id)
    const st = useApp.getState()
    const unanswered = lamps[id].catalog.some((c) => c.id !== 'portalamparas' && st.inventory.have[c.id] === undefined)
    // s'obre després que l'escena hagi canviat de làmpada (dos canvis grans en un sol render fan fallar les etiquetes 3D)
    if (st.inventory.T !== null && unanswered) setTimeout(() => openInventory(true), 50)
  }
  const T = inv.T ?? lamp.validatedBoard
  const pieces = useMemo(() => lamp.build(T, inv.holder), [lamp, T, inv.holder])
  const refs = useMemo(() => {
    const m = new Map<string, { ids: string[]; name: string }>()
    for (const p of pieces) {
      const e = m.get(p.ref)
      if (e) e.ids.push(p.id)
      else m.set(p.ref, { ids: [p.id], name: p.name.replace(/ (esquerre|dret|davanter esq\.|esq\.)$/i, '') })
    }
    return [...m.entries()]
  }, [pieces])
  const missing = lamp.catalog.filter((c) => inv.have[c.id] === false)

  return (
    <nav aria-label="Índex de la làmpada" className="flex h-full flex-col border-r-[1.5px] border-ink/80 bg-card">
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center gap-2.5">
          <LampMark />
          <div className="wide text-[21px] leading-none font-extrabold tracking-tight">Làmpares 101</div>
        </div>
      </div>

      <div className="mx-3 mb-3" role="group" aria-label="Quina làmpada">
        <div className="flex gap-1.5">
          {lampList.map((m) =>
            m.ready ? (
              <button
                key={m.id}
                onClick={() => switchLamp(m.id)}
                aria-pressed={m.id === lamp.id}
                title={lamps[m.id]?.tagline}
                className={`flex-1 rounded-lg border-[1.5px] px-2 py-1.5 text-[13.5px] font-bold ${m.id === lamp.id ? 'border-ink bg-ink text-card' : 'border-ink hover:bg-paper'}`}
              >
                {m.name.replace('Làmpada ', 'L')}
              </button>
            ) : (
              <span key={m.id} title="S'afegirà més endavant" className="flex-1 rounded-lg border border-dashed border-line px-2 py-1.5 text-center text-[13.5px] font-semibold text-ink-2/60">
                {m.name.replace('Làmpada ', 'L')}
              </span>
            ),
          )}
        </div>
        <div className="mt-1 px-0.5 text-[12.5px] leading-tight text-ink-2">{lamp.tagline}</div>
      </div>

      <button onClick={() => openInventory(true)} className="mx-3 rounded-xl border-[1.5px] border-ink bg-paper/50 px-3 py-2.5 text-left hover:bg-paper" aria-label="Revisar el meu material">
        <span className="flex items-center justify-between text-[12.5px] font-semibold text-ink-2">
          El meu material <span className="text-ink underline decoration-line underline-offset-2">canviar</span>
        </span>
        <span className="mt-0.5 block text-[14.5px] font-bold">Tauler de {inv.T === null ? '—' : String(inv.T).replace('.', ',')} mm</span>
        <span className={`block text-[12.5px] ${inv.T === null ? 'text-ink-2' : missing.length ? 'text-no' : 'text-accent'}`}>{inv.T === null ? 'Sense revisar' : missing.length ? `Et falten ${missing.length} coses` : 'Ho tens tot'}</span>
      </button>

      <div className="scroll-thin mt-3 min-h-0 flex-1 overflow-y-auto px-3 pb-3">
        <Group title="Peces de fusta">
          {refs.map(([ref, { ids, name }]) => {
            const active = selected !== null && ids.includes(selected)
            return (
              <li key={ref}>
                <button onClick={() => select(active ? null : ids[0])} aria-current={active ? 'true' : undefined} className={`flex w-full items-center gap-3 rounded-xl px-2.5 py-1.5 text-left ${active ? 'bg-accent-soft' : 'hover:bg-paper'}`}>
                  <span className={`font-hand grid h-6 w-6 shrink-0 place-items-center rounded-full text-[13px] font-bold ${active ? 'bg-accent text-white' : 'border-[1.5px] border-ink'}`}>{ref}</span>
                  <span className="min-w-0 flex-1 text-[14px] leading-tight font-semibold">{name}</span>
                  {ids.length > 1 && <span className="text-[12px] text-ink-2">×{ids.length}</span>}
                </button>
              </li>
            )
          })}
        </Group>
        <Group title="Part elèctrica">
          {lamp.components.map((c) => (
            <li key={c.id}>
              <button onClick={() => select(selected === c.id ? null : c.id)} className={`flex w-full items-center gap-3 rounded-xl px-2.5 py-1.5 text-left ${selected === c.id ? 'bg-accent-soft' : 'hover:bg-paper'}`}>
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-glow/70">
                  <Icon name="bolt" size={14} />
                </span>
                <span className="text-[14px] leading-tight font-semibold">{c.name}</span>
              </button>
            </li>
          ))}
        </Group>
        <Group title="Al banc">
          {lamp.catalog
            .filter((c) => c.zone !== 'kit')
            .map((c) => {
              const id = `item:${c.id}`
              return (
                <li key={c.id}>
                  <button onClick={() => select(selected === id ? null : id)} className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1 text-left text-[13.5px] ${selected === id ? 'bg-accent-soft font-semibold' : 'hover:bg-paper'}`}>
                    <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${inv.have[c.id] === false ? 'bg-no' : c.category === 'herramienta' ? 'bg-accent' : 'bg-ink-2'}`} />
                    <span className={inv.have[c.id] === false ? 'text-ink-2 line-through decoration-no/60' : ''}>{c.name}</span>
                  </button>
                </li>
              )
            })}
        </Group>
      </div>

    </nav>
  )
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-3">
      <h3 className="px-2.5 pb-1 text-[12.5px] font-semibold text-ink-2">{title}</h3>
      <ul className="space-y-0.5">{children}</ul>
    </section>
  )
}

function LampMark() {
  return (
    <svg width="30" height="34" viewBox="0 0 30 34" aria-hidden>
      <rect x="2" y="2" width="26" height="30" rx="1.5" fill="#D9A574" stroke="#2A2016" strokeWidth="2" />
      <rect x="6.5" y="6" width="17" height="15" fill="#F8F2E4" stroke="#2A2016" strokeWidth="1.5" />
      <circle cx="15" cy="13" r="4.6" fill="#FFC94D" stroke="#2A2016" strokeWidth="1.5" />
      <path d="M2 24h26M2 27h26M2 30h26" stroke="#B97F4E" strokeWidth="1" />
    </svg>
  )
}
