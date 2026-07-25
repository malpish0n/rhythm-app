import { useState } from 'react'
import { motion } from 'motion/react'
import { Minus, Plus } from 'lucide-react'
import { fastSpring } from '@renderer/lib/motionPresets'
import type { PlanFrequency } from '@shared/types'

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export interface RecurrenceValue {
  frequency: PlanFrequency
  interval: number
  weekdays: number[]
}

interface RecurrencePickerProps {
  initialDate: string // 'YYYY-MM-DD' the day this was opened from — seeds the default weekday
  initial?: RecurrenceValue
  onSave: (value: RecurrenceValue) => void
  onCancel: () => void
}

export function RecurrencePicker({
  initialDate,
  initial,
  onSave,
  onCancel
}: RecurrencePickerProps): JSX.Element {
  const defaultWeekday = new Date(initialDate + 'T00:00:00').getDay()

  const [frequency, setFrequency] = useState<PlanFrequency>(initial?.frequency ?? 'weekly')
  const [interval, setInterval] = useState(initial?.interval ?? 1)
  const [weekdays, setWeekdays] = useState<number[]>(initial?.weekdays ?? [defaultWeekday])

  const toggleWeekday = (day: number): void => {
    setWeekdays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    )
  }

  const canSave = frequency === 'daily' || weekdays.length > 0

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3">
      <div className="flex gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-1">
        {(['weekly', 'daily'] as PlanFrequency[]).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFrequency(f)}
            className="flex-1 rounded-md py-1 text-xs font-medium capitalize transition-colors"
            style={{
              backgroundColor: frequency === f ? 'var(--accent)' : 'transparent',
              color: frequency === f ? 'white' : 'var(--text-muted)'
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {frequency === 'weekly' && (
        <div className="flex justify-between gap-1">
          {WEEKDAY_LABELS.map((label, day) => {
            const selected = weekdays.includes(day)
            return (
              <button
                key={day}
                type="button"
                onClick={() => toggleWeekday(day)}
                className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition-colors"
                style={{
                  backgroundColor: selected ? 'var(--accent)' : 'var(--surface)',
                  color: selected ? 'white' : 'var(--text-muted)'
                }}
              >
                {label}
              </button>
            )
          })}
        </div>
      )}

      <div className="flex items-center gap-2">
        <span className="text-xs text-[var(--text-muted)]">
          Every {interval} {frequency === 'daily' ? 'day(s)' : 'week(s)'}
        </span>
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => setInterval((v) => Math.max(1, v - 1))}
            className="flex h-6 w-6 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface)] text-[var(--text)]"
            aria-label="Decrease interval"
          >
            <Minus size={12} />
          </button>
          <span className="w-5 text-center text-xs font-medium tabular-nums">{interval}</span>
          <button
            type="button"
            onClick={() => setInterval((v) => Math.min(12, v + 1))}
            className="flex h-6 w-6 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface)] text-[var(--text)]"
            aria-label="Increase interval"
          >
            <Plus size={12} />
          </button>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-3 py-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text)]"
        >
          Cancel
        </button>
        <motion.button
          type="button"
          whileHover={{ scale: canSave ? 1.03 : 1 }}
          whileTap={{ scale: canSave ? 0.97 : 1 }}
          transition={fastSpring}
          disabled={!canSave}
          onClick={() => onSave({ frequency, interval, weekdays })}
          className="rounded-lg px-3 py-1.5 text-xs font-medium text-white shadow-elevation-sm transition-shadow hover:shadow-elevation-md disabled:opacity-40 disabled:shadow-none active:shadow-none"
          style={{
            backgroundImage:
              'linear-gradient(180deg, color-mix(in srgb, var(--accent) 92%, white), var(--accent))'
          }}
        >
          Save
        </motion.button>
      </div>
    </div>
  )
}
