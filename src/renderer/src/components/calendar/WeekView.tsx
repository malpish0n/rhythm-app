import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { HourGrid, type PlannedRangeItem } from './HourGrid'
import { usePlanRules } from '@renderer/hooks/usePlanRules'
import { getOccurrencesInRange } from '@renderer/lib/planRecurrence'
import { weekRange, todayIso } from '@renderer/lib/date'
import { useAppStore } from '@renderer/state/store'
import { DayDetailPopover } from './DayDetailPopover'
import type { Activity, LogEntry } from '@shared/types'

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

interface WeekViewProps {
  weekCursor: string
  activities: Activity[]
  categoryFilter: string
  refreshToken: number
}

export function WeekView({
  weekCursor,
  activities,
  categoryFilter,
  refreshToken
}: WeekViewProps): JSX.Element {
  const timeFormat = useAppStore((s) => s.timeFormat)
  const activeActivity =
    categoryFilter === 'all' ? undefined : activities.find((a) => a.id === categoryFilter)

  const { start, end, days } = useMemo(() => weekRange(weekCursor), [weekCursor])

  const [entries, setEntries] = useState<LogEntry[]>([])
  useEffect(() => {
    let cancelled = false
    window.api.logEntries.listByRange(start, end, activeActivity?.id).then((rows) => {
      if (!cancelled) setEntries(rows)
    })
    return () => {
      cancelled = true
    }
  }, [start, end, activeActivity?.id, refreshToken])

  const entriesByDate = useMemo(() => {
    const map = new Map<string, LogEntry[]>()
    for (const entry of entries) {
      const list = map.get(entry.date) ?? []
      list.push(entry)
      map.set(entry.date, list)
    }
    return map
  }, [entries])

  const { planRules, moveOccurrence } = usePlanRules()
  const plannedByDate = useMemo(
    () => getOccurrencesInRange(planRules, start, end),
    [planRules, start, end]
  )

  const timedPlannedRanges = useMemo<PlannedRangeItem[]>(() => {
    const result: PlannedRangeItem[] = []
    for (const [date, rules] of plannedByDate) {
      const loggedIds = new Set((entriesByDate.get(date) ?? []).map((e) => e.activityId))
      for (const rule of rules) {
        if (!rule.startTime || !rule.endTime) continue
        if (loggedIds.has(rule.activityId)) continue
        result.push({
          ruleId: rule.id,
          date,
          activityId: rule.activityId,
          startTime: rule.startTime,
          endTime: rule.endTime
        })
      }
    }
    return result
  }, [plannedByDate, entriesByDate])

  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [dragOverDate, setDragOverDate] = useState<string | null>(null)
  const today = todayIso()

  const columns = days.map((date, idx) => ({
    date,
    label: `${WEEKDAY_LABELS[idx]} ${Number(date.slice(-2))}`,
    isToday: date === today
  }))

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          key={`${weekCursor}-${categoryFilter}`}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col gap-4"
        >
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-elevation-sm sm:p-6">
            <p className="mb-2 text-xs font-medium text-[var(--text-muted)]">Planned this week</p>
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {days.map((date) => {
                const rulesToday = (plannedByDate.get(date) ?? []).filter(
                  (r) => !r.startTime
                )
                const loggedIds = new Set(
                  (entriesByDate.get(date) ?? []).map((e) => e.activityId)
                )
                const plannedIds = rulesToday
                  .map((r) => r.activityId)
                  .filter((id) => !loggedIds.has(id) && !activeActivity)

                return (
                  <div
                    key={date}
                    onDragOver={(e) => {
                      e.preventDefault()
                      setDragOverDate(date)
                    }}
                    onDragLeave={() => setDragOverDate((d) => (d === date ? null : d))}
                    onDrop={(e) => {
                      e.preventDefault()
                      setDragOverDate(null)
                      const data = e.dataTransfer.getData('text/plain')
                      if (!data) return
                      const { ruleId, fromDate } = JSON.parse(data) as {
                        ruleId: string
                        fromDate: string
                      }
                      if (fromDate === date) return
                      const rule = planRules.find((r) => r.id === ruleId)
                      if (rule) moveOccurrence(rule, fromDate, date)
                    }}
                    className="flex min-h-10 flex-wrap items-center justify-center gap-1 rounded-lg border p-1.5"
                    style={{
                      borderColor: dragOverDate === date ? 'var(--accent)' : 'var(--border)'
                    }}
                  >
                    {plannedIds.length === 0 && (
                      <span className="text-[10px] text-[var(--text-muted)]">—</span>
                    )}
                    {plannedIds.map((activityId) => {
                      const activity = activities.find((a) => a.id === activityId)
                      if (!activity) return null
                      const rule = rulesToday.find((r) => r.activityId === activityId)
                      return (
                        <span
                          key={activityId}
                          draggable={!!rule}
                          onDragStart={(e) => {
                            if (!rule) return
                            e.dataTransfer.setData(
                              'text/plain',
                              JSON.stringify({ ruleId: rule.id, fromDate: date })
                            )
                          }}
                          title={activity.name}
                          className="h-2.5 w-2.5 flex-shrink-0 cursor-grab rounded-full border"
                          style={{ borderColor: activity.color, backgroundColor: 'transparent' }}
                        />
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-elevation-sm sm:p-6">
            <HourGrid
              columns={columns}
              entriesByDate={entriesByDate}
              activities={activities}
              timeFormat={timeFormat}
              plannedRanges={timedPlannedRanges}
              onDayClick={setSelectedDate}
            />
          </div>
        </motion.div>
      </AnimatePresence>

      {selectedDate && (
        <DayDetailPopover
          date={selectedDate}
          activities={activities}
          refreshToken={refreshToken}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </>
  )
}
