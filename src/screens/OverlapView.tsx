import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { enrichLocation, computeOverlap } from '../lib/timezone'
import type { LocationWithTime, OverlapWindow } from '../lib/types'
import { flagEmoji } from '../lib/cities'

const HOURS = Array.from({ length: 24 }, (_, i) => i)

const statusColor = { available: '#22C55E', edge: '#F59E0B', sleeping: '#EF4444' }

function getHourStatus(loc: LocationWithTime, utcHour: number): 'available' | 'edge' | 'sleeping' {
  const now = new Date()
  now.setUTCHours(utcHour, 0, 0, 0)
  const localHour = parseInt(
    new Intl.DateTimeFormat('en-US', { timeZone: loc.timezone, hour: '2-digit', hour12: false }).format(now)
  )
  if (localHour >= loc.workStart && localHour < loc.workEnd) return 'available'
  if ((localHour >= loc.workStart - 2 && localHour < loc.workStart) || (localHour >= loc.workEnd && localHour < loc.workEnd + 3)) return 'edge'
  return 'sleeping'
}

function isOverlapHour(locations: LocationWithTime[], utcHour: number): boolean {
  return locations.every(loc => getHourStatus(loc, utcHour) === 'available')
}

export function OverlapView() {
  const navigate = useNavigate()
  const { locations, userTimezone } = useStore()
  const [enriched, setEnriched] = useState<LocationWithTime[]>([])
  const [overlap, setOverlap] = useState<OverlapWindow | null>(null)

  useEffect(() => {
    const e = locations.map(l => enrichLocation(l, userTimezone))
    setEnriched(e)
    setOverlap(computeOverlap(locations))
  }, [locations, userTimezone])

  const currentUTCHour = new Date().getUTCHours()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', background: '#0F172A' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '20px 20px 12px' }}>
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
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#F8FAFC' }}>Overlap Intelligence</div>
          <div style={{ fontSize: 11, color: '#475569' }}>Working hours across all zones</div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 32px' }}>
        {enriched.length < 2 ? (
          <div style={{ textAlign: 'center', color: '#475569', padding: '60px 20px', fontSize: 14 }}>
            Add at least 2 locations to see overlap analysis.
          </div>
        ) : (
          <>
            {/* Timeline Grid */}
            <div style={{
              background: '#1E293B',
              borderRadius: 16,
              padding: '16px 0',
              marginBottom: 16,
              overflowX: 'auto',
            }}>
              {/* Hour labels */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: `80px repeat(24, 28px)`,
                gap: 0,
                paddingLeft: 12,
                marginBottom: 4,
              }}>
                <div />
                {HOURS.map(h => (
                  <div key={h} style={{
                    fontSize: 9,
                    color: h === currentUTCHour ? 'var(--color-primary)' : '#475569',
                    textAlign: 'center',
                    fontWeight: h === currentUTCHour ? 700 : 400,
                  }}>
                    {h}
                  </div>
                ))}
              </div>

              {/* Location rows */}
              {enriched.map(loc => (
                <div key={loc.id} style={{
                  display: 'grid',
                  gridTemplateColumns: `80px repeat(24, 28px)`,
                  gap: 0,
                  paddingLeft: 12,
                  marginBottom: 4,
                  alignItems: 'center',
                }}>
                  <div style={{ fontSize: 11, color: '#94A3B8', display: 'flex', alignItems: 'center', gap: 4, paddingRight: 6 }}>
                    <span style={{ fontSize: 14 }}>{flagEmoji(loc.countryCode)}</span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 50 }}>
                      {loc.city}
                    </span>
                  </div>
                  {HOURS.map(h => {
                    const s = getHourStatus(loc, h)
                    const isNow = h === currentUTCHour
                    return (
                      <div
                        key={h}
                        style={{
                          height: 20,
                          background: statusColor[s],
                          opacity: s === 'sleeping' ? 0.25 : 0.85,
                          borderRadius: 3,
                          margin: '0 1px',
                          outline: isNow ? '2px solid var(--color-primary)' : 'none',
                          outlineOffset: 1,
                        }}
                        title={`UTC ${h}:00 — ${s}`}
                      />
                    )
                  })}
                </div>
              ))}

              {/* Overlap row */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: `80px repeat(24, 28px)`,
                gap: 0,
                paddingLeft: 12,
                marginTop: 8,
                paddingTop: 8,
                borderTop: '1px solid #334155',
                alignItems: 'center',
              }}>
                <div style={{ fontSize: 10, color: '#64748B', fontWeight: 600 }}>OVERLAP</div>
                {HOURS.map(h => {
                  const isOv = isOverlapHour(enriched, h)
                  const isNow = h === currentUTCHour
                  return (
                    <div key={h} style={{
                      height: 20,
                      background: isOv ? 'var(--color-primary)' : 'transparent',
                      borderRadius: 3,
                      margin: '0 1px',
                      outline: isNow ? '2px solid #60A5FA' : 'none',
                      outlineOffset: 1,
                    }} />
                  )
                })}
              </div>
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
              {[
                { color: '#22C55E', label: 'Available' },
                { color: '#F59E0B', label: 'Edge Hours' },
                { color: '#EF4444', label: 'Sleeping' },
                { color: 'var(--color-primary)', label: 'Overlap' },
              ].map(({ color, label }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 12, height: 12, borderRadius: 3, background: color }} />
                  <span style={{ fontSize: 11, color: '#94A3B8' }}>{label}</span>
                </div>
              ))}
            </div>

            {/* Overlap Summary */}
            {overlap && overlap.durationHours > 0 ? (
              <div style={{
                background: '#1E293B',
                borderRadius: 16,
                padding: '16px',
                border: '1px solid #334155',
                marginBottom: 16,
              }}>
                <div style={{ fontSize: 11, color: '#64748B', marginBottom: 8 }}>Best Overlap Window</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-primary)' }}>
                      {overlap.durationHours}h window
                    </div>
                    <div style={{ fontSize: 12, color: '#64748B' }}>
                      UTC {overlap.startUTC}:00 – {overlap.endUTC}:00
                    </div>
                  </div>
                  <div style={{
                    background: 'color-mix(in srgb, var(--color-primary) 15%, #0F172A)',
                    borderRadius: 12,
                    padding: '8px 14px',
                    textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-primary)' }}>{overlap.qualityScore}%</div>
                    <div style={{ fontSize: 10, color: '#64748B' }}>Quality</div>
                  </div>
                </div>
                {overlap.localTimes.map(lt => (
                  <div key={lt.locationId} style={{
                    display: 'flex', justifyContent: 'space-between',
                    padding: '8px 0',
                    borderTop: '1px solid #334155',
                  }}>
                    <span style={{ fontSize: 13, color: '#94A3B8' }}>{lt.city}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#F8FAFC' }}>
                      {lt.start} – {lt.end}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                background: '#1E293B',
                borderRadius: 16,
                padding: '20px',
                textAlign: 'center',
                border: '1px solid #7f1d1d40',
              }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>⚠️</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#EF4444' }}>No working hour overlap found</div>
                <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>
                  Consider scheduling across multiple days or adjusting work hours.
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
