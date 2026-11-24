import * as THREE from 'three'

// Paleta del taller. Las mismas tonalidades se usan en CSS (index.css).
export const C = {
  ink: '#2A2016',
  ply: '#D9A574',
  plyEdge: '#B97F4E',
  pine: '#EFD29C',
  bench: '#B8875A',
  benchTop: '#CFA272',
  benchDark: '#8E6340',
  wall: '#E6D9BC',
  peg: '#D8C7A2',
  metal: '#A9B1B5',
  steel: '#6E7A80',
  accent: '#2F6B4F',
  cota: '#2D5B8A',
  glow: '#FFC94D',
  red: '#C0533A',
  rubber: '#3B3631',
  white: '#F6F0E2',
}

// rampa de 3 tonos: aspecto ilustrado con un solo mapa compartido
const ramp = new Uint8Array([120, 190, 255])
export const toonRamp = new THREE.DataTexture(ramp, ramp.length, 1, THREE.RedFormat)
toonRamp.minFilter = THREE.NearestFilter
toonRamp.magFilter = THREE.NearestFilter
toonRamp.generateMipmaps = false
toonRamp.needsUpdate = true

const cache = new Map<string, THREE.MeshToonMaterial>()
/** Material toon compartido por color (no tocar: es compartido). */
export function toon(color: string) {
  let m = cache.get(color)
  if (!m) {
    m = new THREE.MeshToonMaterial({ color, gradientMap: toonRamp })
    cache.set(color, m)
  }
  return m
}
