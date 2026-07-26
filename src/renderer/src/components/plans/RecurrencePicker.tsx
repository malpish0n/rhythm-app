import { useState } from 'react'
import { motion } from 'motion/react'
import { Minus, Plus } from 'lucide-react'
import { fastSpring } from '@renderer/lib/motionPresets'
import { Tooltip } from '@renderer/components/ui/Tooltip'
import { SegmentedControl, type SegmentedOption } from '@renderer/components/ui/SegmentedControl'
import type { PlanFrequency } from '@shared/types'

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const WEEKDAY_PRESETS: { label: string; days: number[] }[] = [
  { label: 'Every day', days: [0, 1, 2, 3, 4, 5, 6] },
  { label: 'Weekdays', days: [1, 2, 3, 4, 5] },
  { label: 'Weekend', days: [0, 6] }
]
const FREQUENCIES: Extract<PlanFrequency, 'daily' | 'weekly' | 'monthly'>[] = [
  'daily',
  'weekly',
  'monthly'
]
const FREQUENCY_OPTIONS: SegmentedOption<(typeof FREQUENCIES)[number]>[] = FREQUENCIES.map((f) => ({
  value: f,
  label: f
}))
const UNIT_LABELS: Record<(typeof FREQUENCIES)[number], string> = {
  daily: 'day',
  weekly: 'week',
  monthly: 'month'
}

export interface RecurrenceValue {
  frequency: PlanFrequency
  interval: number
  weekdays: number[]
  allDay: boolean
  startTime: string | null
  endTime: string | null
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

  const [frequency, setFrequency] = useState<(typeof FREQUENCIES)[number]>(
    initial && initial.frequency !== 'once' ? initial.frequency : 'weekly'
  )
  const [interval, setInterval] = useState(initial?.interval ?? 1)
  const [weekdays, setWeekdays] = useState<number[]>(initial?.weekdays ?? [defaultWeekday])
  const [allDay, setAllDay] = useState(initial?.allDay ?? true)
  const [startTime, setStartTime] = useState(initial?.startTime ?? '09:00')
  const [endTime, setEndTime] = useState(initial?.endTime ?? '10:00')

  const toggleWeekday = (day: number): void => {
    setWeekdays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    )
  }

  const timeValid = allDay || startTime < endTime
  const canSave = (frequency !== 'weekly' || weekdays.length > 0) && timeValid

  const handleSave = (): void => {
    onSave({
      frequency,
      interval,
      weekdays,
      allDay,
      startTime: allDay ? null : startTime,
      endTime: allDay ? null : endTime
    })
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3">
      <SegmentedControl
        layoutId="recurrenceFrequency"
        size="sm"
        className="bg-[var(--surface)]"
        fullWidth
        capitalizeLabels
        options={FREQUENCY_OPTIONS}
        value={frequency}
        onChange={setFrequency}
      />

      <div className="flex items-center gap-2">
        <span className="text-xs text-[var(--text-muted)]">
          Every {interval} {UNIT_LABELS[frequency]}
          {interval > 1 ? 's' : ''}
        </span>
        <div className="ml-auto flex items-center gap-1">
          <Tooltip label="Decrease interval">
            <button
              type="button"
              onClick={() => setInterval((v) => Math.max(1, v - 1))}
              className="flex h-6 w-6 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface)] text-[var(--text)]"
              aria-label="Decrease interval"
            >
              <Minus size={12} />
            </button>
          </Tooltip>
          <span className="w-5 text-center text-xs font-medium tabular-nums">{interval}</span>
          <Tooltip label="Increase interval">
            <button
              type="button"
              onClick={() => setInterval((v) => Math.min(12, v + 1))}
              className="flex h-6 w-6 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface)] text-[var(--text)]"
              aria-label="Increase interval"
            >
              <Plus size={12} />
            </button>
          </Tooltip>
        </div>
      </div>

      {frequency === 'weekly' && (
        <>
          <div className="flex gap-1">
            {WEEKDAY_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => setWeekdays(preset.days)}
                className="flex-1 rounded-md border border-[var(--border)] py-1 text-[10px] font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--surface)] hover:text-[var(--text)]"
              >
                {preset.label}
              </button>
            ))}
          </div>
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
        </>
      )}

      <div className="flex flex-col gap-2 border-t border-[var(--border)] pt-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--text-muted)]">All day</span>
          <button
            type="button"
            role="switch"
            aria-checked={allDay}
            onClick={() => setAllDay((v) => !v)}
            className="relative h-5 w-9 flex-shrink-0 rounded-full transition-colors"
            style={{ backgroundColor: allDay ? 'var(--accent)' : 'var(--border)' }}
          >
            <motion.span
              layout
              transition={fastSpring}
              className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-elevation-sm"
              style={{ left: allDay ? '18px' : '2px' }}
            />
          </button>
        </div>

        {!allDay && (
          <div className="flex items-center gap-2">
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="flex-1 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
            <span className="text-xs text-[var(--text-muted)]">to</span>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="flex-1 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
          </div>
        )}
        {!allDay && !timeValid && (
          <p className="text-[10px] text-red-500">End time must be after start time.</p>
        )}
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
          onClick={handleSave}
          className="accent-gradient rounded-lg px-3 py-1.5 text-xs font-medium text-white shadow-elevation-sm transition-shadow hover:shadow-elevation-md disabled:opacity-40 disabled:shadow-none active:shadow-none"
        >
          Save
        </motion.button>
      </div>
    </div>
  )
}
