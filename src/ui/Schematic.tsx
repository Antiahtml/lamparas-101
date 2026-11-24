import { useApp } from '../state/store'

/**
 * Esquema eléctrico CONCEPTUAL (230 V, kit con interruptor de paso en el cable):
 * enchufe -> clavija -> cable -> interruptor de paso -> portalámparas y bombilla -> vuelta.
 * Cada símbolo selecciona el componente en 3D; el interruptor además abre y cierra el circuito.
 */
export function Schematic() {
  const on = useApp((s) => s.switchOn)
  const setSwitch = useApp((s) => s.setSwitch)
  const selected = useApp((s) => s.selected)
  const select = useApp((s) => s.select)
  const cls = (id: string) => `sym ${selected === id ? 'is-sel' : ''}`
  const pick = (id: string) => select(selected === id ? null : id)
  const toggle = () => setSwitch(!on)

  // recorrido completo, para el flujo animado
  const loop = 'M60 70 H110 M130 70 H168 M214 70 H286 V112 M286 152 V196 H40 V96'

  return (
    <figure className="m-0">
      <svg viewBox="0 0 320 232" className="h-auto w-full select-none" role="img" aria-label={`Esquema elèctric. Circuit ${on ? 'tancat: la bombeta fa llum' : 'obert: la bombeta està apagada'}.`}>
        <rect x="12" y="32" width="220" height="186" rx="8" fill="none" stroke="#9C8763" strokeDasharray="4 4" />
        <text x="122" y="24" textAnchor="middle" fontSize="10" fill="#6B5A45">fora de la làmpada: endoll, clavilla i cable</text>
        <rect x="244" y="88" width="68" height="90" rx="8" fill="none" stroke="#9C8763" strokeDasharray="4 4" />
        <text x="278" y="80" textAnchor="middle" fontSize="10" fill="#6B5A45">làmpada</text>

        <path className="wire" d="M40 46 V44 M60 70 H110 M130 70 H168 M214 70 H286 V112 M286 152 V196 H40 V96" />
        {on && <path className="flow" d={loop} />}

        {/* red: enchufe 230 V */}
        <g>
          <circle cx="40" cy="70" r="22" fill="#F8F2E4" stroke="#2A2016" strokeWidth="2.5" />
          <path d="M28 70 q6 -10 12 0 t12 0" fill="none" stroke="#2A2016" strokeWidth="2.5" />
          <text x="40" y="108" textAnchor="middle" fontSize="11" fontWeight="600" dx="30">Endoll</text>
          <text x="40" y="121" textAnchor="middle" fontSize="10" fill="#B5452E" fontWeight="700" dx="30">230 V</text>
        </g>

        {/* clavija */}
        <g className={cls('clavija')} onClick={() => pick('clavija')}>
          <rect className="sym-hit" x="98" y="48" width="44" height="58" rx="6" />
          <rect x="110" y="60" width="20" height="20" rx="3" fill="#2E2B28" />
          <line x1="104" y1="65" x2="110" y2="65" stroke="#2A2016" strokeWidth="2.5" />
          <line x1="104" y1="75" x2="110" y2="75" stroke="#2A2016" strokeWidth="2.5" />
          <text x="120" y="98" textAnchor="middle" fontSize="11" fontWeight="600">Clavilla</text>
        </g>

        {/* interruptor de paso, en el cable */}
        <g
          className={cls('interruptor')}
          onClick={toggle}
          role="button"
          aria-pressed={on}
          aria-label="Interruptor de pas"
          tabIndex={0}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), toggle())}
        >
          <rect className="sym-hit" x="156" y="34" width="70" height="72" rx="6" />
          <circle cx="170" cy="70" r="4" fill="#2A2016" />
          <circle cx="212" cy="70" r="4" fill="#2A2016" />
          <line
            x1="170"
            y1="70"
            x2="210"
            y2="70"
            stroke={on ? '#2F6B4F' : '#2A2016'}
            strokeWidth="3.5"
            strokeLinecap="round"
            style={{ transformOrigin: '170px 70px', transform: on ? 'rotate(0deg)' : 'rotate(-28deg)', transition: 'transform .25s ease-out' }}
          />
          <text x="191" y="46" textAnchor="middle" fontSize="10" fill={on ? '#2F6B4F' : '#B5452E'} fontWeight="700">
            {on ? 'tancat' : 'obert'}
          </text>
          <text x="191" y="94" textAnchor="middle" fontSize="11" fontWeight="600">Interruptor</text>
          <text x="191" y="106" textAnchor="middle" fontSize="10" fill="#6B5A45">de pas</text>
        </g>

        {/* cable (tramo inferior) */}
        <g className={cls('cable')} onClick={() => pick('cable')}>
          <rect className="sym-hit" x="60" y="186" width="200" height="20" rx="6" />
          <text x="160" y="214" textAnchor="middle" fontSize="10" fill="#6B5A45">cable tèxtil</text>
        </g>

        {/* bombilla en su portalámparas */}
        <g className={cls('bombilla')} onClick={() => pick('bombilla')}>
          <rect className="sym-hit" x="256" y="104" width="52" height="56" rx="6" />
          {on && <circle cx="286" cy="132" r="24" fill="#FFC94D" opacity="0.35" />}
          <circle cx="286" cy="132" r="16" fill={on ? '#FFC94D' : '#F8F2E4'} stroke="#2A2016" strokeWidth="2.5" style={{ transition: 'fill .25s' }} />
          <path d="M275 121 L297 143 M297 121 L275 143" stroke="#2A2016" strokeWidth="2.5" />
          <text x="278" y="172" textAnchor="middle" fontSize="11" fontWeight="600">Bombeta</text>
        </g>

        <text x="160" y="230" textAnchor="middle" fontSize="10" fill="#6B5A45">
          {on ? 'Circuit tancat: circula corrent' : 'Circuit obert: no circula corrent'}
        </text>
      </svg>
    </figure>
  )
}
