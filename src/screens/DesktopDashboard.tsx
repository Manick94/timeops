import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { enrichLocation } from '../lib/timezone'
import type { LocationWithTime } from '../lib/types'
import { flagEmoji, PRESET_CITIES } from '../lib/cities'
import { ThemePicker } from '../components/ThemePicker'

function getDayNight(hour: number) {
  return hour >= 6 && hour < 20
    ? { label: 'Day', icon: '☀️' }
    : { label: 'Night', icon: '🌙' }
}

function getUTCOffset(timezone: string): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone, timeZoneName: 'shortOffset',
  }).formatToParts(new Date())
  return (parts.find(p => p.type === 'timeZoneName')?.value ?? '').replace('GMT', 'UTC')
}

function getSunInfo(): string {
  const now = new Date()
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000)
  const seasonOffset = Math.round(Math.sin(((dayOfYear - 80) / 365) * 2 * Math.PI) * 60)
  const rise = 6 * 60 - seasonOffset
  const set  = 18 * 60 + seasonOffset
  const fmt  = (m: number) => String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0')
  return '☀️ ' + fmt(rise) + ' - ' + fmt(set) + ' (' + Math.floor((set - rise) / 60) + 'h ' + ((set - rise) % 60) + 'm)'
}

function liveTime(timezone: string, use24h: boolean, withSecs = false): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: '2-digit', minute: '2-digit',
    ...(withSecs ? { second: '2-digit' } : {}),
    hour12: !use24h,
  }).format(new Date())
}

function liveDate(timezone: string): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: timezone, weekday: 'long', month: 'short', day: 'numeric', year: 'numeric',
  }).format(new Date())
}

export function DesktopDashboard() {
  const navigate = useNavigate()
  const { locations, userTimezone, removeLocation, desktopDark, toggleDesktopDark } = useStore()
  const [enriched, setEnriched]   = useState<LocationWithTime[]>([])
  const [heroTime, setHeroTime]   = useState('')
  const [heroDate, setHeroDate]   = useState('')
  const [use24h, setUse24h]       = useState(true)
  const [search, setSearch]       = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [activeId, setActiveId]   = useState<string | null>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const update = () => {
      setEnriched(locations.map(l => enrichLocation(l, userTimezone)))
      setHeroTime(liveTime(userTimezone, use24h, true))
      setHeroDate(liveDate(userTimezone))
    }
    update()
    const t = setInterval(update, 1000)
    return () => clearInterval(t)
  }, [locations, userTimezone, use24h])

  useEffect(() => {
    if (locations.length > 0 && !activeId) setActiveId(locations[0].id)
  }, [locations, activeId])

  const activeLoc    = enriched.find(l => l.id === activeId) ?? enriched[0]
  const searchResults = search.trim()
    ? PRESET_CITIES.filter(c =>
        c.city.toLowerCase().includes(search.toLowerCase()) ||
        c.country.toLowerCase().includes(search.toLowerCase())
      ).slice(0, 6)
    : []
  const localCity = userTimezone.split('/').pop()?.replace(/_/g, ' ') ?? ''

  // Shorthand CSS var accessors for readability
  const bg     = 'var(--dt-bg)'
  const card   = 'var(--dt-card)'
  const text   = 'var(--dt-text)'
  const textSec= 'var(--dt-text-secondary)'
  const border = 'var(--dt-border)'
  const input  = 'var(--dt-input)'
  const primary= 'var(--color-primary)'

  return (
    <div style={{ minHeight: '100vh', background: bg, color: text, fontFamily: "'Inter', sans-serif", transition: 'background 0.3s, color 0.3s' }}>

      {/* ── Nav ──────────────────────────────────────────────── */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 48px', background: bg, transition: 'background 0.3s' }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 800, fontSize: 18, color: text }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
            ⏱
          </div>
          TimeOps
        </div>

        {/* Search */}
        <div style={{ position: 'relative', flex: 1, maxWidth: 340, margin: '0 40px' }}>
          <div
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: input, borderRadius: 100, padding: '10px 18px', cursor: 'text' }}
            onClick={() => { setShowSearch(true); setTimeout(() => searchRef.current?.focus(), 50) }}
          >
            <span style={{ fontSize: 14, color: textSec }}>🔍</span>
            <input
              ref={searchRef}
              value={search}
              onChange={e => { setSearch(e.target.value); setShowSearch(true) }}
              onFocus={() => setShowSearch(true)}
              onBlur={() => setTimeout(() => setShowSearch(false), 200)}
              placeholder="Search city..."
              style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 14, color: text, width: '100%' }}
            />
          </div>

          {showSearch && searchResults.length > 0 && (
            <div style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0, background: card, borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.16)', overflow: 'hidden', zIndex: 100, border: '1px solid ' + border }}>
              {searchResults.map(c => {
                const e = enrichLocation(c, userTimezone)
                const dn = getDayNight(e.hour)
                return (
                  <div
                    key={c.id}
                    onMouseDown={() => { navigate('/detail/' + c.id); setSearch('') }}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 18px', cursor: 'pointer', borderBottom: '1px solid ' + border }}
                    onMouseEnter={ev => (ev.currentTarget.style.background = input)}
                    onMouseLeave={ev => (ev.currentTarget.style.background = card)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 20 }}>{flagEmoji(c.countryCode)}</span>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: text }}>{c.city}</div>
                        <div style={{ fontSize: 11, color: textSec }}>{c.country}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: text }}>{liveTime(c.timezone, use24h)}</div>
                      <div style={{ fontSize: 11, color: textSec }}>{dn.icon} {dn.label}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <ThemePicker mode={desktopDark ? 'dark' : 'light'} />
          <div style={{ width: 1, height: 20, background: border }} />

          {/* Dark mode toggle */}
          <button
            onClick={toggleDesktopDark}
            title={desktopDark ? 'Switch to light' : 'Switch to dark'}
            style={{
              background: input, border: 'none', borderRadius: 100,
              padding: '7px 14px', cursor: 'pointer', fontSize: 16,
              color: textSec, display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            {desktopDark ? '☀️' : '🌙'}
          </button>

          <div style={{ width: 1, height: 20, background: border }} />

          {[
            { label: '🗺 Map',        path: '/map' },
            { label: '✉️ Templates',  path: '/templates' },
            { label: 'Overlap',       path: '/overlap' },
          ].map(({ label, path }) => (
            <button key={path} onClick={() => navigate(path)}
              style={{ background: 'transparent', border: 'none', fontSize: 14, color: textSec, cursor: 'pointer', fontWeight: 500, padding: '8px 10px', whiteSpace: 'nowrap' }}
            >{label}</button>
          ))}

          <button onClick={() => navigate('/add')}
            style={{ background: primary, color: '#fff', border: 'none', borderRadius: 100, padding: '10px 22px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
          >+ Add City</button>
        </div>
      </nav>

      {/* ── Hero clock ───────────────────────────────────────── */}
      <div style={{ padding: '16px 48px 28px', borderBottom: '1px solid ' + border }}>
        <div style={{ fontSize: 'clamp(72px, 11vw, 156px)', fontWeight: 800, lineHeight: 1, letterSpacing: '-4px', color: text, fontVariantNumeric: 'tabular-nums' }}>
          {heroTime}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
          <span style={{ fontSize: 13, color: textSec, fontWeight: 500 }}>Current · {localCity}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 13, color: textSec, fontWeight: 500 }}>{getSunInfo()}</div>
              <div style={{ fontSize: 13, color: textSec }}>{heroDate}</div>
            </div>
            <div style={{ display: 'flex', background: input, borderRadius: 100, padding: 3 }}>
              {['12h', '24h'].map(opt => (
                <button key={opt} onClick={() => setUse24h(opt === '24h')}
                  style={{
                    background: (opt === '24h') === use24h ? primary : 'transparent',
                    color:      (opt === '24h') === use24h ? '#fff'   : textSec,
                    border: 'none', borderRadius: 100, padding: '6px 16px',
                    fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >{opt}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── City section ─────────────────────────────────────── */}
      <div style={{ padding: '28px 48px 40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
          <div>
            {activeLoc ? (
              <>
                <div style={{ fontSize: 'clamp(28px, 4vw, 52px)', fontWeight: 800, lineHeight: 1.1, color: text }}>{activeLoc.city},</div>
                <div style={{ fontSize: 'clamp(28px, 4vw, 52px)', fontWeight: 800, lineHeight: 1.1, color: text }}>{activeLoc.country}</div>
              </>
            ) : (
              <div style={{ fontSize: 40, fontWeight: 800, color: textSec }}>No locations yet</div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            <p style={{ fontSize: 14, color: textSec, margin: 0, lineHeight: 1.5, maxWidth: 220, textAlign: 'right' }}>
              Life moves fast. Stay on time and enjoy every moment!
            </p>
            <button onClick={() => navigate('/add')}
              style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'transparent', border: 'none', fontSize: 14, fontWeight: 600, color: text, cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              Add Another City
              <span style={{ width: 24, height: 24, borderRadius: '50%', border: '1.5px solid ' + primary, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>+</span>
            </button>
          </div>
        </div>

        {/* City cards */}
        {enriched.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: textSec, fontSize: 15, border: '2px dashed ' + border, borderRadius: 20 }}>
            No locations yet.{' '}
            <span style={{ color: primary, fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate('/add')}>Add your first city</span>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 8 }} className="scrollbar-hide">
            {enriched.map(loc => {
              const isActive = loc.id === (activeId ?? enriched[0]?.id)
              const dn       = getDayNight(loc.hour)
              return (
                <div key={loc.id} onClick={() => setActiveId(loc.id)}
                  style={{
                    flexShrink: 0, width: 220, borderRadius: 20, padding: '20px 22px 22px',
                    background: isActive ? primary : card,
                    color:      isActive ? '#fff'   : text,
                    cursor: 'pointer', transition: 'background 0.2s', position: 'relative',
                    boxShadow: isActive ? '0 4px 24px color-mix(in srgb,' + primary + ' 40%, transparent)' : '0 1px 4px rgba(0,0,0,0.08)',
                    border: isActive ? 'none' : '1px solid ' + border,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                    <div style={{ fontSize: 15, fontWeight: 700 }}>{loc.city}</div>
                    <div style={{ fontSize: 12, color: isActive ? 'rgba(255,255,255,0.65)' : textSec, fontWeight: 500 }}>{getUTCOffset(loc.timezone)}</div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-1px', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
                      {liveTime(loc.timezone, use24h)}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: isActive ? 'rgba(255,255,255,0.7)' : textSec, fontWeight: 500 }}>
                      <span style={{ fontSize: 16 }}>{dn.icon}</span>{dn.label}
                    </div>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); removeLocation(loc.id); if (activeId === loc.id) setActiveId(null) }}
                    className="remove-btn"
                    style={{ position: 'absolute', top: 10, right: 10, background: 'transparent', border: 'none', color: isActive ? 'rgba(255,255,255,0.5)' : textSec, fontSize: 16, cursor: 'pointer', padding: 4, lineHeight: 1, opacity: 0, transition: 'opacity 0.15s' }}
                    title="Remove"
                  >×</button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <style>{`div:hover > .remove-btn, .remove-btn:hover { opacity: 1 !important; }`}</style>
    </div>
  )
}
