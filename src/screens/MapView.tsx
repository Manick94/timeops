import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { PRESET_CITIES, flagEmoji } from '../lib/cities'
import { enrichLocation } from '../lib/timezone'
import type { CityWithCoords } from '../lib/cities'
import type { LocationWithTime } from '../lib/types'
import { StatusDot } from '../components/StatusDot'

// ─── Day/night terminator ────────────────────────────────────────────────────

function getSolarDeclination(date: Date): number {
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000)
  return -23.45 * Math.cos((2 * Math.PI / 365) * (dayOfYear + 10))
}

function buildNightGeoJSON(): object {
  const now = new Date()
  const decl = getSolarDeclination(now)
  const utcHour = now.getUTCHours() + now.getUTCMinutes() / 60
  const noonLng = -((utcHour - 12) / 24) * 360

  const coords: [number, number][] = []

  for (let lat = 89; lat >= -89; lat -= 1) {
    const latRad  = (lat * Math.PI) / 180
    const declRad = (decl * Math.PI) / 180
    const cosH    = -Math.tan(latRad) * Math.tan(declRad)
    const H       = cosH <= -1 ? 180 : cosH >= 1 ? 0 : (Math.acos(cosH) * 180) / Math.PI
    const lng     = ((noonLng + H + 540) % 360) - 180
    coords.push([lng, lat])
  }
  for (let lat = -89; lat <= 89; lat += 1) {
    const latRad  = (lat * Math.PI) / 180
    const declRad = (decl * Math.PI) / 180
    const cosH    = -Math.tan(latRad) * Math.tan(declRad)
    const H       = cosH <= -1 ? 180 : cosH >= 1 ? 0 : (Math.acos(cosH) * 180) / Math.PI
    const lng     = ((noonLng - H + 540) % 360) - 180
    coords.push([lng, lat])
  }
  coords.push(coords[0]) // close ring

  return {
    type: 'Feature',
    properties: { name: 'night' },
    geometry: { type: 'Polygon', coordinates: [coords] },
  }
}

// ─── Haversine nearest-city ──────────────────────────────────────────────────

function nearest(lat: number, lng: number): CityWithCoords {
  let best = PRESET_CITIES[0]
  let bestDist = Infinity
  for (const c of PRESET_CITIES) {
    const dLat = (c.lat - lat) * Math.PI / 180
    const dLng = (c.lng - lng) * Math.PI / 180
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat * Math.PI / 180) * Math.cos(c.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2
    const d = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    if (d < bestDist) { bestDist = d; best = c }
  }
  return best
}

const STATUS_COLOR: Record<string, string> = {
  available: '#22C55E',
  edge:      '#F59E0B',
  sleeping:  '#EF4444',
}

// ─── Globe type shim ─────────────────────────────────────────────────────────
// globe.gl ships CJS; we import it dynamically to avoid SSR issues.

type GlobeInstance = {
  (el: HTMLElement): GlobeInstance
  width: (n: number) => GlobeInstance
  height: (n: number) => GlobeInstance
  backgroundColor: (c: string) => GlobeInstance
  globeImageUrl: (url: string) => GlobeInstance
  bumpImageUrl: (url: string) => GlobeInstance
  atmosphereColor: (c: string) => GlobeInstance
  atmosphereAltitude: (n: number) => GlobeInstance
  pointsData: (d: object[]) => GlobeInstance
  pointLat: (f: string | ((d: object) => number)) => GlobeInstance
  pointLng: (f: string | ((d: object) => number)) => GlobeInstance
  pointColor: (f: (d: object) => string) => GlobeInstance
  pointRadius: (f: number | ((d: object) => number)) => GlobeInstance
  pointAltitude: (n: number | ((d: object) => number)) => GlobeInstance
  pointResolution: (n: number) => GlobeInstance
  pointLabel: (f: (d: object) => string) => GlobeInstance
  ringsData: (d: object[]) => GlobeInstance
  ringLat: (f: string | ((d: object) => number)) => GlobeInstance
  ringLng: (f: string | ((d: object) => number)) => GlobeInstance
  ringColor: (f: (d: object) => (t: number) => string) => GlobeInstance
  ringMaxRadius: (n: number) => GlobeInstance
  ringPropagationSpeed: (n: number) => GlobeInstance
  ringRepeatPeriod: (n: number) => GlobeInstance
  labelsData: (d: object[]) => GlobeInstance
  labelLat: (f: string) => GlobeInstance
  labelLng: (f: string) => GlobeInstance
  labelText: (f: (d: object) => string) => GlobeInstance
  labelColor: (f: () => string) => GlobeInstance
  labelSize: (n: number) => GlobeInstance
  labelDotRadius: (n: number) => GlobeInstance
  labelAltitude: (n: number) => GlobeInstance
  labelResolution: (n: number) => GlobeInstance
  polygonsData: (d: object[]) => GlobeInstance
  polygonCapColor: (f: (d: object) => string) => GlobeInstance
  polygonSideColor: (f: (d: object) => string) => GlobeInstance
  polygonStrokeColor: (f: (d: object) => string) => GlobeInstance
  polygonAltitude: (n: number) => GlobeInstance
  onPointClick: (f: (d: object, e: MouseEvent) => void) => GlobeInstance
  onGlobeClick: (f: (coords: { lat: number; lng: number }, e: MouseEvent) => void) => GlobeInstance
  controls: () => { autoRotate: boolean; autoRotateSpeed: number; enableZoom: boolean }
  scene: () => object
  camera: () => object
  _destructor?: () => void
}

// ─── Component ───────────────────────────────────────────────────────────────

export function MapView() {
  const navigate = useNavigate()
  const { locations, userTimezone, addLocation, removeLocation, hasLocation } = useStore()
  const containerRef = useRef<HTMLDivElement>(null)
  const mountRef     = useRef<HTMLDivElement | null>(null) // globe.gl owns this div; React never touches it
  const globeRef     = useRef<GlobeInstance | null>(null)
  const [enriched, setEnriched]     = useState<(LocationWithTime & { lat: number; lng: number })[]>([])
  const [selected, setSelected]     = useState<CityWithCoords | null>(null)
  const [selEnriched, setSelEnriched] = useState<LocationWithTime | null>(null)
  const [ready, setReady]           = useState(false)

  // Rebuild enriched list every 30s
  useEffect(() => {
    const update = () => setEnriched(
      locations.map(l => {
        const p = PRESET_CITIES.find(c => c.id === l.id)
        if (!p) return null
        return { ...enrichLocation(l, userTimezone), lat: p.lat, lng: p.lng }
      }).filter(Boolean) as (LocationWithTime & { lat: number; lng: number })[]
    )
    update()
    const t = setInterval(update, 30000)
    return () => clearInterval(t)
  }, [locations, userTimezone])

  // Pick a city and show its panel
  const selectCity = useCallback((city: CityWithCoords) => {
    setSelected(city)
    setSelEnriched(enrichLocation(city, userTimezone))
  }, [userTimezone])

  // Init globe.gl
  useEffect(() => {
    if (!containerRef.current) return
    let mounted = true

    // Create a dedicated mount div that globe.gl fully owns.
    // React never renders children into containerRef, so there's no removeChild conflict.
    const mountDiv = document.createElement('div')
    mountDiv.style.cssText = 'width:100%;height:100%;'
    containerRef.current.appendChild(mountDiv)
    mountRef.current = mountDiv

    import('globe.gl').then(mod => {
      if (!mounted || !mountRef.current) return
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const GlobeFn = (mod.default ?? mod) as any
      const el = mountRef.current

      const globe = GlobeFn()(el) as GlobeInstance
      const w = el.clientWidth  || containerRef.current!.clientWidth
      const h = el.clientHeight || containerRef.current!.clientHeight

      // ── Base globe — world-cities style ──────────────────────────────
      globe
        .width(w).height(h)
        .backgroundColor('#000008')
        .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-night.jpg')
        .bumpImageUrl('https://unpkg.com/three-globe/example/img/earth-topology.png')
        .atmosphereColor('#1a6aff')
        .atmosphereAltitude(0.18)

      // ── Night polygon overlay (subtle — night texture already shows darkness) ──
      globe
        .polygonsData([buildNightGeoJSON()])
        .polygonCapColor(() => 'rgba(0,0,15,0.25)')
        .polygonSideColor(() => 'transparent')
        .polygonStrokeColor(() => 'transparent')
        .polygonAltitude(0.001)

      // ── City spikes (world-cities style: altitude = status indicator) ──
      globe
        .pointsData([...PRESET_CITIES])
        .pointLat('lat')
        .pointLng('lng')
        .pointColor((d: object) => STATUS_COLOR[enrichLocation(d as CityWithCoords, userTimezone).status])
        .pointAltitude((d: object) => {
          const c = d as CityWithCoords
          if (!locations.some(l => l.id === c.id)) return 0.01
          const s = enrichLocation(c, userTimezone).status
          return s === 'available' ? 0.12 : s === 'edge' ? 0.07 : 0.04
        })
        .pointRadius((d: object) => locations.some(l => l.id === (d as CityWithCoords).id) ? 0.45 : 0.22)
        .pointResolution(12)
        .pointLabel((d: object) => {
          const c = d as CityWithCoords
          const e = enrichLocation(c, userTimezone)
          return (
            '<div style="background:rgba(0,0,0,0.75);padding:6px 10px;border-radius:8px;font-family:Inter,sans-serif;font-size:12px;color:#fff;border:1px solid rgba(255,255,255,0.15)">' +
            flagEmoji(c.countryCode) + ' <b>' + c.city + '</b>' +
            '<br/><span style="color:#94A3B8">' + e.timeString + '</span>' +
            '<br/><span style="color:' + STATUS_COLOR[e.status] + '">' + e.status + '</span>' +
            '</div>'
          )
        })

      // ── Animated rings for dashboard cities ──────────────────────────
      const addedCities = PRESET_CITIES.filter(c => locations.some(l => l.id === c.id))
      globe
        .ringsData(addedCities)
        .ringLat('lat')
        .ringLng('lng')
        .ringColor((d: object) => {
          const color = STATUS_COLOR[enrichLocation(d as CityWithCoords, userTimezone).status]
          // fade from full color → transparent
          return (t: number) => color + Math.round((1 - t) * 255).toString(16).padStart(2, '0')
        })
        .ringMaxRadius(4)
        .ringPropagationSpeed(1.5)
        .ringRepeatPeriod(1200)

      // ── Labels for dashboard cities ───────────────────────────────────
      globe
        .labelsData(addedCities)
        .labelLat('lat')
        .labelLng('lng')
        .labelText((d: object) => {
          const c = d as CityWithCoords
          const e = enrichLocation(c, userTimezone)
          return c.city + '  ' + e.timeString
        })
        .labelColor(() => 'rgba(255,255,255,0.9)')
        .labelSize(0.5)
        .labelDotRadius(0.35)
        .labelAltitude(0.015)
        .labelResolution(3)

      // ── Interactions ──────────────────────────────────────────────────
      globe.onPointClick((d: object) => selectCity(d as CityWithCoords))
      globe.onGlobeClick(({ lat, lng }: { lat: number; lng: number }) => selectCity(nearest(lat, lng)))

      // No auto-spin
      globe.controls().autoRotate  = false
      globe.controls().enableZoom  = true

      globeRef.current = globe
      setReady(true)

      // Update night polygon every minute
      const nightTimer = setInterval(() => {
        globe.polygonsData([buildNightGeoJSON()])
      }, 60000)

      return () => clearInterval(nightTimer)
    })

    return () => {
      mounted = false
      // Remove the mount div we created — safe because React never knew about it
      mountDiv.remove()
      mountRef.current = null
      globeRef.current = null
    }
  }, []) // intentionally run once; updates via reactive useEffect below

  // Reactively sync points when locations or enriched data changes
  useEffect(() => {
    if (!globeRef.current) return
    const g = globeRef.current
    g.pointsData([...PRESET_CITIES])
      .pointColor((d: object) => {
        const c = d as CityWithCoords
        const e = enrichLocation(c, userTimezone)
        return STATUS_COLOR[e.status]
      })
      .pointRadius((d: object) => {
        const c = d as CityWithCoords
        return locations.some(l => l.id === c.id) ? 0.55 : 0.3
      })
    g.labelsData(PRESET_CITIES.filter(c => locations.some(l => l.id === c.id)))
  }, [locations, enriched, userTimezone])

  // Resize observer — watches the outer container, resizes the globe
  useEffect(() => {
    if (!containerRef.current) return
    const ro = new ResizeObserver(([entry]) => {
      globeRef.current?.width(entry.contentRect.width).height(entry.contentRect.height)
    })
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [ready])

  const addedIds = new Set(locations.map(l => l.id))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', background: 'var(--color-bg)' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '20px 20px 12px', flexShrink: 0 }}>
        <button onClick={() => navigate('/')}
          style={{ background: 'var(--color-card)', border: 'none', borderRadius: 10, width: 36, height: 36, color: '#94A3B8', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >‹</button>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#F8FAFC' }}>World Map</div>
          <div style={{ fontSize: 11, color: '#475569' }}>3D globe · live day/night · tap anywhere</div>
        </div>
      </div>

      {/* Globe wrapper — loading overlay is a sibling, not a child, so React never touches the globe's div */}
      <div style={{ margin: '0 16px', borderRadius: 20, overflow: 'hidden', flexShrink: 0, position: 'relative', height: window.innerWidth >= 900 ? 520 : 340 }}>
        {/* React renders this loading text; it gets replaced by 'display:none' once ready */}
        {!ready && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontSize: 14, background: 'radial-gradient(ellipse at center, #0a1628 0%, #040810 100%)', zIndex: 1 }}>
            Loading globe…
          </div>
        )}
        {/* containerRef div: React renders NO children here — globe.gl appends its own canvas via mountDiv */}
        <div
          ref={containerRef}
          style={{ width: '100%', height: '100%', background: 'radial-gradient(ellipse at center, #0a1628 0%, #040810 100%)' }}
        />
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, padding: '10px 20px', flexWrap: 'wrap', alignItems: 'center' }}>
        {[
          { color: '#22C55E', label: 'Available' },
          { color: '#F59E0B', label: 'Edge Hours' },
          { color: '#EF4444', label: 'Sleeping' },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
            <span style={{ fontSize: 11, color: '#94A3B8' }}>{label}</span>
          </div>
        ))}
        <div style={{ marginLeft: 'auto', fontSize: 11, color: '#475569' }}>🌙 Night shadow live · drag to rotate · scroll to zoom</div>
      </div>

      {/* Selected city panel */}
      {selected && selEnriched && (
        <div style={{
          margin: '0 16px 12px',
          background: 'var(--color-card)',
          borderRadius: 16,
          padding: '16px',
          border: '1px solid #334155',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          animation: 'slideUp 0.2s ease',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 36 }}>{flagEmoji(selected.countryCode)}</span>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#F8FAFC' }}>{selected.city}</div>
              <div style={{ fontSize: 12, color: '#64748B' }}>{selected.country} · {selected.timezone}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 5 }}>
                <StatusDot status={selEnriched.status} showLabel />
                <span style={{ fontSize: 14, color: '#F8FAFC', fontWeight: 700 }}>{selEnriched.timeString}</span>
                <span style={{ fontSize: 12, color: '#475569' }}>
                  {selEnriched.diffHours === 0
                    ? '(your zone)'
                    : (selEnriched.diffHours > 0 ? '+' : '') + selEnriched.diffHours + 'h from you'}
                </span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
            <button onClick={() => setSelected(null)}
              style={{ background: 'transparent', border: '1px solid #334155', borderRadius: 10, padding: '9px 14px', fontSize: 13, color: '#64748B', cursor: 'pointer' }}
            >✕</button>
            {hasLocation(selected.id) ? (
              <button onClick={() => { removeLocation(selected.id); setSelected(null) }}
                style={{ background: '#7f1d1d30', color: '#EF4444', border: '1px solid #EF444440', borderRadius: 10, padding: '10px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >Remove</button>
            ) : (
              <button onClick={() => { addLocation(selected); setSelected(null) }}
                style={{ background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >+ Add to Dashboard</button>
            )}
          </div>
        </div>
      )}

      {/* City grid */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 16px 32px' }}>
        <div style={{ fontSize: 11, color: '#475569', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>
          All Cities — tap to select
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth >= 900 ? 'repeat(5,1fr)' : 'repeat(2,1fr)', gap: 8 }}>
          {PRESET_CITIES.map(city => {
            const e = enriched.find(l => l.id === city.id)
            const isAdded = addedIds.has(city.id)
            const dotColor = e ? STATUS_COLOR[e.status] : '#64748B'
            return (
              <div key={city.id} onClick={() => selectCity(city)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: 'var(--color-card)', borderRadius: 12, cursor: 'pointer', border: isAdded ? '1px solid ' + dotColor + '50' : '1px solid transparent' }}
              >
                <span style={{ fontSize: 18, flexShrink: 0 }}>{flagEmoji(city.countryCode)}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#F8FAFC', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{city.city}</div>
                  {e && <div style={{ fontSize: 10, color: '#64748B' }}>{e.timeString}</div>}
                </div>
                {isAdded && <div style={{ width: 6, height: 6, borderRadius: '50%', background: dotColor, flexShrink: 0 }} />}
              </div>
            )
          })}
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
