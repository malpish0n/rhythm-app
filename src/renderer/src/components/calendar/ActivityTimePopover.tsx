import { useState } from 'react'
import { motion } from 'motion/react'
import { Minus, Plus } from 'lucide-react'
import { fastSpring } from '@renderer/lib/motionPresets'
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
const UNIT_LABELS: Record<(typeof FREQUENCIES)[number], string> = {
  daily: 'day',
  weekly: 'week',
  monthly: 'month'
}

export interface RepeatValue {
  frequency: (typeof FREQUENCIES)[number]
  interval: number
  weekdays: number[]
}

export interface ActivityTimeValue {
  time: string | null
  endTime: string | null
  note: string | null
  repeat: RepeatValue | null
}

interface ActivityTimePopoverProps {
  initialDate: string // 'YYYY-MM-DD' — seeds the default weekday for Repeat
  initial?: ActivityTimeValue
  saveLabel?: string
  allowRepeat?: boolean
  onSave: (value: ActivityTimeValue) => void
  onCancel: () => void
}

function ToggleRow({
  label,
  checked,
  onChange
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}): JSX.Element {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-[var(--text-muted)]">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className="relative h-5 w-9 flex-shrink-0 rounded-full transition-colors"
        style={{ backgroundColor: checked ? 'var(--accent)' : 'var(--border)' }}
      >
        <motion.span
          layout
          transition={fastSpring}
          className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-elevation-sm"
          style={{ left: checked ? '18px' : '2px' }}
        />
      </button>
    </div>
  )
}

export function ActivityTimePopover({
  initialDate,
  initial,
  saveLabel = 'Add',
  allowRepeat = true,
  onSave,
  onCancel
}: ActivityTimePopoverProps): JSX.Element {
  const defaultWeekday = new Date(initialDate + 'T00:00:00').getDay()

  const [includeTime, setIncludeTime] = useState(!!initial?.time)
  const [time, setTime] = useState(initial?.time ?? '09:00')
  const [includeEndTime, setIncludeEndTime] = useState(!!initial?.endTime)
  const [endTime, setEndTime] = useState(initial?.endTime ?? '10:00')
  const [note, setNote] = useState(initial?.note ?? '')

  const [repeatOn, setRepeatOn] = useState(!!initial?.repeat)
  const [frequency, setFrequency] = useState<(typeof FREQUENCIES)[number]>(
    initial?.repeat?.frequency ?? 'weekly'
  )
  const [interval, setInterval] = useState(initial?.repeat?.interval ?? 1)
  const [weekdays, setWeekdays] = useState<number[]>(
    initial?.repeat?.weekdays ?? [defaultWeekday]
  )

  const toggleWeekday = (day: number): void => {
    setWeekdays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    )
  }

  const timeValid = !includeTime || !includeEndTime || time < endTime
  const repeatValid = !repeatOn || frequency !== 'weekly' || weekdays.length > 0
  const canSave = timeValid && repeatValid

  const handleSave = (): void => {
    onSave({
      time: includeTime ? time : null,
      endTime: includeTime && includeEndTime ? endTime : null,
      note: note.trim() || null,
      repeat: repeatOn ? { frequency, interval, weekdays } : null
    })
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3">
      <ToggleRow label="Include time" checked={includeTime} onChange={setIncludeTime} />

      {includeTime && (
        <>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-[var(--accent)]"
          />

          <ToggleRow label="End time" checked={includeEndTime} onChange={setIncludeEndTime} />

          {includeEndTime && (
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
          )}
          {!timeValid && <p className="text-[10px] text-red-500">End time must be after start time.</p>}
        </>
      )}

      {allowRepeat && (
        <div className="flex flex-col gap-3 border-t border-[var(--border)] pt-3">
        <ToggleRow label="Repeat" checked={repeatOn} onChange={setRepeatOn} />

        {repeatOn && (
          <>
            <div className="flex gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-1">
              {FREQUENCIES.map((f) => (
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

            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--text-muted)]">
                Every {interval} {UNIT_LABELS[frequency]}
                {interval > 1 ? 's' : ''}
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
          </>
        )}
      </div>
      )}

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Add a note (optional)"
        rows={2}
        className="resize-none rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-xs outline-none focus:ring-2 focus:ring-[var(--accent)]"
      />

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
          className="rounded-lg px-3 py-1.5 text-xs font-medium text-white shadow-elevation-sm transition-shadow hover:shadow-elevation-md disabled:opacity-40 disabled:shadow-none active:shadow-none"
          style={{
            backgroundImage:
              'linear-gradient(180deg, color-mix(in srgb, var(--accent) 92%, white), var(--accent))'
          }}
        >
          {saveLabel}
        </motion.button>
      </div>
    </div>
  )
}
