import { PerformanceMonitor, useProgress } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Component, Suspense, useEffect, useState, type ReactNode } from 'react'
import * as THREE from 'three'
import type { LampManifest } from '../content/types'
import { useApp } from '../state/store'
import { camApi, HOME_VIEW } from '../three/fx'
import { Workshop } from '../three/Workshop'
import { ScreenOverlay, ScreenSync } from '../three/ScreenHtml'
import { Icon } from './Icon'

function hasWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

class SceneBoundary extends Component<{ children: ReactNode; onRetry: () => void }, { error: Error | null }> {
  state = { error: null as Error | null }
  static getDerivedStateFromError(error: Error) {
    return { error }
  }
  render() {
    if (this.state.error)
      return (
        <div className="absolute inset-0 grid place-items-center p-6">
          <div className="raised max-w-sm rounded-2xl p-5 text-center">
            <div className="text-[17px] font-bold">No s'ha pogut carregar l'escena 3D</div>
            <p className="mt-2 text-[14px] text-ink-2">Pot ser un problema de connexió. Comprova la xarxa i torna-ho a provar.</p>
            <p className="mt-2 font-mono text-[11px] text-ink-2/70">{this.state.error.message.slice(0, 120)}</p>
            <button
              className="btn btn-primary mt-4"
              onClick={() => {
                this.setState({ error: null })
                this.props.onRetry()
              }}
            >
              <Icon name="restart" size={18} /> Torna-ho a provar
            </button>
          </div>
        </div>
      )
    return this.props.children
  }
}

function Loader() {
  const { active, progress } = useProgress()
  const [shown, setShown] = useState(true)
  useEffect(() => {
    // sin nada que descargar (geometría calculada en la app) también se oculta
    if (!active) {
      const t = setTimeout(() => setShown(false), 400)
      return () => clearTimeout(t)
    }
    setShown(true)
  }, [active, progress])
  if (!shown) return null
  return (
    <div className={`stage absolute inset-0 z-20 grid place-items-center transition-opacity duration-300 ${!active ? 'opacity-0' : ''}`} role="status">
      <div className="text-center">
        <svg className="loader-lamp mx-auto" width="64" height="76" viewBox="0 0 64 76" fill="none" stroke="#2A2016" strokeWidth="2.5" aria-hidden>
          <rect x="4" y="4" width="56" height="68" rx="2" />
          <path d="M12 12h40v34H12zM4 54h56" />
          <path d="M32 18a10 10 0 1 0 0.1 0z" stroke="#B98A1C" />
        </svg>
        <div className="font-hand mt-3 text-[18px]">Preparant el banc de treball…</div>
        {active && <div className="mt-1 text-[13px] text-ink-2 tabular-nums">{Math.round(progress)} %</div>}
      </div>
    </div>
  )
}

export function SceneStage({ lamp }: { lamp: LampManifest }) {
  const [dpr, setDpr] = useState(1.5)
  const [key, setKey] = useState(0)
  const [webgl] = useState(hasWebGL)
  const panelOpen = useApp((s) => s.panelOpen)
  const togglePanel = useApp((s) => s.togglePanel)

  if (!webgl)
    return (
      <div className="stage grid h-full place-items-center p-6">
        <div className="raised max-w-sm rounded-2xl p-5 text-center">
          <div className="text-[17px] font-bold">Aquest navegador no pot mostrar 3D</div>
          <p className="mt-2 text-[14px] text-ink-2">Obre Làmpares 101 amb Google Chrome actualitzat i comprova que l'acceleració per maquinari està activada.</p>
        </div>
      </div>
    )

  return (
    <div className="stage relative h-full overflow-hidden">
      <SceneBoundary onRetry={() => setKey((k) => k + 1)}>
        <Canvas
          key={key}
          shadows={{ type: THREE.PCFSoftShadowMap }}
          dpr={[1, dpr]}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          camera={{ fov: 40, near: 0.02, far: 20, position: [HOME_VIEW.px, HOME_VIEW.py, HOME_VIEW.pz] }}
          aria-label="Escena 3D del banc de treball amb la làmpada"
        >
          <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(1.5)} />
          <ScreenSync />
          <Suspense fallback={null}>
            <Workshop lamp={lamp} />
          </Suspense>
        </Canvas>
        <ScreenOverlay />
      </SceneBoundary>
      <Loader />
      <Breadcrumb />
      <CameraBar />
      {!panelOpen && (
        <button onClick={togglePanel} className="btn absolute top-4 right-4 z-10" aria-label="Mostrar l'explicació">
          <Icon name="panel" size={18} />
          Explicació
        </button>
      )}
    </div>
  )
}

function Breadcrumb() {
  const selected = useApp((s) => s.selected)
  return (
    <div className="pointer-events-none absolute top-4 left-5 z-10">
      <div className="font-hand text-[19px] leading-none text-ink-2">{selected ? "Toca una altra peça o el fons per tornar" : 'Toca una peça per veure com es fa'}</div>
    </div>
  )
}

function CameraBar() {
  const labels = useApp((s) => s.labels)
  const setLabels = useApp((s) => s.setLabels)
  const exploded = useApp((s) => s.exploded)
  const setExploded = useApp((s) => s.setExploded)
  const dims = useApp((s) => s.dims)
  const setDims = useApp((s) => s.setDims)
  const view = useApp((s) => s.view)
  const flyTo = useApp((s) => s.flyTo)
  const selected = useApp((s) => s.selected)
  const c = () => camApi.controls

  const resetView = () => flyTo('home')

  return (
    <div className="raised absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-0.5 rounded-2xl p-1" role="toolbar" aria-label="Càmera">
      <button className="tool-btn" onClick={() => c()?.rotate(-Math.PI / 6, 0, true)} aria-label="Girar a l'esquerra" title="Girar a l'esquerra">
        <Icon name="rotL" />
      </button>
      <button className="tool-btn" onClick={() => c()?.rotate(Math.PI / 6, 0, true)} aria-label="Girar a la dreta" title="Girar a la dreta">
        <Icon name="rotR" />
      </button>
      <button className="tool-btn" onClick={() => c()?.dolly(0.18, true)} aria-label="Apropar" title="Apropar">
        <Icon name="plus" />
      </button>
      <button className="tool-btn" onClick={() => c()?.dolly(-0.18, true)} aria-label="Allunyar" title="Allunyar">
        <Icon name="minus" />
      </button>
      <button className="tool-btn" onClick={resetView} aria-label="Reiniciar la càmera" title="Reiniciar la càmera">
        <Icon name="target" />
      </button>
      <span className="mx-1 h-6 w-px bg-line" />
      <button className="tool-btn" aria-pressed={labels} onClick={() => setLabels(!labels)} aria-label="Mostrar els noms" title="Mostrar els noms">
        <Icon name="tag" />
      </button>
      <button className="tool-btn" aria-pressed={dims} onClick={() => setDims(!dims)} aria-label="Mostrar les mesures" title="Mostrar les mesures">
        <Icon name="ruler" />
      </button>
      <button className="tool-btn" disabled={!!selected} aria-pressed={exploded} onClick={() => setExploded(!exploded)} aria-label="Separar les peces" title="Separar les peces">
        <Icon name="explode" />
      </button>
      <button className="tool-btn" disabled={!!selected} aria-pressed={view === 'back'} onClick={() => flyTo(view === 'back' ? 'home' : 'back')} aria-label="Veure la part del darrere" title="Veure la part del darrere">
        <Icon name="turn" />
      </button>
    </div>
  )
}
