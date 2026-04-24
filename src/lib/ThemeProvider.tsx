import { useEffect } from 'react'
import { useStore, THEMES, DESKTOP_LIGHT, DESKTOP_DARK } from '../store/useStore'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useStore(s => s.theme)
  const desktopDark = useStore(s => s.desktopDark)

  useEffect(() => {
    const t = THEMES[theme]
    const root = document.documentElement
    // Primary color applies everywhere
    root.style.setProperty('--color-primary', t.primary)
    root.style.setProperty('--color-primary-light', t.light)

    const isDesktop = window.innerWidth >= 900
    if (isDesktop) {
      const d = desktopDark ? DESKTOP_DARK : DESKTOP_LIGHT
      root.style.setProperty('--dt-bg',              d.bg)
      root.style.setProperty('--dt-card',            d.card)
      root.style.setProperty('--dt-text',            d.text)
      root.style.setProperty('--dt-text-secondary',  d.textSecondary)
      root.style.setProperty('--dt-border',          d.border)
      root.style.setProperty('--dt-input',           d.input)
      document.body.style.backgroundColor = d.bg
    } else {
      // Mobile: always dark, theme-tinted
      root.style.setProperty('--color-bg',   t.bg)
      root.style.setProperty('--color-card', t.card)
      document.body.style.backgroundColor = t.bg
    }
  }, [theme, desktopDark])

  return <>{children}</>
}
