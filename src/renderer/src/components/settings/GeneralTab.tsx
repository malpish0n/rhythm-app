import { motion } from 'motion/react'
import { useAppStore } from '@renderer/state/store'
import { sliderSpring } from '@renderer/lib/motionPresets'
import type { TimeFormat } from '@renderer/lib/time'

const TIME_FORMATS: { id: TimeFormat; label: string }[] = [
  { id: 'system', label: 'System' },
  { id: '12h', label: '12h' },
  { id: '24h', label: '24h' }
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
        <div className="flex flex-shrink-0 gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-1">
          {TIME_FORMATS.map((f) => (
            <button
              key={f.id}
              onClick={() => setTimeFormat(f.id)}
              className="rounded-md px-2.5 py-1 text-xs font-medium transition-colors"
              style={{
                backgroundColor: timeFormat === f.id ? 'var(--accent)' : 'transparent',
                color: timeFormat === f.id ? 'white' : 'var(--text-muted)'
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
