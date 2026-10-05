import { AppRoutes } from '@/routes/AppRoutes'
import { DemoAccessGate } from '@/features/access/DemoAccessGate'

function App() {
  return (
    <DemoAccessGate>
      <AppRoutes />
    </DemoAccessGate>
  )
}

export default App
