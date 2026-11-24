import { Edges, Outlines, RoundedBox } from '@react-three/drei'
import type { ReactNode } from 'react'
import { C, toon } from '../materials'

// Materiales y herramientas ILUSTRATIVOS (sin medidas de fabricación). Todos se apoyan en y = 0.

const Ink = ({ t = 20 }: { t?: number }) => <Edges threshold={t} color={C.ink} lineWidth={1.2} />
const Line = ({ thick = 0.0012 }: { thick?: number }) => <Outlines thickness={thick} color={C.ink} />

function Box({ size, pos, color, rot }: { size: [number, number, number]; pos: [number, number, number]; color: string; rot?: [number, number, number] }) {
  return (
    <mesh position={pos} rotation={rot} material={toon(color)} castShadow receiveShadow>
      <boxGeometry args={size} />
      <Ink />
    </mesh>
  )
}

function Cyl({ r, h, pos, color, rot, r2, seg = 20 }: { r: number; h: number; pos: [number, number, number]; color: string; rot?: [number, number, number]; r2?: number; seg?: number }) {
  return (
    <mesh position={pos} rotation={rot} material={toon(color)} castShadow>
      <cylinderGeometry args={[r, r2 ?? r, h, seg]} />
      <Line />
    </mesh>
  )
}

export const Plywood = () => (
  <group>
    <Box size={[0.4, 0.01, 0.24]} pos={[0, 0.005, 0]} color={C.ply} />
    {/* capas del canto */}
    {[0.0025, 0.0055, 0.0085].map((y) => (
      <mesh key={y} position={[0, y, 0.1202]}>
        <boxGeometry args={[0.4, 0.0008, 0.0006]} />
        <meshBasicMaterial color={C.plyEdge} />
      </mesh>
    ))}
  </group>
)

export const Batten = () => <Box size={[0.5, 0.015, 0.015]} pos={[0, 0.0075, 0]} color={C.pine} />

export const Nails = () => (
  <group>
    <Box size={[0.08, 0.025, 0.05]} pos={[0, 0.0125, 0]} color="#E9E2CF" />
    <Box size={[0.08, 0.002, 0.05]} pos={[0, 0.026, 0]} color={C.cota} />
    {[-0.025, -0.012, 0.002, 0.016].map((x, i) => (
      <group key={x} position={[x, 0.029, 0.038 + (i % 2) * 0.006]} rotation={[0, 0.3 * i, Math.PI / 2]}>
        <Cyl r={0.0008} h={0.025} pos={[0, 0, 0]} color={C.metal} seg={6} />
        <Cyl r={0.0022} h={0.0012} pos={[0, 0.0125, 0]} color={C.metal} seg={10} />
      </group>
    ))}
  </group>
)

export const Bulb = () => (
  <group rotation={[0, 0, Math.PI / 2]} position={[0, 0.048, 0]}>
    <mesh position={[0, 0.02, 0]} material={toon('#F6C766')} castShadow>
      <sphereGeometry args={[0.0475, 24, 18]} />
      <Line />
    </mesh>
    <Cyl r={0.0135} h={0.03} pos={[0, -0.04, 0]} color={C.metal} />
  </group>
)

export const Socket = () => (
  <group>
    <Cyl r={0.02} h={0.058} pos={[0, 0.029, 0]} color={C.white} />
    <Cyl r={0.029} h={0.004} pos={[0.07, 0.002, 0]} color={C.white} />
    <Cyl r={0.029} h={0.004} pos={[0.07, 0.007, 0]} color={C.white} />
  </group>
)

export const CableCoil = () => (
  <group>
    {[0, 0.007, 0.014].map((y, i) => (
      <mesh key={y} position={[0, 0.004 + y, 0]} rotation={[Math.PI / 2, 0, i * 0.4]} material={toon('#2E2B28')} castShadow>
        <torusGeometry args={[0.05 - i * 0.004, 0.0033, 8, 40]} />
      </mesh>
    ))}
  </group>
)

export const InlineSwitch = () => (
  <group>
    <RoundedBox args={[0.065, 0.02, 0.028]} radius={0.007} position={[0, 0.01, 0]} material={toon('#2E2B28')} castShadow>
      <Ink />
    </RoundedBox>
    <Box size={[0.026, 0.005, 0.014]} pos={[0, 0.022, 0]} rot={[0, 0, 0.2]} color={C.red} />
    <Cyl r={0.0033} h={0.06} pos={[-0.06, 0.004, 0]} rot={[0, 0, Math.PI / 2]} color="#2E2B28" seg={8} />
    <Cyl r={0.0033} h={0.06} pos={[0.06, 0.004, 0]} rot={[0, 0, Math.PI / 2]} color="#2E2B28" seg={8} />
  </group>
)

export const Plug = () => (
  <group>
    <Box size={[0.04, 0.018, 0.022]} pos={[0, 0.009, 0]} color={C.white} />
    <Cyl r={0.002} h={0.019} pos={[0.029, 0.009, -0.0065]} rot={[0, 0, Math.PI / 2]} color={C.metal} seg={8} />
    <Cyl r={0.002} h={0.019} pos={[0.029, 0.009, 0.0065]} rot={[0, 0, Math.PI / 2]} color={C.metal} seg={8} />
    <Cyl r={0.0033} h={0.05} pos={[-0.045, 0.006, 0]} rot={[0, 0, Math.PI / 2]} color="#2E2B28" seg={8} />
  </group>
)

export const Hammer = () => (
  <group position={[0, 0.012, 0]}>
    <Cyl r={0.009} h={0.26} pos={[0, 0, 0]} rot={[0, 0, Math.PI / 2]} color={C.pine} seg={10} />
    <Box size={[0.025, 0.024, 0.09]} pos={[0.13, 0, 0]} color={C.steel} />
  </group>
)

export const Brushes = () => (
  <group>
    {[-0.03, 0, 0.03].map((z, i) => (
      <group key={z} position={[i * 0.01, 0.007, z]}>
        <Cyl r={0.006} h={0.14} pos={[0, 0, 0]} rot={[0, 0, Math.PI / 2]} color={C.red} seg={8} />
        <Box size={[0.012, 0.012, 0.018]} pos={[0.075, 0, 0]} color={C.metal} />
        <Box size={[0.025, 0.009, 0.016]} pos={[0.094, 0, 0]} color="#C9A46B" />
      </group>
    ))}
  </group>
)

export const Glue = () => (
  <group>
    <Cyl r={0.022} h={0.09} pos={[0, 0.045, 0]} color={C.white} />
    <Cyl r={0.022} h={0.03} pos={[0, 0.05, 0]} color="#E7B33C" />
    <Cyl r={0.008} r2={0.014} h={0.02} pos={[0, 0.1, 0]} color="#E7B33C" />
    <Cyl r={0.002} r2={0.006} h={0.018} pos={[0, 0.119, 0]} color="#E7B33C" seg={8} />
  </group>
)

export const Sandpaper = () => (
  <group>
    {[
      ['#A6764A', 0, 0],
      ['#C99A65', 0.012, 0.25],
      ['#E0BE8C', 0.024, -0.2],
    ].map(([c, y, r]) => (
      <Box key={c as string} size={[0.14, 0.002, 0.11]} pos={[0, 0.001 + (y as number) * 0.15, 0]} rot={[0, r as number, 0]} color={c as string} />
    ))}
  </group>
)

export const Felt = () => (
  <group>
    <Box size={[0.07, 0.002, 0.07]} pos={[0, 0.001, 0]} color={C.white} />
    {[
      [-0.016, -0.016],
      [0.016, -0.016],
      [-0.016, 0.016],
      [0.016, 0.016],
    ].map(([x, z]) => (
      <Cyl key={`${x}${z}`} r={0.009} h={0.004} pos={[x, 0.004, z]} color="#8C7C6A" />
    ))}
  </group>
)

export const Varnish = () => (
  <group>
    <Cyl r={0.04} h={0.07} pos={[0, 0.035, 0]} color="#7FA08A" seg={28} />
    <Cyl r={0.041} h={0.008} pos={[0, 0.074, 0]} color={C.metal} seg={28} />
    <Box size={[0.08, 0.03, 0.001]} pos={[0, 0.035, 0.0405]} color={C.white} />
  </group>
)

export const MitreBox = () => (
  <group>
    <Box size={[0.3, 0.012, 0.09]} pos={[0, 0.006, 0]} color={C.ply} />
    <Box size={[0.3, 0.05, 0.012]} pos={[0, 0.037, -0.039]} color={C.ply} />
    <Box size={[0.3, 0.05, 0.012]} pos={[0, 0.037, 0.039]} color={C.ply} />
    {/* serrucho */}
    <group position={[0.02, 0.07, 0]} rotation={[0, 0, -0.08]}>
      <Box size={[0.26, 0.05, 0.002]} pos={[0, 0, 0]} color={C.metal} />
      <RoundedBox args={[0.07, 0.05, 0.018]} radius={0.008} position={[0.16, 0.012, 0]} material={toon(C.red)} castShadow>
        <Ink />
      </RoundedBox>
    </group>
  </group>
)

export const Drill = () => (
  <group rotation={[0, 0.3, 0]}>
    <RoundedBox args={[0.07, 0.025, 0.06]} radius={0.008} position={[0, 0.0125, 0]} material={toon(C.rubber)} castShadow>
      <Ink />
    </RoundedBox>
    <RoundedBox args={[0.035, 0.1, 0.04]} radius={0.01} position={[0, 0.07, 0]} material={toon(C.accent)} castShadow>
      <Ink />
    </RoundedBox>
    <RoundedBox args={[0.14, 0.05, 0.05]} radius={0.015} position={[0.035, 0.135, 0]} material={toon(C.accent)} castShadow>
      <Ink />
    </RoundedBox>
    <Cyl r={0.014} r2={0.012} h={0.03} pos={[0.12, 0.135, 0]} rot={[0, 0, Math.PI / 2]} color={C.rubber} />
    <Cyl r={0.002} h={0.05} pos={[0.16, 0.135, 0]} rot={[0, 0, Math.PI / 2]} color={C.metal} seg={8} />
  </group>
)

export const Clamp = () => (
  <group>
    <Box size={[0.012, 0.008, 0.22]} pos={[0, 0.004, 0]} color={C.steel} />
    <Box size={[0.012, 0.06, 0.016]} pos={[0, 0.03, -0.1]} color={C.red} />
    <Box size={[0.012, 0.06, 0.016]} pos={[0, 0.03, 0.03]} color={C.red} />
    <Cyl r={0.004} h={0.06} pos={[0, 0.055, 0.06]} rot={[Math.PI / 2, 0, 0]} color={C.metal} seg={8} />
    <RoundedBox args={[0.022, 0.03, 0.05]} radius={0.008} position={[0, 0.055, 0.1]} material={toon('#E7B33C')} castShadow>
      <Ink />
    </RoundedBox>
  </group>
)

export const Square = () => (
  <group>
    <Box size={[0.2, 0.002, 0.025]} pos={[0.02, 0.001, 0]} color={C.metal} />
    <Box size={[0.025, 0.012, 0.12]} pos={[-0.0925, 0.006, 0.0475]} color={C.ply} />
  </group>
)

export const Punch = () => (
  <group rotation={[0, 0, Math.PI / 2]} position={[0, 0.006, 0]}>
    <Cyl r={0.006} h={0.09} pos={[0, 0, 0]} color={C.steel} seg={8} />
    <Cyl r={0.001} r2={0.006} h={0.02} pos={[0, -0.055, 0]} color={C.steel} seg={8} />
  </group>
)

export const Caliper = () => (
  <group>
    <Box size={[0.18, 0.004, 0.016]} pos={[0, 0.002, 0]} color={C.metal} />
    <Box size={[0.008, 0.004, 0.05]} pos={[-0.086, 0.002, -0.033]} color={C.metal} />
    <Box size={[0.03, 0.007, 0.022]} pos={[-0.03, 0.0035, 0]} color={C.steel} />
    <Box size={[0.008, 0.004, 0.04]} pos={[-0.04, 0.002, -0.028]} color={C.metal} />
  </group>
)

export const Pencil = () => (
  <group>
    <Box size={[0.3, 0.002, 0.03]} pos={[0, 0.001, 0]} color="#F2E6C6" />
    <group position={[0.02, 0.008, 0.035]} rotation={[0, 0.2, Math.PI / 2]}>
      <Cyl r={0.004} h={0.16} pos={[0, 0, 0]} color={C.red} seg={6} />
      <Cyl r={0.0005} r2={0.004} h={0.02} pos={[0, -0.09, 0]} color={C.pine} seg={6} />
    </group>
  </group>
)

export const Screwdriver = () => (
  <group rotation={[0, 0, Math.PI / 2]} position={[0, 0.011, 0]}>
    <Cyl r={0.011} h={0.09} pos={[0, 0.04, 0]} color="#E7B33C" seg={12} />
    <Cyl r={0.003} h={0.1} pos={[0, -0.05, 0]} color={C.metal} seg={8} />
  </group>
)

/** serra de marqueteria: arc en U amb fulla fina i mànec */
export const FretSaw = () => (
  <group rotation={[0, 0, 0]}>
    <Cyl r={0.003} h={0.15} pos={[0.0, 0.004, -0.035]} rot={[0, 0, Math.PI / 2]} color="#2E2B28" seg={10} />
    <Cyl r={0.003} h={0.15} pos={[0.0, 0.004, 0.035]} rot={[0, 0, Math.PI / 2]} color="#2E2B28" seg={10} />
    <Cyl r={0.003} h={0.07} pos={[0.075, 0.004, 0]} rot={[Math.PI / 2, 0, 0]} color="#2E2B28" seg={10} />
    <mesh position={[-0.075, 0.004, 0]}>
      <boxGeometry args={[0.001, 0.002, 0.07]} />
      <meshBasicMaterial color={C.ink} />
    </mesh>
    <Cyl r={0.008} h={0.07} pos={[-0.11, 0.008, 0.035]} rot={[0, 0, Math.PI / 2]} color={C.red} />
  </group>
)

export const propComponents: Record<string, () => ReactNode> = {
  fretsaw: FretSaw,
  plywood: Plywood,
  batten: Batten,
  nails: Nails,
  screws: Nails,
  bulb: Bulb,
  socket: Socket,
  cable: CableCoil,
  inlineSwitch: InlineSwitch,
  plug: Plug,
  hammer: Hammer,
  brushes: Brushes,
  glue: Glue,
  sandpaper: Sandpaper,
  felt: Felt,
  varnish: Varnish,
  mitre: MitreBox,
  drill: Drill,
  clamp: Clamp,
  square: Square,
  punch: Punch,
  caliper: Caliper,
  pencil: Pencil,
  screwdriver: Screwdriver,
}
