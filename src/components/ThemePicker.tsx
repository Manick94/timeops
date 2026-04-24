import { useStore, THEMES, type ThemeKey } from '../store/useStore'

interface Props {
  mode?: 'light' | 'dark'
}

export function ThemePicker({ mode = 'dark' }: Props) {
  const { theme, setTheme } = useStore()

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      {(Object.keys(THEMES) as ThemeKey[]).map(key => {
        const isActive = key === theme
        return (
          <button
            key={key}
            onClick={() => setTheme(key)}
            title={THEMES[key].label}
            style={{
              width: isActive ? 22 : 18,
              height: isActive ? 22 : 18,
              borderRadius: '50%',
              background: THEMES[key].primary,
              border: isActive
                ? `3px solid ${mode === 'dark' ? '#fff' : '#111'}`
                : '2px solid transparent',
              cursor: 'pointer',
              padding: 0,
              outline: 'none',
              transition: 'all 0.15s',
              boxShadow: isActive ? `0 0 0 1px ${THEMES[key].primary}` : 'none',
            }}
          />
        )
      })}
    </div>
  )
}
