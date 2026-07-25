import { motion } from 'motion/react'
import { Check, Laptop, Moon, RotateCcw, Star, Sun } from 'lucide-react'
import { useAppStore } from '@renderer/state/store'
import { THEMES, resolveActiveAccent } from '@renderer/lib/themes'
import { FONTS, DEFAULT_FONT } from '@renderer/lib/fonts'
import { fastSpring, sliderSpring } from '@renderer/lib/motionPresets'
import { CustomThemeSection } from './CustomThemeSection'
import iconLight from '@renderer/assets/icon-round-light.png'
import iconDark from '@renderer/assets/icon-round-dark.png'
import type { DockIconStyle } from '@shared/types'

const APP_ICONS: { id: DockIconStyle; name: string; src: string }[] = [
  { id: 'light', name: 'Light', src: iconLight },
  { id: 'dark', name: 'Dark', src: iconDark }
]

function IconSwatch({
  name,
  src,
  selected,
  onSelect
}: {
  name: string
  src: string
  selected: boolean
  onSelect: () => void
}): JSX.Element {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex flex-col items-center gap-1.5"
      aria-label={`App icon: ${name}`}
    >
      <div
        className="relative h-11 w-11 flex-shrink-0 overflow-hidden rounded-full"
        style={{
          boxShadow: selected
            ? `0 0 0 2px var(--surface), 0 0 0 4px var(--accent)`
            : '0 0 0 1px var(--border)'
        }}
      >
        <img src={src} alt="" className="h-full w-full object-cover" />
        {selected && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={fastSpring}
            className="absolute inset-0 flex items-center justify-center rounded-full bg-black/30"
          >
            <Check size={16} className="text-white" />
          </motion.div>
        )}
      </div>
      <span className="text-[10px] text-[var(--text-muted)]">{name}</span>
    </button>
  )
}

function ThemeSwatch({
  name,
  colors,
  selected,
  isFavorite,
  onSelect,
  onToggleFavorite
}: {
  name: string
  colors: { bg: string; surface: string; accent: string; text: string }
  selected: boolean
  isFavorite: boolean
  onSelect: () => void
  onToggleFavorite: () => void
}): JSX.Element {
  return (
    <div className="group flex w-full flex-col items-center gap-1.5">
      <div className="relative h-11 w-11 flex-shrink-0">
        <button
          type="button"
          onClick={onSelect}
          aria-label={`Theme: ${name}`}
          className="grid h-11 w-11 grid-cols-2 grid-rows-2 overflow-hidden rounded-lg border border-[var(--border)] shadow-elevation-sm"
          style={{
            boxShadow: selected
              ? `0 0 0 2px var(--surface), 0 0 0 4px ${colors.accent}, var(--shadow-sm)`
              : undefined
          }}
        >
          <div style={{ backgroundColor: colors.bg }} />
          <div style={{ backgroundColor: colors.surface }} />
          <div style={{ backgroundColor: colors.text }} />
          <div style={{ backgroundColor: colors.accent }} />
          {selected && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={fastSpring}
              className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/30"
            >
              <Check size={16} className="text-white" />
            </motion.div>
          )}
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onToggleFavorite()
          }}
          aria-label={isFavorite ? `Unfavorite ${name}` : `Favorite ${name}`}
          className="absolute -right-1.5 -top-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-amber-400 opacity-0 transition-opacity group-hover:opacity-100"
          style={isFavorite ? { opacity: 1 } : undefined}
        >
          <Star size={11} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>
      </div>
      <span className="line-clamp-2 h-7 w-full text-center text-[10px] leading-tight text-[var(--text-muted)]">
        {name}
      </span>
    </div>
  )
}

export function AppearanceTab(): JSX.Element {
  const themeId = useAppStore((s) => s.themeId)
  const setThemeId = useAppStore((s) => s.setThemeId)
  const themeMode = useAppStore((s) => s.themeMode)
  const setThemeMode = useAppStore((s) => s.setThemeMode)
  const favoriteThemeIds = useAppStore((s) => s.favoriteThemeIds)
  const toggleFavoriteTheme = useAppStore((s) => s.toggleFavoriteTheme)
  const fontId = useAppStore((s) => s.fontId)
  const setFontId = useAppStore((s) => s.setFontId)
  const dockIconStyle = useAppStore((s) => s.dockIconStyle)
  const setDockIconStyle = useAppStore((s) => s.setDockIconStyle)
  const heatmapColorOverride = useAppStore((s) => s.heatmapColor)
  const setHeatmapColor = useAppStore((s) => s.setHeatmapColor)
  const customAccent = useAppStore((s) => s.customThemeColors.accent)
  const resolvedHeatmapColor = heatmapColorOverride ?? resolveActiveAccent(themeId, customAccent)

  const select = (id: string): void => {
    setThemeId(id)
    setThemeMode('manual')
    window.api.app.setTheme(id)
  }

  const selectSystem = (): void => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setThemeId(prefersDark ? 'rhythm-dark' : 'rhythm-light')
    setThemeMode('system')
    window.api.app.setTheme('system')
  }

  const selectIcon = (id: DockIconStyle): void => {
    setDockIconStyle(id)
    window.api.app.setDockIconStyle(id)
  }

  const resetToDefault = (): void => {
    selectSystem()
    setFontId(DEFAULT_FONT)
    selectIcon('light')
    setHeatmapColor(null)
  }

  const byFavoriteFirst = (a: { id: string }, b: { id: string }): number =>
    Number(favoriteThemeIds.includes(b.id)) - Number(favoriteThemeIds.includes(a.id))

  const darkThemes = THEMES.filter((t) => t.isDark).sort(byFavoriteFirst)
  const lightThemes = THEMES.filter((t) => !t.isDark).sort(byFavoriteFirst)

  const modeOptions = [
    { id: 'system', label: 'System', Icon: Laptop, onClick: selectSystem },
    { id: 'dark', label: 'Dark', Icon: Moon, onClick: () => select('rhythm-dark') },
    { id: 'light', label: 'Light', Icon: Sun, onClick: () => select('rhythm-light') }
  ] as const
  const activeMode =
    themeMode === 'system' ? 'system' : themeId === 'rhythm-dark' ? 'dark' : themeId === 'rhythm-light' ? 'light' : null

  return (
    <div>
      <div className="mb-3 flex items-center justify-end">
        <button
          type="button"
          onClick={resetToDefault}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
        >
          <RotateCcw size={11} />
          Reset to default
        </button>
      </div>

      <div className="mb-6 flex items-center justify-between gap-4 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3">
        <div className="min-w-0">
          <p className="text-sm font-medium">Theme mode</p>
          <p className="mt-0.5 truncate text-xs text-[var(--text-muted)]">
            Dark/Light use Rhythm's base theme
          </p>
        </div>
        <div className="flex flex-shrink-0 gap-0.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-0.5">
          {modeOptions.map(({ id, label, Icon, onClick }) => (
            <button
              key={id}
              onClick={onClick}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors"
              style={{
                backgroundColor: activeMode === id ? 'var(--accent)' : 'transparent',
                color: activeMode === id ? 'white' : 'var(--text-muted)'
              }}
            >
              <Icon size={11} />
              {label}
            </button>
          ))}
        </div>
      </div>

      <p className="mb-2 text-[10px] font-medium uppercase tracking-wide text-[var(--text-muted)]">
        Dark
      </p>
      <div className="mb-5 grid grid-cols-4 gap-3 sm:grid-cols-5">
        {darkThemes.map((t) => (
          <ThemeSwatch
            key={t.id}
            name={t.name}
            colors={t.colors}
            selected={themeId === t.id}
            isFavorite={favoriteThemeIds.includes(t.id)}
            onSelect={() => select(t.id)}
            onToggleFavorite={() => toggleFavoriteTheme(t.id)}
          />
        ))}
      </div>

      <p className="mb-2 text-[10px] font-medium uppercase tracking-wide text-[var(--text-muted)]">
        Light
      </p>
      <div className="mb-6 grid grid-cols-4 gap-3 sm:grid-cols-5">
        {lightThemes.map((t) => (
          <ThemeSwatch
            key={t.id}
            name={t.name}
            colors={t.colors}
            selected={themeId === t.id}
            isFavorite={favoriteThemeIds.includes(t.id)}
            onSelect={() => select(t.id)}
            onToggleFavorite={() => toggleFavoriteTheme(t.id)}
          />
        ))}
      </div>

      <p className="mb-2 text-[10px] font-medium uppercase tracking-wide text-[var(--text-muted)]">
        Activity heatmap
      </p>
      <div className="mb-6 flex items-center justify-between gap-4 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3">
        <div>
          <p className="text-sm font-medium">Heatmap color</p>
          <p className="mt-0.5 text-xs text-[var(--text-muted)]">
            {heatmapColorOverride
              ? 'Custom color for the year activity graph'
              : "Matches your current theme's accent color"}
          </p>
        </div>
        <div className="flex flex-shrink-0 items-center gap-2">
          {heatmapColorOverride && (
            <button
              type="button"
              onClick={() => setHeatmapColor(null)}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--surface)] hover:text-[var(--text)]"
            >
              <RotateCcw size={11} />
              Match theme
            </button>
          )}
          <span className="text-xs tabular-nums text-[var(--text-muted)]">
            {resolvedHeatmapColor}
          </span>
          <input
            type="color"
            value={resolvedHeatmapColor}
            onChange={(e) => setHeatmapColor(e.target.value)}
            className="color-swatch-input shadow-elevation-sm"
            aria-label="Heatmap color"
          />
        </div>
      </div>

      <div className="mb-6">
        <CustomThemeSection />
      </div>

      <p className="mb-2 text-[10px] font-medium uppercase tracking-wide text-[var(--text-muted)]">
        App icon
      </p>
      <div className="mb-6 flex gap-3">
        {APP_ICONS.map((icon) => (
          <IconSwatch
            key={icon.id}
            name={icon.name}
            src={icon.src}
            selected={dockIconStyle === icon.id}
            onSelect={() => selectIcon(icon.id)}
          />
        ))}
      </div>

      <p className="mb-2 text-[10px] font-medium uppercase tracking-wide text-[var(--text-muted)]">
        Typeface
      </p>
      <div className="flex flex-col gap-1">
        {FONTS.map((f) => {
          const isActive = fontId === f.id
          return (
            <button
              key={f.id}
              onClick={() => setFontId(f.id)}
              className={
                isActive
                  ? 'relative flex items-center justify-between rounded-lg px-3 py-2.5 text-white'
                  : 'relative flex items-center justify-between rounded-lg px-3 py-2.5 text-[var(--text)] transition-colors hover:bg-[var(--surface-2)]'
              }
            >
              {isActive && (
                <motion.span
                  layoutId="activeFontOption"
                  transition={sliderSpring}
                  className="absolute inset-0 rounded-lg bg-[var(--accent)] shadow-elevation-sm"
                />
              )}
              <span className="relative text-sm" style={{ fontFamily: f.stack }}>
                {f.name}
              </span>
              {isActive && <Check size={15} className="relative" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
