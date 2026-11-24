import { useEffect, useRef, useState } from 'react'
import photos from '../content/photos.json'

/** Fotos reals de Wikimedia Commons (llicències lliures). Crèdits a content/photos.json */
type Photo = { file: string; title: string; author: string; license: string; source: string }
const PHOTOS = photos as Record<string, Photo>

/** Fotos d'un objecte del catàleg. El portalàmpades en té dues (E27 i E14). */
export function photosFor(id: string): { label?: string; photo: Photo }[] {
  if (id === 'portalamparas')
    return [
      { label: 'Rosca E27 (la grossa)', photo: PHOTOS['portalamparas-E27'] },
      { label: 'Rosca E14 (la petita)', photo: PHOTOS['portalamparas-E14'] },
    ].filter((p) => p.photo)
  return PHOTOS[id] ? [{ photo: PHOTOS[id] }] : []
}

/** Foto petita dins d'una fitxa, amb el crèdit. */
export function InlinePhoto({ id, name }: { id: string; name: string }) {
  const list = photosFor(id)
  if (!list.length) return null
  return (
    <div className={`grid gap-2 ${list.length > 1 ? 'grid-cols-2' : ''}`}>
      {list.map(({ label, photo }) => (
        <figure key={photo.file} className="m-0">
          <img src={photo.file} alt={label ?? name} className="h-36 w-full rounded-xl border border-line bg-white object-contain" loading="lazy" />
          <figcaption className="mt-1 text-[11px] leading-snug text-ink-2">
            {label && <b className="block text-[12px] text-ink">{label}</b>}
            Foto: {photo.author || 'autor desconegut'} · {photo.license} ·{' '}
            <a href={photo.source} target="_blank" rel="noreferrer" className="underline">
              Commons
            </a>
          </figcaption>
        </figure>
      ))}
    </div>
  )
}

/** Botó de pista: obre una finestra amb la foto de l'objecte. */
export function PhotoHint({ id, name, text }: { id: string; name: string; text?: string }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="grid h-8 w-8 shrink-0 place-items-center rounded-full border-[1.5px] border-cota bg-card font-bold text-cota hover:bg-cota hover:text-white"
        aria-label={`Pista: com és ${name.toLowerCase()}`}
        title="Pista: mira'n una foto"
      >
        ?
      </button>
      {open && <PhotoDialog id={id} name={name} text={text} onClose={() => setOpen(false)} />}
    </>
  )
}

function PhotoDialog({ id, name, text, onClose }: { id: string; name: string; text?: string; onClose: () => void }) {
  const list = photosFor(id)
  const close = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    close.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-ink/45 p-4" role="dialog" aria-modal="true" aria-label={`Foto: ${name}`} onClick={onClose}>
      <div className="raised w-[min(520px,100%)] rounded-2xl p-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start gap-3">
          <h3 className="wide flex-1 text-[20px] leading-tight font-extrabold">{name}</h3>
          <button ref={close} className="tool-btn -mt-1 -mr-1" onClick={onClose} aria-label="Tancar">
            ✕
          </button>
        </div>
        {text && <p className="mt-1 text-[14.5px]">{text}</p>}
        {list.length === 0 ? (
          <p className="mt-3 rounded-xl bg-paper p-4 text-[14px] text-ink-2">Encara no tenim cap foto d'aquest objecte. Pregunta-ho al professor o busca'l al taller.</p>
        ) : (
          <div className={`mt-3 grid gap-3 ${list.length > 1 ? 'grid-cols-2' : ''}`}>
            {list.map(({ label, photo }) => (
              <figure key={photo.file} className="m-0">
                <img src={photo.file} alt={label ?? name} className="h-56 w-full rounded-xl border border-line bg-white object-contain" loading="lazy" />
                <figcaption className="mt-1.5 text-[11.5px] leading-snug text-ink-2">
                  {label && <b className="block text-[13px] text-ink">{label}</b>}
                  Foto: {photo.author || 'autor desconegut'} · {photo.license} ·{' '}
                  <a href={photo.source} target="_blank" rel="noreferrer" className="underline">
                    Wikimedia Commons
                  </a>
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
