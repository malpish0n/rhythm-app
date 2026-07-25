import { motion } from 'motion/react'
import { Calendar, CalendarDays, CalendarRange } from 'lucide-react'
import { sliderSpring } from '@renderer/lib/motionPresets'
import type { CalendarFormat } from '@renderer/state/store'

const FORMATS: { format: CalendarFormat; icon: typeof Calendar; label: string }[] = [
  { format: 'day', icon: CalendarDays, label: 'Day view' },
  { format: 'week', icon: CalendarRange, label: 'Week view' },
  { format: 'month', icon: Calendar, label: 'Month view' }
]

interface CalendarFormatSwitcherProps {
  format: CalendarFormat
  onChange: (format: CalendarFormat) => void
}

export function CalendarFormatSwitcher({
  format,
  onChange
}: CalendarFormatSwitcherProps): JSX.Element {
  return (
    <div className="flex gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-1">
      {FORMATS.map(({ format: f, icon: Icon, label }) => {
        const isActive = format === f
        return (
          <button
            key={f}
            onClick={() => onChange(f)}
            className="relative flex h-7 w-7 items-center justify-center rounded-md transition-colors"
            style={{ color: isActive ? 'white' : 'var(--text-muted)' }}
            aria-label={label}
          >
            {isActive && (
              <motion.span
                layoutId="activeCalendarFormat"
                transition={sliderSpring}
                className="absolute inset-0 rounded-md bg-[var(--accent)]"
              />
            )}
            <Icon size={14} className="relative" />
          </button>
        )
      })}
    </div>
  )
}
