import { useNavigate } from 'react-router-dom'
import type { LocationWithTime } from '../lib/types'
import { flagEmoji } from '../lib/cities'
import { StatusDot } from './StatusDot'

const statusBorder: Record<string, string> = {
  available: '#22C55E',
  edge: '#F59E0B',
  sleeping: '#EF4444',
}

interface Props {
  location: LocationWithTime
}

export function TimeWidget({ location }: Props) {
  const navigate = useNavigate()
  const border = statusBorder[location.status]

  return (
    <div
      onClick={() => navigate(`/detail/${location.id}`)}
      style={{
        background: '#1E293B',
        borderRadius: 16,
        padding: '16px',
        cursor: 'pointer',
        borderLeft: `3px solid ${border}`,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        transition: 'transform 0.1s',
        userSelect: 'none',
      }}
      onTouchStart={e => (e.currentTarget.style.transform = 'scale(0.97)')}
      onTouchEnd={e => (e.currentTarget.style.transform = 'scale(1)')}
    >
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 22 }}>{flagEmoji(location.countryCode)}</span>
        <StatusDot status={location.status} />
      </div>

      {/* City */}
      <div style={{ fontSize: 13, fontWeight: 600, color: '#94A3B8' }}>{location.city}</div>

      {/* Time */}
      <div style={{ fontSize: 28, fontWeight: 800, color: '#F8FAFC', lineHeight: 1 }}>
        {location.timeString}
      </div>

      {/* Date */}
      <div style={{ fontSize: 11, color: '#64748B' }}>{location.dateString}</div>

      {/* Work hours & diff */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
        <span style={{ fontSize: 11, color: '#64748B' }}>
          {location.workStart}:00 – {location.workEnd}:00
        </span>
        <span style={{ fontSize: 11, color: '#64748B' }}>
          {location.diffHours > 0 ? `+${location.diffHours}h` : location.diffHours === 0 ? 'local' : `${location.diffHours}h`}
        </span>
      </div>
    </div>
  )
}
