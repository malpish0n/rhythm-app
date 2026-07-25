import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Check, ChevronDown, Pencil } from 'lucide-react'
import { useAppStore } from '@renderer/state/store'
import { fastSpring, fade } from '@renderer/lib/motionPresets'
import type { ThemeColors } from '@renderer/lib/themes'

const FIELDS: { key: keyof ThemeColors; label: string; description: string }[] = [
  { key: 'bg', label: 'Background', description: 'Main app background' },
  { key: 'surface', label: 'Surface', description: 'Cards, sidebar, modals' },
  { key: 'surface2', label: 'Surface (hover)', description: 'Hovered rows, secondary panels' },
  { key: 'border', label: 'Border', description: 'Dividers and outlines' },
  { key: 'text', label: 'Text', description: 'Main text color' },
  { key: 'textMuted', label: 'Muted text', description: 'Secondary and placeholder text' },
  { key: 'accent', label: 'Accent', description: 'Buttons, active states, links' }
]

export function CustomThemeSection(): JSX.Element {
  const themeId = useAppStore((s) => s.themeId)
  const setThemeId = useAppStore((s) => s.setThemeId)
  const colors = useAppStore((s) => s.customThemeColors)
  const setColor = useAppStore((s) => s.setCustomThemeColor)
  const isDark = useAppStore((s) => s.customThemeIsDark)
  const setIsDark = useAppStore((s) => s.setCustomThemeIsDark)
  const [editing, setEditing] = useState(false)

  const isActive = themeId === 'custom'

  const select = (): void => {
    setThemeId('custom')
    window.api.app.setTheme('custom')
  }

  return (
    <div>
      <p className="mb-2 text-[10px] font-medium uppercase tracking-wide text-[var(--text-muted)]">
        Custom
      </p>
      <div className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3">
        <button
          type="button"
          onClick={select}
          aria-label="Use custom theme"
          className="relative grid h-11 w-11 flex-shrink-0 grid-cols-2 grid-rows-2 overflow-hidden rounded-lg border border-[var(--border)] shadow-elevation-sm"
          style={{
            boxShadow: isActive
              ? `0 0 0 2px var(--surface), 0 0 0 4px ${colors.accent}, var(--shadow-sm)`
              : undefined
          }}
        >
          <div style={{ backgroundColor: colors.bg }} />
          <div style={{ backgroundColor: colors.surface }} />
          <div style={{ backgroundColor: colors.text }} />
          <div style={{ backgroundColor: colors.accent }} />
          {isActive && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={fastSpring}
              className="absolute inset-0 flex items-center justify-center bg-black/30"
            >
              <Check size={16} className="text-white" />
            </motion.div>
          )}
        </button>

        <div className="flex-1">
          <p className="text-sm font-medium">Your theme</p>
          <p className="text-xs text-[var(--text-muted)]">Pick your own colors below</p>
        </div>

        <button
          type="button"
          onClick={() => setEditing((v) => !v)}
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-[var(--surface)] hover:text-[var(--text)]"
          aria-label={editing ? 'Collapse editor' : 'Edit custom theme'}
        >
          {editing ? <ChevronDown size={16} /> : <Pencil size={15} />}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {editing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={fade}
            className="overflow-hidden"
          >
            <div className="mt-3 flex flex-col gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium">Base mode</p>
                <div className="flex gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-1">
                  {(['dark', 'light'] as const).map((mode) => {
                    const active = (isDark ? 'dark' : 'light') === mode
                    return (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setIsDark(mode === 'dark')}
                        className="rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors"
                        style={{
                          backgroundColor: active ? 'var(--accent)' : 'transparent',
                          color: active ? 'white' : 'var(--text-muted)'
                        }}
                      >
                        {mode}
                      </button>
                    )
                  })}
                </div>
              </div>

              {FIELDS.map((field) => (
                <div
                  key={field.key}
                  className="flex items-center justify-between gap-3 border-t border-[var(--border)] py-2 first:border-t-0"
                >
                  <div>
                    <p className="text-sm">{field.label}</p>
                    <p className="text-xs text-[var(--text-muted)]">{field.description}</p>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-2">
                    <span className="text-xs tabular-nums text-[var(--text-muted)]">
                      {colors[field.key]}
                    </span>
                    <input
                      type="color"
                      value={colors[field.key]}
                      onChange={(e) => setColor(field.key, e.target.value)}
                      className="color-swatch-input shadow-elevation-sm"
                      aria-label={`${field.label} color`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
