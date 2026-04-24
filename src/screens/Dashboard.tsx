import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { enrichLocation, getSuggestion } from '../lib/timezone'
import type { LocationWithTime } from '../lib/types'
import { TimeWidget } from '../components/TimeWidget'
import { ThemePicker } from '../components/ThemePicker'

const urgencyStyle: Record<string, { bg: string; color: string }> = {
  now:  { bg: '#16532720', color: '#22C55E' },
  soon: { bg: '#78350f20', color: '#F59E0B' },
  later:{ bg: 'color-mix(in srgb, var(--color-primary) 12%, transparent)', color: 'var(--color-primary)' },
  wait: { bg: '#1e293b',   color: '#64748B' },
}

export function Dashboard() {
  const navigate = useNavigate()
  const { locations, userTimezone, hour12, toggleHour12 } = useStore()
  const [enriched, setEnriched] = useState<LocationWithTime[]>([])

  useEffect(() => {
    const update = () => setEnriched(locations.map(l => enrichLocation(l, userTimezone, hour12)))
    update()
    const interval = setInterval(update, 10000)
    return () => clearInterval(interval)
  }, [locations, userTimezone, hour12])

  const suggestion = getSuggestion(enriched)
  const style = urgencyStyle[suggestion.urgency]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', background: 'var(--color-bg)', overflowX: 'hidden' }}>

      {/* Top Bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '20px 20px 12px',
        background: 'var(--color-bg)',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#F8FAFC', letterSpacing: '-0.5px' }}>TimeOps</div>
          <ThemePicker />
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            onClick={toggleHour12}
            style={{
              background: 'var(--color-card)', color: '#94A3B8',
              border: 'none', borderRadius: 10,
              padding: '6px 10px', fontSize: 10, fontWeight: 700,
              cursor: 'pointer', letterSpacing: '0.04em',
            }}
          >{hour12 ? '12H' : '24H'}</button>
          <button
            onClick={() => navigate('/add')}
            style={{
              background: 'var(--color-primary)', color: '#fff',
              border: 'none', borderRadius: 12,
              width: 40, height: 40, fontSize: 22,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700,
            }}
          >+</button>
        </div>
      </div>

      {/* Map Strip — tap opens overlap */}
      <div
        onClick={() => navigate('/overlap')}
        style={{
          margin: '0 16px 12px',
          background: '#1E293B',
          borderRadius: 12, height: 56,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', overflow: 'hidden', position: 'relative',
          border: '1px solid #334155',
        }}
      >
        <MapStrip locations={enriched} />
      </div>

      {/* Smart suggestion bar */}
      <div style={{
        margin: '0 16px 16px', borderRadius: 12, padding: '10px 16px',
        background: style.bg, border: `1px solid ${style.color}30`,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <span style={{ fontSize: 18 }}>
          {suggestion.urgency === 'now' ? '📞' : suggestion.urgency === 'soon' ? '⏰' : '💤'}
        </span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: style.color }}>{suggestion.text}</div>
          <div style={{ fontSize: 11, color: '#64748B', marginTop: 1 }}>Smart suggestion</div>
        </div>
      </div>

      {/* Widget area — 2-column vertical scroll grid */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 80px' }}>
        {enriched.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#475569', fontSize: 14, padding: '60px 20px' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🌍</div>
            No locations yet. Tap <strong style={{ color: 'var(--color-primary)' }}>+</strong> to add.
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 12,
          }}>
            {enriched.map(loc => (
              <TimeWidget key={loc.id} location={loc} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function MapStrip({ locations }: { locations: LocationWithTime[] }) {
  const statusColor: Record<string, string> = {
    available: '#22C55E', edge: '#F59E0B', sleeping: '#EF4444',
  }
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      <svg viewBox="0 0 800 400" style={{ width: '100%', height: '100%', opacity: 0.15 }} preserveAspectRatio="xMidYMid slice">
        <rect width="800" height="400" fill="#0F172A" />
        <ellipse cx="200" cy="180" rx="90" ry="60" fill="#334155" />
        <ellipse cx="400" cy="160" rx="80" ry="55" fill="#334155" />
        <ellipse cx="560" cy="155" rx="70" ry="50" fill="#334155" />
        <ellipse cx="680" cy="200" rx="50" ry="70" fill="#334155" />
        <ellipse cx="180" cy="280" rx="40" ry="55" fill="#334155" />
        <ellipse cx="430" cy="260" rx="45" ry="40" fill="#334155" />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center',
        padding: '0 12px', gap: 10,
        overflow: 'hidden',
      }}>
        {locations.map(loc => (
          <div key={loc.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flexShrink: 0 }}>
            <div style={{
              width: 7, height: 7, borderRadius: '50%',
              background: statusColor[loc.status],
              boxShadow: `0 0 6px ${statusColor[loc.status]}`,
            }} />
            <span style={{ fontSize: 8, color: '#94A3B8', whiteSpace: 'nowrap' }}>{loc.city}</span>
          </div>
        ))}
        <span style={{ fontSize: 10, color: '#334155', flexShrink: 0, marginLeft: 'auto' }}>Tap for overlap →</span>
      </div>
    </div>
  )
}
