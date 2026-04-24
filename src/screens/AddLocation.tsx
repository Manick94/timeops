import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { PRESET_CITIES, flagEmoji } from '../lib/cities'
import { enrichLocation } from '../lib/timezone'
import { StatusDot } from '../components/StatusDot'

export function AddLocation() {
  const navigate = useNavigate()
  const { userTimezone, addLocation, removeLocation, hasLocation, hour12 } = useStore()
  const [query, setQuery] = useState('')

  const filtered = PRESET_CITIES.filter(c =>
    query.trim() === '' ||
    c.city.toLowerCase().includes(query.toLowerCase()) ||
    c.country.toLowerCase().includes(query.toLowerCase()) ||
    c.timezone.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', background: '#0F172A' }}>
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
          <div style={{ fontSize: 16, fontWeight: 700, color: '#F8FAFC' }}>Add Location</div>
          <div style={{ fontSize: 11, color: '#475569' }}>Search cities & timezones</div>
        </div>
      </div>

      {/* Search */}
      <div style={{ padding: '0 16px 12px' }}>
        <div style={{ position: 'relative' }}>
          <span style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            fontSize: 16, color: '#475569',
          }}>🔍</span>
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search city, country or timezone..."
            style={{
              width: '100%',
              background: '#1E293B',
              border: '1px solid #334155',
              borderRadius: 12,
              padding: '12px 12px 12px 38px',
              color: '#F8FAFC',
              fontSize: 14,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 80px' }}>
        {filtered.map(city => {
          const enriched = enrichLocation(city, userTimezone, hour12)
          const added = hasLocation(city.id)

          return (
            <div
              key={city.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                marginBottom: 8,
                background: '#1E293B',
                borderRadius: 14,
                border: added ? '1px solid #22C55E40' : '1px solid #334155',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 24 }}>{flagEmoji(city.countryCode)}</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#F8FAFC' }}>{city.city}</div>
                  <div style={{ fontSize: 11, color: '#64748B' }}>{city.country} · {city.timezone}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                    <StatusDot status={enriched.status} showLabel />
                    <span style={{ fontSize: 11, color: '#64748B' }}>· {enriched.timeString}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  if (added) removeLocation(city.id)
                  else addLocation(city)
                }}
                style={{
                  background: added ? '#16532730' : 'var(--color-primary)',
                  color: added ? '#22C55E' : '#fff',
                  border: added ? '1px solid #22C55E50' : 'none',
                  borderRadius: 10,
                  padding: '8px 14px',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                {added ? '✓ Added' : '+ Add'}
              </button>
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', color: '#475569', padding: '40px 20px', fontSize: 14 }}>
            No cities found for "{query}"
          </div>
        )}
      </div>
    </div>
  )
}
