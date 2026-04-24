import 'leaflet/dist/leaflet.css'
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

// Returns [lat, lng][] Leaflet polygon for the night hemisphere.
// Algorithm: for each longitude compute terminator lat via solar zenith = 90°,
// then close with the pole that is in perpetual night (south pole in NH summer, north in NH winter).
function buildLeafletTerminator(): [number, number][] {
  const now = new Date()
  const decl = getSolarDeclination(now)
  const declRad = decl * Math.PI / 180
  const utcHour = now.getUTCHours() + now.getUTCMinutes() / 60
  const subSolarLng = -((utcHour - 12) / 24) * 360

  const term: [number, number][] = []
  for (let lngDeg = -180; lngDeg <= 180; lngDeg++) {
    const HA = (lngDeg - subSolarLng) * Math.PI / 180
    const sinDecl = Math.sin(declRad)
    let latDeg: number
    if (Math.abs(sinDecl) < 1e-6) {
      latDeg = Math.cos(HA) >= 0 ? -89 : 89
    } else {
      latDeg = Math.atan(-Math.cos(declRad) * Math.cos(HA) / sinDecl) * 180 / Math.PI
    }
    term.push([Math.max(-89, Math.min(89, latDeg)), lngDeg])
  }

  // decl >= 0 → south pole in night; decl < 0 → north pole in night
  const pole = decl >= 0 ? -90 : 90
  return [...term, [pole, 180], [pole, -180], term[0]]
}

function buildNightGeoJSON() {
  const term = buildLeafletTerminator()
  // Convert [lat,lng][] → GeoJSON [lng,lat][] coords
  const coords = term.map(([lat, lng]) => [lng, lat])
  return { type: 'Feature', geometry: { type: 'Polygon', coordinates: [coords] }, properties: {} }
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

// ─── 2D Leaflet Map ──────────────────────────────────────────────────────────

interface FlatMapProps {
  onCitySelect: (city: CityWithCoords) => void
  addedIds: Set<string>
  userTimezone: string
  hour12: boolean
}

function FlatMap2D({ onCitySelect, addedIds, userTimezone, hour12 }: FlatMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null)
  const [isLooking, setIsLooking] = useState(false)
  const [lookError, setLookError] = useState('')

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    let mounted = true

    import('leaflet').then(L => {
      if (!mounted || !containerRef.current) return
      // @types/leaflet exports directly; at runtime ESM may wrap in .default
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const Leaflet = ((L as any).default ?? L) as typeof L

      const worldBounds = Leaflet.latLngBounds([-90, -180], [90, 180])
      const map = Leaflet.map(containerRef.current!, {
        center: [20, 0],
        zoom: 2,
        minZoom: 2,
        maxZoom: 18,
        zoomControl: true,
        maxBounds: worldBounds,
        maxBoundsViscosity: 1.0,
        worldCopyJump: false,
      })

      Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" style="color:#6366F1">OpenStreetMap</a>',
        maxZoom: 19,
        noWrap: true,
      }).addTo(map)

      // Proper night hemisphere polygon
      const nightPoly = Leaflet.polygon(buildLeafletTerminator(), {
        color: 'transparent', fillColor: '#0a1628', fillOpacity: 0.42,
        weight: 0, interactive: false,
      }).addTo(map)
      const nightTimer = setInterval(() => nightPoly.setLatLngs(buildLeafletTerminator()), 60000)

      // Store timer cleanup alongside map removal
      const origRemove = map.remove.bind(map)
      ;(map as any).remove = () => { clearInterval(nightTimer); origRemove() }

      // Plot all preset cities
      PRESET_CITIES.forEach(city => {
        const isAdded = addedIds.has(city.id)
        const e = enrichLocation(city, userTimezone, hour12)
        const color = STATUS_COLOR[e.status]
        const marker = Leaflet.circleMarker([city.lat, city.lng], {
          radius: isAdded ? 8 : 5,
          fillColor: isAdded ? color : '#475569',
          color: isAdded ? color : '#334155',
          weight: 1.5,
          opacity: 1,
          fillOpacity: isAdded ? 0.9 : 0.6,
        })
        marker.bindTooltip(
          `<b>${flagEmoji(city.countryCode)} ${city.city}</b><br/><span style="color:${color}">${e.timeString} · ${e.status}</span>`,
          { direction: 'top', className: 'leaflet-tooltip-dark' }
        )
        marker.on('click', (ev: L.LeafletEvent) => {
          const le = ev as L.LeafletMouseEvent
          Leaflet.DomEvent.stopPropagation(le)
          onCitySelect(city)
        })
        marker.addTo(map)
      })

      // Click anywhere on map → reverse geocode + timezone lookup
      map.on('click', async (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng
        setIsLooking(true)
        setLookError('')

        // Temporary pin
        const pin = Leaflet.circleMarker([lat, lng], {
          radius: 10, fillColor: '#6366F1', color: '#fff', weight: 2, fillOpacity: 0.8,
        }).addTo(map)

        try {
          const [nominatimRes, tzRes] = await Promise.all([
            fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`, {
              headers: { 'Accept-Language': 'en', 'User-Agent': 'TimeOps-PWA/1.0' },
            }),
            fetch(`https://timeapi.io/api/timezone/coordinate?latitude=${lat}&longitude=${lng}`),
          ])
          const [nominatim, tzData] = await Promise.all([nominatimRes.json(), tzRes.json()])

          const addr = nominatim.address || {}
          const cityName =
            addr.city || addr.town || addr.village || addr.hamlet ||
            addr.county || addr.state || nominatim.name || `${lat.toFixed(2)}, ${lng.toFixed(2)}`
          const countryCode = (addr.country_code || 'XX').toUpperCase()
          const country = addr.country || 'Unknown'
          const timezone: string = tzData.timeZone

          if (!timezone) throw new Error('No timezone data')

          pin.setStyle({ fillColor: STATUS_COLOR[enrichLocation({ id: '', city: cityName, country, countryCode, timezone, workStart: 9, workEnd: 18 }, userTimezone, hour12).status] })

          onCitySelect({
            id: `custom_${Math.round(lat * 100)}_${Math.round(lng * 100)}`,
            city: cityName,
            country,
            countryCode,
            timezone,
            lat,
            lng,
            workStart: 9,
            workEnd: 18,
          })
        } catch {
          setLookError('Could not look up this location')
          pin.setStyle({ fillColor: '#EF4444' })
          setTimeout(() => pin.remove(), 2000)
        } finally {
          setIsLooking(false)
          setTimeout(() => pin.remove(), 5000)
        }
      })

      mapRef.current = map
    })

    return () => {
      mounted = false
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      {isLooking && (
        <div style={{
          position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(15,23,42,0.92)', color: '#94A3B8',
          padding: '8px 18px', borderRadius: 20, fontSize: 12, zIndex: 1000,
          border: '1px solid #334155', whiteSpace: 'nowrap',
        }}>
          Looking up location…
        </div>
      )}
      {lookError && (
        <div style={{
          position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
          background: '#7f1d1d', color: '#FCA5A5',
          padding: '8px 18px', borderRadius: 20, fontSize: 12, zIndex: 1000,
          whiteSpace: 'nowrap',
        }}>
          {lookError}
        </div>
      )}
      <div style={{
        position: 'absolute', top: 10, right: 10, zIndex: 1000,
        background: 'rgba(15,23,42,0.85)', color: '#64748B',
        padding: '6px 12px', borderRadius: 12, fontSize: 10,
        border: '1px solid #334155',
      }}>
        Tap preset dot · click anywhere for any location
      </div>
      <style>{`
        .leaflet-tooltip-dark {
          background: rgba(15,23,42,0.95) !important;
          border: 1px solid #334155 !important;
          color: #F8FAFC !important;
          border-radius: 8px !important;
          font-family: Inter, sans-serif !important;
          font-size: 12px !important;
          padding: 6px 10px !important;
        }
        .leaflet-tooltip-dark::before { border-top-color: #334155 !important; }
        .leaflet-container { background: #0F172A !important; }
      `}</style>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function MapView() {
  const navigate = useNavigate()
  const { locations, userTimezone, addLocation, removeLocation, hasLocation, hour12 } = useStore()
  const containerRef = useRef<HTMLDivElement>(null)
  const mountRef     = useRef<HTMLDivElement | null>(null)
  const globeRef     = useRef<GlobeInstance | null>(null)
  const [enriched, setEnriched]       = useState<(LocationWithTime & { lat: number; lng: number })[]>([])
  const [selected, setSelected]       = useState<CityWithCoords | null>(null)
  const [selEnriched, setSelEnriched] = useState<LocationWithTime | null>(null)
  const [ready, setReady]             = useState(false)
  const [is2D, setIs2D]               = useState(true)

  const mapHeight = window.innerWidth >= 900 ? 520 : 340

  // Rebuild enriched list every 30s
  useEffect(() => {
    const update = () => setEnriched(
      locations.map(l => {
        const p = PRESET_CITIES.find(c => c.id === l.id)
        if (!p) return null
        return { ...enrichLocation(l, userTimezone, hour12), lat: p.lat, lng: p.lng }
      }).filter(Boolean) as (LocationWithTime & { lat: number; lng: number })[]
    )
    update()
    const t = setInterval(update, 30000)
    return () => clearInterval(t)
  }, [locations, userTimezone])

  const selectCity = useCallback((city: CityWithCoords) => {
    setSelected(city)
    setSelEnriched(enrichLocation(city, userTimezone, hour12))
  }, [userTimezone])

  // Init globe.gl (only mounts once)
  useEffect(() => {
    if (!containerRef.current) return
    let mounted = true

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

      globe
        .width(w).height(h)
        .backgroundColor('#000008')
        .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
        .bumpImageUrl('https://unpkg.com/three-globe/example/img/earth-topology.png')
        .atmosphereColor('#4a90ff')
        .atmosphereAltitude(0.22)

      globe
        .polygonsData([buildNightGeoJSON()])
        .polygonCapColor(() => 'rgba(0,0,15,0.25)')
        .polygonSideColor(() => 'transparent')
        .polygonStrokeColor(() => 'transparent')
        .polygonAltitude(0.001)

      globe
        .pointsData([...PRESET_CITIES])
        .pointLat('lat')
        .pointLng('lng')
        .pointColor((d: object) => STATUS_COLOR[enrichLocation(d as CityWithCoords, userTimezone, hour12).status])
        .pointAltitude((d: object) => {
          const c = d as CityWithCoords
          if (!locations.some(l => l.id === c.id)) return 0.01
          const s = enrichLocation(c, userTimezone, hour12).status
          return s === 'available' ? 0.12 : s === 'edge' ? 0.07 : 0.04
        })
        .pointRadius((d: object) => locations.some(l => l.id === (d as CityWithCoords).id) ? 0.45 : 0.22)
        .pointResolution(12)
        .pointLabel((d: object) => {
          const c = d as CityWithCoords
          const e = enrichLocation(c, userTimezone, hour12)
          return (
            '<div style="background:rgba(0,0,0,0.75);padding:6px 10px;border-radius:8px;font-family:Inter,sans-serif;font-size:12px;color:#fff;border:1px solid rgba(255,255,255,0.15)">' +
            flagEmoji(c.countryCode) + ' <b>' + c.city + '</b>' +
            '<br/><span style="color:#94A3B8">' + e.timeString + '</span>' +
            '<br/><span style="color:' + STATUS_COLOR[e.status] + '">' + e.status + '</span>' +
            '</div>'
          )
        })

      const addedCities = PRESET_CITIES.filter(c => locations.some(l => l.id === c.id))
      globe
        .ringsData(addedCities)
        .ringLat('lat')
        .ringLng('lng')
        .ringColor((d: object) => {
          const color = STATUS_COLOR[enrichLocation(d as CityWithCoords, userTimezone, hour12).status]
          return (t: number) => color + Math.round((1 - t) * 255).toString(16).padStart(2, '0')
        })
        .ringMaxRadius(4)
        .ringPropagationSpeed(1.5)
        .ringRepeatPeriod(1200)

      globe
        .labelsData(addedCities)
        .labelLat('lat')
        .labelLng('lng')
        .labelText((d: object) => {
          const c = d as CityWithCoords
          const e = enrichLocation(c, userTimezone, hour12)
          return c.city + '  ' + e.timeString
        })
        .labelColor(() => 'rgba(255,255,255,0.9)')
        .labelSize(0.5)
        .labelDotRadius(0.35)
        .labelAltitude(0.015)
        .labelResolution(3)

      globe.onPointClick((d: object) => selectCity(d as CityWithCoords))
      globe.onGlobeClick(({ lat, lng }: { lat: number; lng: number }) => selectCity(nearest(lat, lng)))
      globe.controls().autoRotate = false
      globe.controls().enableZoom = true

      globeRef.current = globe
      setReady(true)

      const nightTimer = setInterval(() => globe.polygonsData([buildNightGeoJSON()]), 60000)
      return () => clearInterval(nightTimer)
    })

    return () => {
      mounted = false
      mountDiv.remove()
      mountRef.current = null
      globeRef.current = null
    }
  }, []) // intentionally once

  useEffect(() => {
    if (!globeRef.current) return
    const g = globeRef.current
    g.pointsData([...PRESET_CITIES])
      .pointColor((d: object) => STATUS_COLOR[enrichLocation(d as CityWithCoords, userTimezone, hour12).status])
      .pointRadius((d: object) => locations.some(l => l.id === (d as CityWithCoords).id) ? 0.55 : 0.3)
    g.labelsData(PRESET_CITIES.filter(c => locations.some(l => l.id === c.id)))
  }, [locations, enriched, userTimezone])

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
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#F8FAFC' }}>World Map</div>
          <div style={{ fontSize: 11, color: '#475569' }}>
            {is2D ? 'Click anywhere to look up any city, town or village' : '3D globe · live day/night · tap to select'}
          </div>
        </div>

        {/* 2D / 3D toggle */}
        <div style={{ display: 'flex', background: 'var(--color-card)', borderRadius: 10, padding: 3, gap: 2, flexShrink: 0 }}>
          <button
            onClick={() => setIs2D(false)}
            style={{
              padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600,
              background: !is2D ? 'var(--color-primary)' : 'transparent',
              color: !is2D ? '#fff' : '#64748B', fontSize: 12,
              transition: 'all 0.15s',
            }}
          >
            🌐 3D
          </button>
          <button
            onClick={() => setIs2D(true)}
            style={{
              padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600,
              background: is2D ? 'var(--color-primary)' : 'transparent',
              color: is2D ? '#fff' : '#64748B', fontSize: 12,
              transition: 'all 0.15s',
            }}
          >
            🗺 2D
          </button>
        </div>
      </div>

      {/* Map area */}
      <div style={{ margin: '0 16px', borderRadius: 20, overflow: 'hidden', flexShrink: 0, position: 'relative', height: mapHeight }}>
        {/* ── 3D Globe ── */}
        <div style={{ position: 'absolute', inset: 0, display: is2D ? 'none' : 'block' }}>
          {!ready && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontSize: 14, background: 'radial-gradient(ellipse at center, #0a1628 0%, #040810 100%)', zIndex: 1 }}>
              Loading globe…
            </div>
          )}
          <div
            ref={containerRef}
            style={{ width: '100%', height: '100%', background: 'radial-gradient(ellipse at center, #0a1628 0%, #040810 100%)' }}
          />
        </div>

        {/* ── 2D Leaflet Map ── */}
        {is2D && (
          <div style={{ position: 'absolute', inset: 0 }}>
            <FlatMap2D
              onCitySelect={city => { setSelected(city); setSelEnriched(enrichLocation(city, userTimezone, hour12)) }}
              addedIds={addedIds}
              userTimezone={userTimezone}
              hour12={hour12}
            />
          </div>
        )}
      </div>

      {/* Legend (3D only) */}
      {!is2D && (
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
          <div style={{ marginLeft: 'auto', fontSize: 11, color: '#475569' }}>🌙 Night shadow live · drag to rotate</div>
        </div>
      )}

      {/* Selected city panel */}
      {selected && selEnriched && (
        <div style={{
          margin: '8px 16px 12px',
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
                  {selEnriched.diffHours === 0 ? '(your zone)' : (selEnriched.diffHours > 0 ? '+' : '') + selEnriched.diffHours + 'h from you'}
                </span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, flexShrink: 0, flexDirection: 'column' }}>
            <button onClick={() => setSelected(null)}
              style={{ background: 'transparent', border: '1px solid #334155', borderRadius: 10, padding: '7px 12px', fontSize: 12, color: '#64748B', cursor: 'pointer' }}
            >✕</button>
            {hasLocation(selected.id) ? (
              <button onClick={() => { removeLocation(selected.id); setSelected(null) }}
                style={{ background: '#7f1d1d30', color: '#EF4444', border: '1px solid #EF444440', borderRadius: 10, padding: '8px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
              >Remove</button>
            ) : (
              <button onClick={() => { addLocation(selected); setSelected(null) }}
                style={{ background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 10, padding: '8px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
              >+ Add</button>
            )}
          </div>
        </div>
      )}

      {/* City grid */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 16px 80px' }}>
        <div style={{ fontSize: 11, color: '#475569', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>
          All Cities ({PRESET_CITIES.length}) — tap to select
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
