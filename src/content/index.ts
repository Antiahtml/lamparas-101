import { lampara01 } from './lamps/lampara_01'
import { lampara02 } from './lamps/lampara_02'
import type { LampManifest } from './types'

/** Registro de lámparas. Para añadir otra: su *.model.ts, su manifiesto y una línea aquí. */
export const lamps: Record<string, LampManifest> = {
  [lampara01.id]: lampara01,
  [lampara02.id]: lampara02,
}
export const lampList = [
  { id: 'lampara_01', name: 'Làmpada 01', ready: true },
  { id: 'lampara_02', name: 'Làmpada 02', ready: true },
  { id: 'lampara_03', name: 'Làmpada 03', ready: false },
]
