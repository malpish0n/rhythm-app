import { motion } from 'motion/react'
import { Check } from 'lucide-react'
import { useAppStore } from '@renderer/state/store'
import { THEMES } from '@renderer/lib/themes'
import { FONTS } from '@renderer/lib/fonts'
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
            className="absolute inset-0 flex items-center justify-center bg-black/30"
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
  onSelect
}: {
  name: string
  colors: { bg: string; surface: string; accent: string; text: string }
  selected: boolean
  onSelect: () => void
}): JSX.Element {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex w-full flex-col items-center gap-1.5"
      aria-label={`Theme: ${name}`}
    >
      <div
        className="relative grid h-11 w-11 flex-shrink-0 grid-cols-2 grid-rows-2 overflow-hidden rounded-lg border border-[var(--border)] shadow-elevation-sm"
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
            className="absolute inset-0 flex items-center justify-center bg-black/30"
          >
            <Check size={16} className="text-white" />
          </motion.div>
        )}
      </div>
      <span className="line-clamp-2 h-7 w-full text-center text-[10px] leading-tight text-[var(--text-muted)]">
        {name}
      </span>
    </button>
  )
}

export function AppearanceTab(): JSX.Element {
  const themeId = useAppStore((s) => s.themeId)
  const setThemeId = useAppStore((s) => s.setThemeId)
  const fontId = useAppStore((s) => s.fontId)
  const setFontId = useAppStore((s) => s.setFontId)
  const dockIconStyle = useAppStore((s) => s.dockIconStyle)
  const setDockIconStyle = useAppStore((s) => s.setDockIconStyle)

  const select = (id: string): void => {
    setThemeId(id)
    window.api.app.setTheme(id)
  }

  const selectIcon = (id: DockIconStyle): void => {
    setDockIconStyle(id)
    window.api.app.setDockIconStyle(id)
  }

  const darkThemes = THEMES.filter((t) => t.isDark)
  const lightThemes = THEMES.filter((t) => !t.isDark)

  return (
    <div>
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
            onSelect={() => select(t.id)}
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
            onSelect={() => select(t.id)}
          />
        ))}
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
