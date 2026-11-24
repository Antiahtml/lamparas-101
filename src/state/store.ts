import { create } from 'zustand'
import type { Holder } from '../content/model'

export type PanelTab = 'lampara' | 'esquema' | 'documentos'
export type SheetTab = 'medidas' | 'cortar' | 'preparar' | 'montar'

/** Lo que el alumno dice que tiene. No se guarda: se pregunta al entrar. */
export interface Inventory {
  /** grosor real del tablero medido por el alumno (mm) */
  T: number | null
  /** id del catálogo -> lo tiene / no lo tiene */
  have: Record<string, boolean>
  holder?: Holder
}

interface AppState {
  lampId: string
  inventory: Inventory
  inventoryOpen: boolean
  panelOpen: boolean
  panelTab: PanelTab
  sheetTab: SheetTab
  switchOn: boolean
  exploded: boolean
  labels: boolean
  dims: boolean
  /** pieza ('lateral-izq'), componente ('bombilla') u objeto del banco ('item:taladro') */
  selected: string | null
  hovered: string | null
  /** la pieza seleccionada vuelve a su sitio para enseñar dónde encaja */
  placing: boolean
  view: string
  viewTick: number

  setLamp: (id: string) => void
  setInventory: (i: Inventory) => void
  openInventory: (v: boolean) => void
  togglePanel: () => void
  setPanelTab: (t: PanelTab) => void
  setSheetTab: (t: SheetTab) => void
  setSwitch: (on: boolean) => void
  setExploded: (v: boolean) => void
  setLabels: (v: boolean) => void
  setDims: (v: boolean) => void
  select: (id: string | null) => void
  hover: (id: string | null) => void
  setPlacing: (v: boolean) => void
  flyTo: (view: string) => void
}

export const useApp = create<AppState>((set) => ({
  lampId: 'lampara_01',
  inventory: { T: null, have: {} },
  inventoryOpen: true,
  panelOpen: true,
  panelTab: 'lampara',
  sheetTab: 'medidas',
  switchOn: false,
  exploded: false,
  labels: false,
  dims: false,
  selected: null,
  hovered: null,
  placing: false,
  view: 'home',
  viewTick: 0,

  setLamp: (lampId) =>
    set((s) => ({ lampId, selected: null, hovered: null, placing: false, exploded: false, panelTab: 'lampara', sheetTab: 'medidas', view: 'home', viewTick: s.viewTick + 1 })),
  setInventory: (inventory) => set({ inventory }),
  openInventory: (inventoryOpen) => set({ inventoryOpen }),
  togglePanel: () => set((s) => ({ panelOpen: !s.panelOpen })),
  setPanelTab: (panelTab) => set({ panelTab, panelOpen: true }),
  setSheetTab: (sheetTab) => set({ sheetTab, placing: false }),
  setSwitch: (switchOn) => set({ switchOn }),
  setExploded: (exploded) => set({ exploded }),
  setLabels: (labels) => set({ labels }),
  setDims: (dims) => set({ dims }),
  select: (selected) => set((s) => ({ selected, placing: false, panelOpen: selected ? true : s.panelOpen })),
  hover: (hovered) => set({ hovered }),
  setPlacing: (placing) => set({ placing }),
  flyTo: (view) => set((s) => ({ view, viewTick: s.viewTick + 1 })),
}))
