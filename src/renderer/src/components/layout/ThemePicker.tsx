import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Check, Palette } from 'lucide-react'
import { useAppStore } from '@renderer/state/store'
import { THEMES } from '@renderer/lib/themes'
import { fade, fastSpring } from '@renderer/lib/motionPresets'

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

interface ThemePickerProps {
  variant?: 'icon' | 'row'
}

export function ThemePicker({ variant = 'icon' }: ThemePickerProps): JSX.Element {
  const themeId = useAppStore((s) => s.themeId)
  const setThemeId = useAppStore((s) => s.setThemeId)
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (e: MouseEvent): void => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  const select = (id: string): void => {
    setThemeId(id)
    window.api.app.setTheme(id)
    setOpen(false)
  }

  const darkThemes = THEMES.filter((t) => t.isDark)
  const lightThemes = THEMES.filter((t) => !t.isDark)

  return (
    <div className="relative" ref={containerRef}>
      {variant === 'icon' ? (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={fastSpring}
          onClick={() => setOpen((o) => !o)}
          aria-label="Choose theme"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text)] shadow-elevation-sm"
        >
          <Palette size={16} />
        </motion.button>
      ) : (
        <button
          onClick={() => setOpen((o) => !o)}
          aria-label="Choose theme"
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
        >
          <Palette size={15} />
          Theme
        </button>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: variant === 'row' ? 4 : -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: variant === 'row' ? 4 : -4 }}
            transition={fade}
            className={
              variant === 'row'
                ? 'glass-surface absolute bottom-full left-0 z-50 mb-2 w-80 max-w-[calc(100vw-2rem)] rounded-xl p-4 shadow-elevation-lg'
                : 'glass-surface absolute right-0 top-11 z-50 w-80 max-w-[calc(100vw-2rem)] rounded-xl p-4 shadow-elevation-lg'
            }
          >
            <div className="max-h-[70vh] overflow-y-auto pr-1">
              <p className="mb-2 text-[10px] font-medium uppercase tracking-wide text-[var(--text-muted)]">
                Dark
              </p>
              <div className="mb-4 grid grid-cols-4 gap-3">
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
              <div className="grid grid-cols-4 gap-3">
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
