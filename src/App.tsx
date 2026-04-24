import { HashRouter, Routes, Route, Navigate, Outlet, useNavigate, useLocation } from 'react-router-dom'
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

const NAV_TABS = [
  { path: '/',          icon: '🏠', label: 'Home' },
  { path: '/map',       icon: '🗺', label: 'Map' },
  { path: '/overlap',   icon: '⏱', label: 'Overlap' },
  { path: '/add',       icon: '➕', label: 'Add' },
  { path: '/templates', icon: '✉️', label: 'Mail' },
]

function BottomNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      height: 64,
      background: 'var(--color-card)',
      borderTop: '1px solid #334155',
      display: 'flex',
      zIndex: 200,
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
    }}>
      {NAV_TABS.map(tab => {
        const isActive = tab.path === '/'
          ? pathname === '/' || pathname.startsWith('/detail')
          : pathname.startsWith(tab.path)
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            style={{
              flex: 1, border: 'none', background: 'transparent',
              cursor: 'pointer', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 3,
              padding: 0,
            }}
          >
            <span style={{
              fontSize: 20,
              filter: isActive ? 'none' : 'grayscale(1) opacity(0.45)',
              transition: 'filter 0.15s',
            }}>
              {tab.icon}
            </span>
            <span style={{
              fontSize: 9, fontWeight: isActive ? 700 : 400,
              color: isActive ? 'var(--color-primary)' : '#475569',
              transition: 'color 0.15s',
            }}>
              {tab.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

function Layout() {
  return (
    <>
      <Outlet />
      <BottomNav />
    </>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/"           element={<Home />} />
            <Route path="/detail/:id" element={<WidgetDetail />} />
            <Route path="/overlap"    element={<OverlapView />} />
            <Route path="/add"        element={<AddLocation />} />
            <Route path="/templates"  element={<EmailTemplates />} />
            <Route path="/map"        element={<MapView />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </ThemeProvider>
  )
}
