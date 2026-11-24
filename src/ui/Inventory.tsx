import { useState } from 'react'
import type { Holder } from '../content/model'
import type { CatalogItem, LampManifest } from '../content/types'
import { useApp, type Inventory as Inv } from '../state/store'
import { Icon } from './Icon'
import { PhotoHint } from './PhotoHint'

const GROUPS: { id: CatalogItem['group']; title: string }[] = [
  { id: 'madera', title: 'Fusta' },
  { id: 'union', title: 'Per unir' },
  { id: 'acabado', title: 'Acabat' },
  { id: 'kit', title: 'Kit elèctric' },
  { id: 'herramienta', title: 'Eines' },
]

/**
 * Antes de explorar, el alumno mide su tablero y revisa qué material tiene.
 * Nada se guarda: al recargar la página se vuelve a preguntar.
 */
export function Inventory({ lamp }: { lamp: LampManifest }) {
  const current = useApp((s) => s.inventory)
  const setInventory = useApp((s) => s.setInventory)
  const openInventory = useApp((s) => s.openInventory)
  const [T, setT] = useState(current.T === null ? '' : String(current.T).replace('.', ','))
  const [have, setHave] = useState<Record<string, boolean>>(current.have)
  const [holder, setHolder] = useState<Holder | undefined>(current.holder)
  const [step, setStep] = useState(current.T === null ? 0 : 1)

  const tNum = Number(T.replace(',', '.'))
  const tValid = T.trim() !== '' && Number.isFinite(tNum) && tNum >= 2 && tNum <= 25
  const items = lamp.catalog.filter((c) => c.id !== 'portalamparas')
  const pending = items.filter((c) => have[c.id] === undefined).length + (holder ? 0 : 1)
  const canClose = current.T !== null

  const finish = () => {
    const inv: Inv = { T: Math.round(tNum * 10) / 10, have: { ...have, portalamparas: holder !== undefined && holder !== 'ninguno' }, holder }
    setInventory(inv)
    openInventory(false)
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/35 p-4" role="dialog" aria-modal="true" aria-labelledby="inv-title">
      <div className="raised flex max-h-[calc(100vh-32px)] w-[min(640px,100%)] flex-col rounded-2xl">
        <header className="flex items-start gap-3 border-b border-line px-6 pt-5 pb-4">
          <div className="flex-1">
            <div className="text-[13px] font-semibold text-ink-2">Abans de començar · {step === 0 ? '1 de 2' : '2 de 2'}</div>
            <h2 id="inv-title" className="wide mt-0.5 text-[24px] leading-tight font-extrabold">
              {step === 0 ? 'Quin gruix té el teu tauler?' : 'Quin material tens?'}
            </h2>
          </div>
          {canClose && (
            <button className="tool-btn -mr-2" onClick={() => openInventory(false)} aria-label="Tancar sense canviar">
              <Icon name="x" />
            </button>
          )}
        </header>

        {step === 0 && (
          <div className="space-y-4 px-6 py-5">
            <p className="text-[15px]">
              Agafa el tauler de contraxapat que faràs servir i mesura'n el gruix amb el <b>peu de rei</b>, en diversos punts de la vora. Amb aquesta dada es calculen les mesures de totes les teves peces.
            </p>
            <label className="block">
              <span className="text-[14px] font-semibold">Gruix mesurat</span>
              <div className="mt-1.5 flex items-center gap-2">
                <input
                  autoFocus
                  inputMode="decimal"
                  value={T}
                  onChange={(e) => setT(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && tValid && setStep(1)}
                  placeholder="per exemple, 9,5"
                  className="w-40 rounded-xl border-[1.5px] border-ink bg-card px-3 py-2.5 text-[20px] font-semibold tabular-nums outline-none focus:border-cota"
                  aria-describedby="t-help"
                />
                <span className="text-[17px] font-semibold">mm</span>
              </div>
              <span id="t-help" className="mt-1.5 block text-[13px] text-ink-2">
                {T.trim() !== '' && !tValid ? 'Escriu un nombre entre 2 i 25 mm.' : "Un tauler «de 10» pot fer 9,5. Escriu el que mesures, no el que diu l'etiqueta."}
              </span>
            </label>
            {tValid && tNum !== lamp.validatedBoard && (
              <div className="rounded-xl bg-[#F6E1D9] p-3 text-[13.5px]">
                Els plànols es van comprovar amb {lamp.validatedBoard} mm. Amb {String(tNum).replace('.', ',')} mm les mesures es tornen a calcular amb les mateixes fórmules, però ensenya-les al professor abans de tallar.
              </div>
            )}
          </div>
        )}

        {step === 1 && (
          <div className="scroll-thin flex-1 space-y-5 overflow-y-auto px-6 py-5">
            <p className="text-[15px]">Revisa la teva taula i l'armari del taller. Marca el que tens de veritat: la làmpada t'avisarà del que et falta a cada pas. Si no saps què és alguna cosa, toca el botó <b className="text-cota">?</b> i en veuràs una foto.</p>
            {GROUPS.map((g) => (
              <section key={g.id}>
                <h3 className="text-[13px] font-semibold text-ink-2">{g.title}</h3>
                <ul className="mt-1.5 divide-y divide-line rounded-xl border border-line">
                  {g.id === 'kit' && (
                    <li className="flex flex-wrap items-center gap-2 px-3 py-2">
                      <span className="min-w-0 flex-1">
                        <span className="block text-[14.5px] font-semibold">Portalàmpades</span>
                        <span className="block text-[12.5px] text-ink-2">Mira la rosca: E27 és la grossa, E14 la petita.</span>
                      </span>
                      <PhotoHint id="portalamparas" name="Portalàmpades" text="Subjecta la bombeta. Fixa't en la mida de la rosca." />
                      <Choice value={holder} options={[['E27', 'E27'], ['E14', 'E14'], ['ninguno', 'No en tinc']]} onChange={(v) => setHolder(v as Holder)} label="Portalàmpades" />
                    </li>
                  )}
                  {items
                    .filter((c) => c.group === g.id)
                    .map((c) => (
                      <li key={c.id} className="flex flex-wrap items-center gap-2 px-3 py-2">
                        <span className="min-w-0 flex-1">
                          <span className="block text-[14.5px] font-semibold">{c.name}</span>
                          <span className="block text-[12.5px] text-ink-2">{c.use}</span>
                        </span>
                        <PhotoHint id={c.id} name={c.name} text={c.use} />
                        <Choice
                          value={have[c.id] === undefined ? undefined : have[c.id] ? 'si' : 'no'}
                          options={[
                            ['si', 'En tinc'],
                            ['no', 'No'],
                          ]}
                          onChange={(v) => setHave((h) => ({ ...h, [c.id]: v === 'si' }))}
                          label={c.name}
                        />
                      </li>
                    ))}
                </ul>
              </section>
            ))}
          </div>
        )}

        <footer className="flex items-center gap-3 border-t border-line px-6 py-4">
          {step === 1 && (
            <button className="btn btn-quiet" onClick={() => setStep(0)}>
              ← Gruix
            </button>
          )}
          <span className="flex-1 text-[13px] text-ink-2">{step === 1 && pending > 0 ? `Et falten ${pending} per respondre` : ''}</span>
          {step === 0 ? (
            <button className="btn btn-primary" disabled={!tValid} onClick={() => setStep(1)} style={{ opacity: tValid ? 1 : 0.5 }}>
              Següent
              <Icon name="arrow" size={18} />
            </button>
          ) : (
            <button className="btn btn-primary" disabled={pending > 0} onClick={finish} style={{ opacity: pending > 0 ? 0.5 : 1 }}>
              Explorar la meva làmpada
              <Icon name="arrow" size={18} />
            </button>
          )}
        </footer>
      </div>
    </div>
  )
}

function Choice({ value, options, onChange, label }: { value: string | undefined; options: [string, string][]; onChange: (v: string) => void; label: string }) {
  return (
    <div className="flex rounded-lg border-[1.5px] border-ink p-0.5" role="radiogroup" aria-label={label}>
      {options.map(([v, text]) => (
        <button
          key={v}
          role="radio"
          aria-checked={value === v}
          onClick={() => onChange(v)}
          className={`rounded-md px-2.5 py-1 text-[13px] font-semibold ${value === v ? (v === 'no' || v === 'ninguno' ? 'bg-no text-white' : 'bg-ink text-card') : 'hover:bg-paper'}`}
        >
          {text}
        </button>
      ))}
    </div>
  )
}
