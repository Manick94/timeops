import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { enrichLocation, computeOverlap, getSuggestion } from '../lib/timezone'
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
  const { locations, userTimezone } = useStore()
  const [enriched, setEnriched] = useState<LocationWithTime[]>([])

  useEffect(() => {
    const update = () => setEnriched(locations.map(l => enrichLocation(l, userTimezone)))
    update()
    const interval = setInterval(update, 10000)
    return () => clearInterval(interval)
  }, [locations, userTimezone])

  const overlap = computeOverlap(locations)
  const suggestion = getSuggestion(enriched)
  const style = urgencyStyle[suggestion.urgency]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', background: 'var(--color-bg)' }}>
      {/* Top Bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '20px 20px 12px',
        background: 'var(--color-bg)',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#F8FAFC', letterSpacing: '-0.5px' }}>TimeOps</div>
          <ThemePicker />
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            onClick={() => navigate('/templates')}
            style={{
              background: 'var(--color-card)',
              color: '#94A3B8',
              border: 'none',
              borderRadius: 12,
              width: 40,
              height: 40,
              fontSize: 18,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >✉️</button>
          <button
            onClick={() => navigate('/map')}
            style={{
              background: 'var(--color-card)',
              color: '#94A3B8',
              border: 'none',
              borderRadius: 12,
              width: 40,
              height: 40,
              fontSize: 18,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >🗺</button>
          <button
            onClick={() => navigate('/add')}
            style={{
              background: 'var(--color-primary)',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              width: 40,
              height: 40,
              fontSize: 22,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700,
            }}
          >
            +
          </button>
        </div>
      </div>

      {/* Map Strip Placeholder */}
      <div
        onClick={() => navigate('/overlap')}
        style={{
          margin: '0 16px 12px',
          background: '#1E293B',
          borderRadius: 12,
          height: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          overflow: 'hidden',
          position: 'relative',
          border: '1px solid #334155',
        }}
      >
        <MapStrip locations={enriched} />
      </div>

      {/* CTA / Suggestion Bar */}
      <div style={{
        margin: '0 16px 16px',
        borderRadius: 12,
        padding: '12px 16px',
        background: style.bg,
        border: `1px solid ${style.color}30`,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}>
        <span style={{ fontSize: 18 }}>
          {suggestion.urgency === 'now' ? '📞' : suggestion.urgency === 'soon' ? '⏰' : '💤'}
        </span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: style.color }}>{suggestion.text}</div>
          <div style={{ fontSize: 11, color: '#64748B', marginTop: 1 }}>Smart suggestion</div>
        </div>
      </div>

      {/* Widget Grid */}
      <div style={{ flex: 1, padding: '0 16px', overflowY: 'auto' }}>
        {enriched.length === 0 ? (
          <div style={{
            textAlign: 'center', color: '#475569', fontSize: 14,
            padding: '60px 20px',
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🌍</div>
            No locations yet. Tap <strong style={{ color: 'var(--color-primary)' }}>+</strong> to add your first one.
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 12,
            paddingBottom: 100,
          }}>
            {enriched.map(loc => <TimeWidget key={loc.id} location={loc} />)}
          </div>
        )}
      </div>

      {/* Bottom Overlap Panel */}
      {overlap && (
        <div
          onClick={() => navigate('/overlap')}
          style={{
            position: 'sticky', bottom: 0,
            background: '#1E293B',
            borderTop: '1px solid #334155',
            padding: '14px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
          }}
        >
          <div>
            <div style={{ fontSize: 11, color: '#64748B', marginBottom: 2 }}>Best overlap window</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#F8FAFC' }}>
              {overlap.durationHours > 0
                ? `${overlap.durationHours}h window • Score ${overlap.qualityScore}%`
                : 'No overlap found today'}
            </div>
          </div>
          <div style={{ color: 'var(--color-primary)', fontSize: 18 }}>›</div>
        </div>
      )}
    </div>
  )
}

function MapStrip({ locations }: { locations: LocationWithTime[] }) {
  const statusColor: Record<string, string> = {
    available: '#22C55E',
    edge: '#F59E0B',
    sleeping: '#EF4444',
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      {/* Simple SVG world outline */}
      <svg
        viewBox="0 0 800 400"
        style={{ width: '100%', height: '100%', opacity: 0.15 }}
        preserveAspectRatio="xMidYMid slice"
      >
        <rect width="800" height="400" fill="#0F172A" />
        {/* Rough continent shapes */}
        <ellipse cx="200" cy="180" rx="90" ry="60" fill="#334155" />
        <ellipse cx="400" cy="160" rx="80" ry="55" fill="#334155" />
        <ellipse cx="560" cy="155" rx="70" ry="50" fill="#334155" />
        <ellipse cx="680" cy="200" rx="50" ry="70" fill="#334155" />
        <ellipse cx="180" cy="280" rx="40" ry="55" fill="#334155" />
        <ellipse cx="430" cy="260" rx="45" ry="40" fill="#334155" />
      </svg>

      {/* City dots on approximate positions */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center',
        padding: '0 12px',
        gap: 8,
        overflowX: 'auto',
      }}
        className="scrollbar-hide"
      >
        {locations.map(loc => (
          <div key={loc.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, flexShrink: 0 }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: statusColor[loc.status],
              boxShadow: `0 0 6px ${statusColor[loc.status]}`,
            }} />
            <span style={{ fontSize: 9, color: '#94A3B8', whiteSpace: 'nowrap' }}>{loc.city}</span>
          </div>
        ))}
        <span style={{ fontSize: 11, color: '#475569', flexShrink: 0, marginLeft: 4 }}>
          Tap for overlap view →
        </span>
      </div>
    </div>
  )
}
