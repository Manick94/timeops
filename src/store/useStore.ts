import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Location } from '../lib/types'
import { getUserTimezone } from '../lib/timezone'
import { PRESET_CITIES } from '../lib/cities'

export type ThemeKey = 'blue' | 'orange' | 'green' | 'yellow' | 'purple' | 'rose'

export const THEMES: Record<ThemeKey, { label: string; primary: string; light: string; bg: string; card: string }> = {
  blue:   { label: 'Blue',   primary: '#3B82F6', light: '#DBEAFE', bg: '#0F172A', card: '#1E293B' },
  orange: { label: 'Orange', primary: '#F97316', light: '#FFEDD5', bg: '#1C0F08', card: '#2A1810' },
  green:  { label: 'Green',  primary: '#22C55E', light: '#DCFCE7', bg: '#071A0E', card: '#0F2B18' },
  yellow: { label: 'Yellow', primary: '#EAB308', light: '#FEF9C3', bg: '#18160A', card: '#25220E' },
  purple: { label: 'Purple', primary: '#A855F7', light: '#F3E8FF', bg: '#130B1F', card: '#1E1130' },
  rose:   { label: 'Rose',   primary: '#F43F5E', light: '#FFE4E6', bg: '#1C080C', card: '#2A0F15' },
}

export const DESKTOP_LIGHT = {
  bg: '#EFEFED', card: '#FFFFFF', text: '#111111',
  textSecondary: '#888888', border: '#D8D8D6', input: '#E2E2E0',
}
export const DESKTOP_DARK = {
  bg: '#0D1117', card: '#161B22', text: '#F0F6FC',
  textSecondary: '#8B949E', border: '#30363D', input: '#21262D',
}

interface AppState {
  locations: Location[]
  userTimezone: string
  theme: ThemeKey
  desktopDark: boolean
  addLocation: (loc: Location) => void
  removeLocation: (id: string) => void
  hasLocation: (id: string) => boolean
  setTheme: (t: ThemeKey) => void
  toggleDesktopDark: () => void
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      locations: [PRESET_CITIES[0], PRESET_CITIES[5], PRESET_CITIES[7]],
      userTimezone: getUserTimezone(),
      theme: 'blue',
      desktopDark: false,
      addLocation: (loc) => set(s => ({ locations: [...s.locations, loc] })),
      removeLocation: (id) => set(s => ({ locations: s.locations.filter(l => l.id !== id) })),
      hasLocation: (id) => get().locations.some(l => l.id === id),
      setTheme: (t) => set({ theme: t }),
      toggleDesktopDark: () => set(s => ({ desktopDark: !s.desktopDark })),
    }),
    { name: 'timeops-storage' }
  )
)
