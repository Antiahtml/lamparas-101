import type { LampManifest } from '../types'
import { ASSEMBLY, buildPieces, placeElectric, V1 } from './lampara_01.model'

// Fuente de todos los datos: ../lampara_01/generador/generar_planos.py (VERSIÓN 1, medidas validadas).
// No hay medidas inventadas: si un dato no está en esos archivos, se marca como provisional.

const { H, W, D, HB, L } = V1

export const lampara01: LampManifest = {
  id: 'lampara_01',
  name: 'Làmpada 01',
  status: 'Versió 1 · mesures validades',
  model: 'models/lampara_01/lampara_01.glb',
  dims: { width: W, height: H, depth: D, baseHeight: HB, batten: L },
  validatedBoard: V1.T_VALIDATED,
  tagline: 'Caixa amb la bombeta a la vista',
  build: buildPieces,
  assembly: ASSEMBLY,
  place: placeElectric,
  hw: { kerf: V1.KERF, screwD: V1.SCREW_D, cskD: V1.CSK_D, pilot: 'Ø2 × 12 mm' },
  electric: {
    // ../lampara_01/iteracion_02/generar_propuesta.py, C = dict(...)  (revisión B, PROPUESTA)
    voltage: '230 V CA',
    socketDiameter: 40,
    socketHeight: 58,
    socketBelow: 16,
    ringDiameter: 58,
    ringThickness: 4,
    bulbDiameter: 95,
    bulbLength: 140,
    bulbEngage: 22,
    cableDiameter: 6.5,
    slotWidth: 8,
    slotHeight: 15,
    switchSize: [65, 28, 20],
    plugSize: [40, 22, 18],
    source: 'Iteració 2, revisió B (proposta): cotes del kit provisionals fins que es mesurin els components rebuts.',
  },
  components: [
    { id: 'clavija', name: 'Clavilla plana', role: "S'endolla a la xarxa. És l'entrada del corrent a la làmpada.", spec: 'Clavilla plana del kit · 230 V', where: 'Al final del cable, fora de la làmpada.', provisional: true },
    { id: 'cable', name: 'Cable tèxtil', role: "Porta el corrent des de la clavilla, passant per l'interruptor, fins al portalàmpades. Surt de la base per una ranura de la tapa del darrere.", spec: 'Cable tèxtil 2 × 0,75 mm² · Ø6,5 aprox. (cal comprovar-ho)', where: "Surt del portalàmpades, baixa per dins de la base i surt per una ranura al cantell inferior de la tapa del darrere. Per dins el subjecta una abraçadora (proposta de la iteració 2).", provisional: true },
    { id: 'interruptor', name: 'Interruptor de pas', role: "Va intercalat al cable, fora de la làmpada. Obre o tanca el circuit: tancat, el corrent circula i la bombeta fa llum.", spec: 'Interruptor de pas del kit · 65 × 28 × 20 mm (provisional)', where: 'Intercalat al cable, sobre la taula, fora de la làmpada.', provisional: true },
    { id: 'portalamparas', name: 'Portalàmpades E27', role: "Subjecta la bombeta i li porta el corrent. S'estreny al prestatge amb les dues anelles.", spec: 'E27 amb rosca exterior i doble anella · Ø40 (provisional)', where: 'Al centre del prestatge (peça 3), estret amb una anella per sobre i una altra per sota.', provisional: true },
    { id: 'bombilla', name: 'Bombeta LED G95', role: "Transforma l'energia elèctrica en llum.", spec: 'LED ambre G95 · E27 · Ø95 × 140 mm (cal comprovar la rebuda)', where: 'Enroscada al portalàmpades, dins del buit de la làmpada.', provisional: true },
  ],
  // Materials: pressupostos d'octubre i novembre de 2026 (materiales_lamparas.md). L'inventari real NO està verificat.
  catalog: [
    { id: 'contrachapado', name: 'Tauler de contraxapat', category: 'material', detail: 'Gruix per confirmar (5 mm al pressupost, 10 mm als plànols)', use: "D'aquí surten les 6 peces planes: laterals, tapa, prestatge, frontal i tapa del darrere.", prop: 'plywood', source: "Pressupostos d'octubre i novembre", unverified: true, group: 'madera' },
    { id: 'liston', name: 'Llistó de pi', category: 'material', detail: '15 × 15 mm als plànols · no surt als pressupostos', use: 'Reforça les unions per dins: els cargols o els claus entren al llistó, mai al cantell del tauler.', prop: 'batten', source: 'Plànols v1 (no pressupostat)', unverified: true, group: 'madera' },
    { id: 'clavos', name: 'Claus', category: 'material', detail: 'Mida per confirmar', use: 'Uneixen les peces de fusta juntament amb la cola.', prop: 'nails', source: "Pressupost de novembre (lot) i d'octubre (0,9 × 25 mm)", unverified: true, group: 'union' },
    { id: 'tornillos', name: 'Cargols 3 × 20', category: 'material', detail: 'Cap fresat · 20 + 5 de recanvi (plànols v1)', use: 'Uneixen els panells als llistons. No surten als pressupostos.', prop: 'screws', source: 'Plànols v1 (no pressupostat)', unverified: true, group: 'union' },
    { id: 'cola', name: 'Cola blanca', category: 'material', detail: 'CEYS', use: 'Enganxa les unions fixes. La tapa del darrere va sense cola per poder-la obrir.', prop: 'glue', source: "Pressupostos d'octubre i novembre", unverified: true, group: 'union' },
    { id: 'lija', name: 'Paper de vidre', category: 'material', detail: 'Gra 120, 180 i 240 (plànols v1)', use: 'Allisa cantells i cares, de gra gruixut a fi.', prop: 'sandpaper', source: 'Plànols v1 (no pressupostat)', unverified: true, group: 'acabado' },
    { id: 'bombilla', name: 'Bombeta LED ambre', category: 'material', detail: 'EGLO · E27 · 9 unitats', use: "Fa la llum. Va enroscada al portalàmpades.", prop: 'bulb', source: 'Pressupost de novembre', unverified: true, zone: 'kit', group: 'kit' },
    { id: 'portalamparas', name: 'Portalàmpades', category: 'material', detail: 'E27 o E14: cal confirmar quin va arribar', use: 'Subjecta la bombeta i es fixa al prestatge.', prop: 'socket', source: "Pressupost d'octubre", unverified: true, zone: 'kit', group: 'kit' },
    { id: 'cable', name: 'Cable elèctric', category: 'material', detail: 'Llargada i secció per confirmar', use: 'Porta el corrent des de la clavilla fins a la bombeta.', prop: 'cable', source: "Pressupostos d'octubre i novembre", unverified: true, zone: 'kit', group: 'kit' },
    { id: 'interruptor', name: 'Interruptor de pas', category: 'material', detail: 'Negre · 9 unitats', use: 'Va al cable i encén o apaga la làmpada.', prop: 'inlineSwitch', source: 'Pressupost de novembre', unverified: true, zone: 'kit', group: 'kit' },
    { id: 'clavija', name: 'Clavilla plana', category: 'material', detail: 'Famatel · 9 unitats', use: "S'endolla a la xarxa. La munta personal qualificat.", prop: 'plug', source: 'Pressupost de novembre', unverified: true, zone: 'kit', group: 'kit' },
    { id: 'serrucho', name: 'Xerrac i caixa de biaixos', category: 'herramienta', detail: 'Tall a 90°', use: 'Guia la serra per tallar recte.', prop: 'mitre', source: 'Plànols v1 (muntatge)', group: 'herramienta' },
    { id: 'taladro', name: 'Trepant i broques', category: 'herramienta', detail: 'Forats guia', use: 'Fa els forats, per exemple el del portalàmpades.', prop: 'drill', source: 'Plànols v1 (muntatge)', group: 'herramienta' },
    { id: 'martillo', name: 'Martell', category: 'herramienta', detail: 'Per als claus', use: 'Clava els claus sense doblegar-los.', prop: 'hammer', source: 'Necessari per als claus del pressupost', group: 'herramienta' },
    { id: 'punzon', name: 'Punxó', category: 'herramienta', detail: 'Marcar centres', use: 'Marca el centre de cada forat perquè la broca no rellisqui.', prop: 'punch', source: 'Plànols v1 (muntatge)', group: 'herramienta' },
    { id: 'destornillador', name: 'Tornavís', category: 'herramienta', detail: 'Per a cargols 3 × 20', use: 'Estreny els cargols als llistons.', prop: 'screwdriver', source: 'Plànols v1 (muntatge)', group: 'herramienta' },
    { id: 'sargentos', name: 'Serjants', category: 'herramienta', detail: "Estrènyer mentre s'asseca", use: "Estrenyen les peces mentre s'asseca la cola.", prop: 'clamp', source: 'Plànols v1 (muntatge)', group: 'herramienta' },
    { id: 'escuadra', name: 'Escaire', category: 'herramienta', detail: 'Comprovar 90°', use: 'Comprova que els laterals queden en angle recte.', prop: 'square', source: 'Plànols v1 (muntatge)', group: 'herramienta' },
    { id: 'calibre', name: 'Peu de rei', category: 'herramienta', detail: 'Mesurar el gruix real', use: 'Mesura el gruix real del tauler abans de tallar.', prop: 'caliper', source: 'Plànols v1 (comprovacions)', group: 'herramienta' },
    { id: 'lapiz', name: 'Llapis i regle', category: 'herramienta', detail: 'Marcatge', use: 'Marquen les línies de tall i el número de cada peça.', prop: 'pencil', source: 'Plànols v1 (muntatge)', group: 'herramienta' },
    { id: 'pinceles', name: 'Pinzells', category: 'herramienta', detail: 'Paquet de 5', use: 'Estenen la cola de manera uniforme.', prop: 'brushes', source: "Pressupost d'octubre", unverified: true, group: 'herramienta' },
  ],
  documents: [
    { label: 'Plànols complets', file: 'docs/lampara_01/lampara_01_planos.pdf', kind: 'pdf', description: '13 làmines A3: plànol general, especejament, peces a 1:1, muntatge i esquema.' },
    { label: 'Plànol general', file: 'docs/lampara_01/plano_general.dxf', kind: 'dxf', description: 'Alçat, planta i perfil a 1:1.' },
    { label: 'Peces acotades', file: 'docs/lampara_01/piezas_cotadas.dxf', kind: 'dxf', description: 'Cada peça a 1:1 amb cotes i forats.' },
    { label: 'Tall del tauler', file: 'docs/lampara_01/corte_tablero.dxf', kind: 'dxf', description: 'Contorns i forats per a làser o CNC.' },
    { label: 'Foto de referència', file: 'docs/lampara_01/foto_lampara_01.jpg', kind: 'img', description: 'La làmpada acabada.' },
  ],
  notes: [
    "Inventari sense verificar: els materials surten de dos pressupostos (octubre i novembre) i no s'ha comprovat què va arribar.",
    "Les mesures de les peces es calculen amb el gruix que indica l'alumne i les fórmules dels plànols v1 (validats amb 10 mm). Amb un altre gruix, el professor les revisa abans de tallar.",
    'Els plànols v1 uneixen amb cargols 3 × 20; els pressupostos porten claus. Amb claus, confirma la unió amb el professor.',
    "La part elèctrica (kit de 230 V) és una proposta: les seves mesures es tancaran quan es mesurin els components rebuts.",
    "La connexió i la comprovació elèctrica les fa personal qualificat. L'alumnat no connecta res a la xarxa.",
  ],
}
