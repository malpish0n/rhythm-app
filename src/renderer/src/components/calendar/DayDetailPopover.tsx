import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Plus, Repeat, Trash2, X } from 'lucide-react'
import { useLogEntries } from '@renderer/hooks/useLogEntries'
import { usePlanRules } from '@renderer/hooks/usePlanRules'
import { expandPlanRule } from '@renderer/lib/planRecurrence'
import { getActivityIcon } from '@renderer/lib/icons'
import { RecurrencePicker, type RecurrenceValue } from '@renderer/components/plans/RecurrencePicker'
import { fade } from '@renderer/lib/motionPresets'
import type { Activity, LogEntry } from '@shared/types'

interface DayDetailPopoverProps {
  date: string | null
  activities: Activity[]
  refreshToken: number
  onClose: () => void
}

export function DayDetailPopover({
  date,
  activities,
  refreshToken,
  onClose
}: DayDetailPopoverProps): JSX.Element {
  const { quickAdd, updateEntry } = useLogEntries()
  const { planRules, createPlan, skipOccurrence } = usePlanRules()
  const [entries, setEntries] = useState<LogEntry[]>([])
  const [addPickerOpen, setAddPickerOpen] = useState(false)
  const [recurrenceActivityId, setRecurrenceActivityId] = useState<string | null>(null)
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [noteDraft, setNoteDraft] = useState('')

  useEffect(() => {
    if (!date) return
    window.api.logEntries.listByRange(date, date).then(setEntries)
  }, [date, refreshToken])

  const plannedToday = useMemo(() => {
    if (!date) return []
    const loggedIds = new Set(entries.map((e) => e.activityId))
    return planRules
      .filter((rule) => expandPlanRule(rule, date, date).length > 0)
      .filter((rule) => !loggedIds.has(rule.activityId))
  }, [planRules, date, entries])

  if (!date) return <></>

  const loggedActivityIds = new Set(entries.map((e) => e.activityId))
  const loggableActivities = activities.filter((a) => !loggedActivityIds.has(a.id))

  const formatted = new Date(date + 'T00:00:00').toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })

  const handleDelete = async (id: string): Promise<void> => {
    await window.api.logEntries.delete(id)
    setEntries(await window.api.logEntries.listByRange(date, date))
  }

  const handleAdd = async (activityId: string): Promise<void> => {
    const activity = activities.find((a) => a.id === activityId)
    await quickAdd(activityId, activity?.defaultIncrement ?? 1, date)
    setEntries(await window.api.logEntries.listByRange(date, date))
    setAddPickerOpen(false)
  }

  const handleSaveRecurrence = async (activityId: string, value: RecurrenceValue): Promise<void> => {
    await createPlan({
      activityId,
      frequency: value.frequency,
      startDate: date,
      interval: value.interval,
      weekdays: value.frequency === 'weekly' ? value.weekdays : undefined
    })
    setRecurrenceActivityId(null)
    setAddPickerOpen(false)
  }

  const saveNote = async (id: string): Promise<void> => {
    await updateEntry(id, { note: noteDraft.trim() || null })
    setEditingNoteId(null)
    setEntries(await window.api.logEntries.listByRange(date, date))
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={fade}
        className="fixed inset-0 z-40 flex items-center justify-center bg-black/40"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={fade}
          onClick={(e) => e.stopPropagation()}
          className="glass-surface w-full max-w-sm rounded-2xl p-4 sm:p-6 shadow-elevation-lg"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold">{formatted}</h2>
            <button
              onClick={onClose}
              className="rounded-md p-1 text-[var(--text-muted)] hover:text-[var(--text)]"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex max-h-72 flex-col gap-2 overflow-y-auto">
            {entries.length === 0 && plannedToday.length === 0 && (
              <p className="py-2 text-center text-sm text-[var(--text-muted)]">
                No activity logged this day.
              </p>
            )}
            {entries.map((entry) => {
              const activity = activities.find((a) => a.id === entry.activityId)
              if (!activity) return null
              const Icon = getActivityIcon(activity.icon)
              return (
                <div
                  key={entry.id}
                  className="flex flex-col gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                      style={{ backgroundColor: activity.color }}
                    />
                    {Icon && <Icon size={13} className="text-[var(--text-muted)]" />}
                    <span className="flex-1 text-sm">{activity.name}</span>
                    <span className="text-xs font-medium tabular-nums text-[var(--text-muted)]">
                      +{entry.count}
                    </span>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="rounded-md p-1 text-[var(--text-muted)] hover:text-red-500"
                      aria-label="Delete entry"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                  {editingNoteId === entry.id ? (
                    <div className="flex gap-1.5">
                      <input
                        autoFocus
                        value={noteDraft}
                        onChange={(e) => setNoteDraft(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && saveNote(entry.id)}
                        onBlur={() => saveNote(entry.id)}
                        className="flex-1 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-[var(--accent)]"
                      />
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingNoteId(entry.id)
                        setNoteDraft(entry.note ?? '')
                      }}
                      className="text-left text-xs text-[var(--text-muted)] hover:text-[var(--text)]"
                    >
                      {entry.note || 'Add a note…'}
                    </button>
                  )}
                </div>
              )
            })}

            {plannedToday.map((rule) => {
              const activity = activities.find((a) => a.id === rule.activityId)
              if (!activity) return null
              const Icon = getActivityIcon(activity.icon)
              return (
                <div
                  key={rule.id}
                  className="flex items-center gap-2 rounded-lg border border-dashed px-3 py-2"
                  style={{ borderColor: activity.color }}
                >
                  <span
                    className="h-2.5 w-2.5 flex-shrink-0 rounded-full border"
                    style={{ borderColor: activity.color, backgroundColor: 'transparent' }}
                  />
                  {Icon && <Icon size={13} className="text-[var(--text-muted)]" />}
                  <span className="flex-1 text-sm text-[var(--text-muted)]">
                    {activity.name} <span className="text-xs">(planned)</span>
                  </span>
                  <button
                    onClick={() => handleAdd(activity.id)}
                    className="rounded-md px-2 py-0.5 text-xs font-medium text-[var(--accent)] hover:bg-[var(--surface-2)]"
                  >
                    Log now
                  </button>
                  <button
                    onClick={() => skipOccurrence(rule.id, date)}
                    className="rounded-md p-1 text-[var(--text-muted)] hover:text-red-500"
                    aria-label="Skip this occurrence"
                  >
                    <X size={13} />
                  </button>
                </div>
              )
            })}
          </div>

          {addPickerOpen ? (
            <div className="mt-3 flex flex-col gap-1">
              {loggableActivities.map((activity) =>
                recurrenceActivityId === activity.id ? (
                  <RecurrencePicker
                    key={activity.id}
                    initialDate={date}
                    onSave={(value) => handleSaveRecurrence(activity.id, value)}
                    onCancel={() => setRecurrenceActivityId(null)}
                  />
                ) : (
                  <div key={activity.id} className="flex items-center gap-1">
                    <button
                      onClick={() => handleAdd(activity.id)}
                      className="flex flex-1 items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-[var(--surface-2)]"
                    >
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: activity.color }}
                      />
                      {activity.name}
                    </button>
                    <button
                      onClick={() => setRecurrenceActivityId(activity.id)}
                      className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
                      aria-label="Repeat this activity"
                    >
                      <Repeat size={14} />
                    </button>
                  </div>
                )
              )}
            </div>
          ) : (
            loggableActivities.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setAddPickerOpen(true)}
                className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-[var(--border)] py-2 text-sm text-[var(--text-muted)] hover:text-[var(--text)]"
              >
                <Plus size={14} /> Add entry for this day
              </motion.button>
            )
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
