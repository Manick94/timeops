import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { enrichLocation, getSuggestion } from '../lib/timezone'
import type { LocationWithTime } from '../lib/types'
import { flagEmoji } from '../lib/cities'
import { StatusDot } from '../components/StatusDot'

export function WidgetDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { locations, userTimezone, removeLocation } = useStore()
  const [loc, setLoc] = useState<LocationWithTime | null>(null)

  useEffect(() => {
    const raw = locations.find(l => l.id === id)
    if (!raw) { navigate('/'); return }
    const update = () => setLoc(enrichLocation(raw, userTimezone))
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [id, locations, userTimezone, navigate])

  if (!loc) return null

  const suggestion = getSuggestion([loc])
  const insightColor = loc.status === 'available' ? '#22C55E' : loc.status === 'edge' ? '#F59E0B' : '#EF4444'

  const handleRemove = () => {
    removeLocation(loc.id)
    navigate('/')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', background: '#0F172A' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '20px 20px 12px',
      }}>
        <button
          onClick={() => navigate('/')}
          style={{
            background: '#1E293B', border: 'none', borderRadius: 10,
            width: 36, height: 36, color: '#94A3B8', fontSize: 18,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          ‹
        </button>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#F8FAFC' }}>{loc.city}</div>
      </div>

      <div style={{ flex: 1, padding: '0 20px 32px', overflowY: 'auto' }}>
        {/* Flag + Location */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 64, marginBottom: 8 }}>{flagEmoji(loc.countryCode)}</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#F8FAFC' }}>{loc.city}</div>
          <div style={{ fontSize: 14, color: '#64748B' }}>{loc.country}</div>
          <div style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>{loc.timezone}</div>
        </div>

        {/* Large Clock */}
        <div style={{
          background: '#1E293B',
          borderRadius: 20,
          padding: '28px 20px',
          textAlign: 'center',
          marginBottom: 16,
          border: '1px solid #334155',
        }}>
          <div style={{ fontSize: 56, fontWeight: 800, color: '#F8FAFC', letterSpacing: '-1px', lineHeight: 1 }}>
            {loc.timeString}
          </div>
          <div style={{ fontSize: 13, color: '#64748B', marginTop: 8 }}>{loc.dateString}</div>
          <div style={{ marginTop: 12 }}>
            <StatusDot status={loc.status} showLabel size="md" />
          </div>
        </div>

        {/* Info Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <InfoCard label="Work Hours" value={`${loc.workStart}:00 – ${loc.workEnd}:00`} />
          <InfoCard
            label="Time Difference"
            value={loc.diffHours === 0 ? 'Same time' : `${loc.diffHours > 0 ? '+' : ''}${loc.diffHours}h from you`}
          />
        </div>

        {/* Insight */}
        <div style={{
          background: `${insightColor}15`,
          border: `1px solid ${insightColor}40`,
          borderRadius: 14,
          padding: '14px 16px',
          marginBottom: 24,
        }}>
          <div style={{ fontSize: 11, color: '#64748B', marginBottom: 4 }}>Insight</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: insightColor }}>{suggestion.text}</div>
          {loc.status === 'available' && (
            <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>
              Peak response window active
            </div>
          )}
          {loc.status === 'sleeping' && suggestion.waitHours && (
            <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>
              Available in ~{suggestion.waitHours}h
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <ActionButton
            label="📞  Call Now"
            primary
            disabled={loc.status === 'sleeping'}
            onClick={() => {}}
          />
          <ActionButton
            label="📅  Schedule Meeting"
            onClick={() => navigate('/overlap')}
          />
          <ActionButton
            label="🗑  Remove Location"
            danger
            onClick={handleRemove}
          />
        </div>
      </div>
    </div>
  )
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      background: '#1E293B',
      borderRadius: 12,
      padding: '12px 14px',
      border: '1px solid #334155',
    }}>
      <div style={{ fontSize: 11, color: '#64748B', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#F8FAFC' }}>{value}</div>
    </div>
  )
}

function ActionButton({
  label, primary, danger, disabled, onClick,
}: {
  label: string; primary?: boolean; danger?: boolean; disabled?: boolean; onClick: () => void
}) {
  const bg = danger ? '#7f1d1d30' : primary ? 'var(--color-primary)' : '#1E293B'
  const color = danger ? '#EF4444' : primary ? (disabled ? '#94A3B8' : '#fff') : '#CBD5E1'
  const border = danger ? '1px solid #EF444440' : primary ? 'none' : '1px solid #334155'

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: disabled ? '#1E293B' : bg,
        color: disabled ? '#475569' : color,
        border,
        borderRadius: 14,
        padding: '14px 20px',
        fontSize: 14,
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        textAlign: 'left',
        width: '100%',
      }}
    >
      {label}
    </button>
  )
}
