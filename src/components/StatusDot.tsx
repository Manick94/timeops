import type { Status } from '../lib/types'

const config: Record<Status, { color: string; label: string; emoji: string }> = {
  available: { color: '#22C55E', label: 'Available', emoji: '🟢' },
  edge: { color: '#F59E0B', label: 'Edge Hours', emoji: '🟡' },
  sleeping: { color: '#EF4444', label: 'Sleeping', emoji: '🔴' },
}

interface Props {
  status: Status
  showLabel?: boolean
  size?: 'sm' | 'md'
}

export function StatusDot({ status, showLabel = false, size = 'sm' }: Props) {
  const { color, label, emoji } = config[status]
  const dotSize = size === 'sm' ? 8 : 10

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span
        style={{
          width: dotSize,
          height: dotSize,
          borderRadius: '50%',
          backgroundColor: color,
          display: 'inline-block',
          boxShadow: `0 0 6px ${color}`,
          flexShrink: 0,
        }}
      />
      {showLabel && (
        <span style={{ color, fontSize: 12, fontWeight: 600 }}>
          {emoji} {label}
        </span>
      )}
    </span>
  )
}
