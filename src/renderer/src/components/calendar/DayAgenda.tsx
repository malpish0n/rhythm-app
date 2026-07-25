import { useEffect, useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { Pencil, Plus, Trash2, X } from 'lucide-react'
import { useLogEntries } from '@renderer/hooks/useLogEntries'
import { usePlanRules } from '@renderer/hooks/usePlanRules'
import { expandPlanRule } from '@renderer/lib/planRecurrence'
import { getActivityIcon } from '@renderer/lib/icons'
import { todayIso } from '@renderer/lib/date'
import { fastSpring } from '@renderer/lib/motionPresets'
import { ActivityTimePopover, type ActivityTimeValue } from './ActivityTimePopover'
import { DayNoteSection } from './DayNoteSection'
import type { Activity, LogEntry } from '@shared/types'

interface DayAgendaProps {
  date: string
  activities: Activity[]
  refreshToken: number
  scrollable?: boolean
}

export function DayAgenda({
  date,
  activities,
  refreshToken,
  scrollable = true
}: DayAgendaProps): JSX.Element {
  const { quickAdd, updateEntry } = useLogEntries()
  const { planRules, createPlan, skipOccurrence } = usePlanRules()
  const [entries, setEntries] = useState<LogEntry[]>([])
  const [addPickerOpen, setAddPickerOpen] = useState(false)
  const [timeActivityId, setTimeActivityId] = useState<string | null>(null)
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null)

  useEffect(() => {
    window.api.logEntries.listByRange(date, date).then(setEntries)
    setAddPickerOpen(false)
    setTimeActivityId(null)
    setEditingEntryId(null)
  }, [date, refreshToken])

  const plannedToday = useMemo(() => {
    const loggedIds = new Set(entries.map((e) => e.activityId))
    return planRules
      .filter((rule) => expandPlanRule(rule, date, date).length > 0)
      .filter((rule) => !loggedIds.has(rule.activityId))
  }, [planRules, date, entries])

  const loggedActivityIds = new Set(entries.map((e) => e.activityId))
  const loggableActivities = activities.filter((a) => !loggedActivityIds.has(a.id))
  const isFuture = date > todayIso()

  const handleDelete = async (id: string): Promise<void> => {
    await window.api.logEntries.delete(id)
    setEntries(await window.api.logEntries.listByRange(date, date))
  }

  const handleAdd = async (activityId: string, value: ActivityTimeValue): Promise<void> => {
    if (value.repeat) {
      await createPlan({
        activityId,
        frequency: value.repeat.frequency,
        startDate: date,
        interval: value.repeat.interval,
        weekdays: value.repeat.frequency === 'weekly' ? value.repeat.weekdays : undefined,
        startTime: value.time,
        endTime: value.endTime,
        note: value.note
      })
    } else {
      const activity = activities.find((a) => a.id === activityId)
      const entry = await quickAdd(activityId, activity?.defaultIncrement ?? 1, date)
      if (value.time || value.endTime || value.note) {
        await updateEntry(entry.id, { time: value.time, endTime: value.endTime, note: value.note })
      }
    }
    setEntries(await window.api.logEntries.listByRange(date, date))
    setAddPickerOpen(false)
    setTimeActivityId(null)
  }

  const handleLogPlanned = async (activityId: string): Promise<void> => {
    const activity = activities.find((a) => a.id === activityId)
    await quickAdd(activityId, activity?.defaultIncrement ?? 1, date)
    setEntries(await window.api.logEntries.listByRange(date, date))
  }

  const handleSaveEntryEdit = async (id: string, value: ActivityTimeValue): Promise<void> => {
    await updateEntry(id, { time: value.time, endTime: value.endTime, note: value.note })
    setEntries(await window.api.logEntries.listByRange(date, date))
    setEditingEntryId(null)
  }

  return (
    <>
      <div
        className={
          scrollable
            ? 'flex max-h-72 flex-col gap-2 overflow-y-auto'
            : 'flex flex-col gap-2'
        }
      >
        {entries.length === 0 && plannedToday.length === 0 && (
          <p className="py-2 text-center text-sm text-[var(--text-muted)]">
            No activity logged this day.
          </p>
        )}
        {entries.map((entry) => {
          const activity = activities.find((a) => a.id === entry.activityId)
          if (!activity) return null
          const Icon = getActivityIcon(activity.icon)

          if (editingEntryId === entry.id) {
            return (
              <ActivityTimePopover
                key={entry.id}
                initialDate={date}
                saveLabel="Save"
                allowRepeat={false}
                initial={{ time: entry.time, endTime: entry.endTime, note: entry.note, repeat: null }}
                onSave={(value) => handleSaveEntryEdit(entry.id, value)}
                onCancel={() => setEditingEntryId(null)}
              />
            )
          }

          return (
            <div
              key={entry.id}
              className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2"
            >
              <span
                className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                style={{ backgroundColor: activity.color }}
              />
              {Icon && <Icon size={13} className="text-[var(--text-muted)]" />}
              <span className="flex-1 text-sm">
                {activity.name}
                {entry.time && (
                  <span className="ml-1.5 text-xs text-[var(--text-muted)]">
                    {entry.time}
                    {entry.endTime ? `–${entry.endTime}` : ''}
                  </span>
                )}
              </span>
              <button
                onClick={() => setEditingEntryId(entry.id)}
                className="rounded-md p-1 text-[var(--text-muted)] hover:text-[var(--text)]"
                aria-label="Edit time or note"
              >
                <Pencil size={13} />
              </button>
              <button
                onClick={() => handleDelete(entry.id)}
                className="rounded-md p-1 text-[var(--text-muted)] hover:text-red-500"
                aria-label="Delete entry"
              >
                <Trash2 size={13} />
              </button>
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
                {activity.name}{' '}
                <span className="text-xs">
                  {rule.startTime && rule.endTime ? `${rule.startTime}–${rule.endTime}` : '(planned)'}
                </span>
              </span>
              {!isFuture && (
                <button
                  onClick={() => handleLogPlanned(activity.id)}
                  className="rounded-md px-2 py-0.5 text-xs font-medium text-[var(--accent)] hover:bg-[var(--surface-2)]"
                >
                  Log now
                </button>
              )}
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

      <DayNoteSection date={date} />

      {!isFuture && (
        <>
          {addPickerOpen ? (
            <>
              <div className="mt-3 flex flex-wrap gap-2">
                {loggableActivities.map((activity) => {
                  const Icon = getActivityIcon(activity.icon)
                  return (
                    <motion.button
                      key={activity.id}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.95 }}
                      transition={fastSpring}
                      onClick={() => setTimeActivityId(activity.id)}
                      className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium shadow-elevation-sm"
                      style={{
                        borderColor: activity.color,
                        backgroundColor: `${activity.color}22`,
                        color: activity.color
                      }}
                    >
                      {Icon && <Icon size={12} />}
                      {activity.name}
                    </motion.button>
                  )
                })}
              </div>
              {timeActivityId && (
                <div className="mt-2">
                  <ActivityTimePopover
                    initialDate={date}
                    onSave={(value) => handleAdd(timeActivityId, value)}
                    onCancel={() => setTimeActivityId(null)}
                  />
                </div>
              )}
            </>
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
        </>
      )}
    </>
  )
}
