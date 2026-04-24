import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Dashboard } from './screens/Dashboard'
import { DesktopDashboard } from './screens/DesktopDashboard'
import { WidgetDetail } from './screens/WidgetDetail'
import { OverlapView } from './screens/OverlapView'
import { AddLocation } from './screens/AddLocation'
import { EmailTemplates } from './screens/EmailTemplates'
import { MapView } from './screens/MapView'
import { useIsDesktop } from './lib/useIsDesktop'
import { ThemeProvider } from './lib/ThemeProvider'

function Home() {
  const isDesktop = useIsDesktop()
  return isDesktop ? <DesktopDashboard /> : <Dashboard />
}

export default function App() {
  return (
    <ThemeProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/detail/:id" element={<WidgetDetail />} />
          <Route path="/overlap" element={<OverlapView />} />
          <Route path="/add" element={<AddLocation />} />
          <Route path="/templates" element={<EmailTemplates />} />
          <Route path="/map" element={<MapView />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </ThemeProvider>
  )
}
