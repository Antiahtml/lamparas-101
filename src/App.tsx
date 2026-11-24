import { lamps } from './content'
import { useApp } from './state/store'
import { InfoPanel } from './ui/InfoPanel'
import { Inventory } from './ui/Inventory'
import { SceneStage } from './ui/SceneStage'
import { SceneSync } from './ui/SceneSync'
import { Sidebar } from './ui/Sidebar'

export default function App() {
  const lampId = useApp((s) => s.lampId)
  const panelOpen = useApp((s) => s.panelOpen)
  const inventoryOpen = useApp((s) => s.inventoryOpen)
  const lamp = lamps[lampId]

  return (
    <div className="grid h-full overflow-hidden" style={{ gridTemplateRows: 'minmax(0, 1fr)', gridTemplateColumns: `clamp(200px, 17vw, 248px) 1fr ${panelOpen ? 'clamp(310px, 27vw, 370px)' : '0px'}`, transition: 'grid-template-columns .35s ease' }}>
      <Sidebar lamp={lamp} />
      <main className="relative min-w-0">
        <SceneStage lamp={lamp} />
      </main>
      <div className="relative min-w-0 overflow-hidden">{panelOpen && <InfoPanel lamp={lamp} />}</div>
      <SceneSync />
      {inventoryOpen && <Inventory lamp={lamp} />}
    </div>
  )
}
