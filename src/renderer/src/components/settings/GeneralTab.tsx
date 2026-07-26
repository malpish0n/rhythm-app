import { motion } from 'motion/react'
import { useAppStore } from '@renderer/state/store'
import { sliderSpring } from '@renderer/lib/motionPresets'
import { SegmentedControl, type SegmentedOption } from '@renderer/components/ui/SegmentedControl'
import type { TimeFormat } from '@renderer/lib/time'

const TIME_FORMATS: SegmentedOption<TimeFormat>[] = [
  { value: 'system', label: 'System' },
  { value: '12h', label: '12h' },
  { value: '24h', label: '24h' }
]

const SHORTCUTS: { keys: string; description: string }[] = [
  { keys: '⌘K / Ctrl+K', description: 'Open search & commands' },
  { keys: '↑ / ↓', description: 'Navigate results in the palette' },
  { keys: '↵', description: 'Run the highlighted command' },
  { keys: 'Esc', description: 'Close the palette or a dialog' }
]

export function GeneralTab(): JSX.Element {
  const reduceMotion = useAppStore((s) => s.reduceMotion)
  const setReduceMotion = useAppStore((s) => s.setReduceMotion)
  const timeFormat = useAppStore((s) => s.timeFormat)
  const setTimeFormat = useAppStore((s) => s.setTimeFormat)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-4 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-4">
        <div>
          <p className="text-sm font-medium">Reduce motion</p>
          <p className="mt-0.5 text-xs text-[var(--text-muted)]">
            Turn off animations throughout the app, regardless of your system setting.
          </p>
        </div>
        <button
          role="switch"
          aria-checked={reduceMotion}
          onClick={() => setReduceMotion(!reduceMotion)}
          className="relative h-6 w-11 flex-shrink-0 rounded-full transition-colors"
          style={{ backgroundColor: reduceMotion ? 'var(--accent)' : 'var(--border)' }}
        >
          <motion.span
            layout
            transition={sliderSpring}
            className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-elevation-sm"
            style={{ left: reduceMotion ? '22px' : '2px' }}
          />
        </button>
      </div>

      <div className="flex items-start justify-between gap-4 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-4">
        <div>
          <p className="text-sm font-medium">Time format</p>
          <p className="mt-0.5 text-xs text-[var(--text-muted)]">
            Used for hours in the Day and Week views. "System" follows your OS preference.
          </p>
        </div>
        <SegmentedControl
          layoutId="timeFormat"
          size="sm"
          className="bg-[var(--surface)]"
          options={TIME_FORMATS}
          value={timeFormat}
          onChange={setTimeFormat}
        />
      </div>

      <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-4">
        <p className="mb-2 text-sm font-medium">Keyboard shortcuts</p>
        <div className="flex flex-col gap-1.5">
          {SHORTCUTS.map((s) => (
            <div key={s.keys} className="flex items-center justify-between gap-3 text-xs">
              <span className="text-[var(--text-muted)]">{s.description}</span>
              <span className="flex-shrink-0 rounded border border-[var(--border)] bg-[var(--surface)] px-1.5 py-0.5 font-medium">
                {s.keys}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
