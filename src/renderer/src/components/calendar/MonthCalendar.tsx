import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { NotebookPen } from 'lucide-react'
import { useMonthMatrix } from '@renderer/hooks/useMonthMatrix'
import { usePlanRules } from '@renderer/hooks/usePlanRules'
import { getOccurrencesInRange } from '@renderer/lib/planRecurrence'
import { intensityRgba } from '@renderer/lib/color'
import { monthRange, todayIso } from '@renderer/lib/date'
import { DayDetailPopover } from './DayDetailPopover'
import type { Activity } from '@shared/types'

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MAX_DOTS = 5

interface MonthCalendarProps {
  year: number
  month: number
  activities: Activity[]
  categoryFilter: string
  refreshToken: number
}

export function MonthCalendar({
  year,
  month,
  activities,
  categoryFilter,
  refreshToken
}: MonthCalendarProps): JSX.Element {
  const activeActivity =
    categoryFilter === 'all' ? undefined : activities.find((a) => a.id === categoryFilter)

  const { matrix, totalsByDate, maxCount } = useMonthMatrix(
    year,
    month,
    activeActivity?.id,
    refreshToken
  )
  const { planRules, moveOccurrence } = usePlanRules()

  const plannedByDate = useMemo(() => {
    const { start, end } = monthRange(year, month)
    return getOccurrencesInRange(planRules, start, end)
  }, [planRules, year, month])

  const [noteDates, setNoteDates] = useState<Set<string>>(new Set())
  useEffect(() => {
    const { start, end } = monthRange(year, month)
    window.api.dayNotes.listByRange(start, end).then((rows) => {
      setNoteDates(new Set(rows.map((r) => r.date)))
    })
  }, [year, month, refreshToken])

  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [dragOverDate, setDragOverDate] = useState<string | null>(null)
  const today = todayIso()

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-elevation-sm sm:p-6">
      <div className="mb-2 grid grid-cols-7 gap-1 sm:gap-2">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="text-center text-xs font-medium text-[var(--text-muted)]">
            {label}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${year}-${month}-${categoryFilter}`}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col gap-1 sm:gap-2"
        >
          {matrix.weeks.map((week, weekIdx) => (
            <div key={weekIdx} className="grid grid-cols-7 gap-1 sm:gap-2">
              {week.map((day) => {
                const totals = totalsByDate.get(day.date)
                const count = totals?.total ?? 0
                const isToday = day.date === today
                const dayNumber = Number(day.date.slice(-2))

                const loggedIds = new Set(totals ? Object.keys(totals.byActivity) : [])
                const rulesToday = plannedByDate.get(day.date) ?? []
                const plannedIds = rulesToday
                  .map((r) => r.activityId)
                  .filter((id) => !loggedIds.has(id) && !activeActivity)

                const visibleLogged = [...loggedIds].slice(0, MAX_DOTS)
                const remaining = MAX_DOTS - visibleLogged.length
                const visiblePlanned = plannedIds.slice(0, Math.max(0, remaining))
                const overflow =
                  loggedIds.size +
                  plannedIds.length -
                  visibleLogged.length -
                  visiblePlanned.length

                return (
                  <motion.div
                    key={day.date}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setSelectedDate(day.date)}
                    onDragOver={(e) => {
                      e.preventDefault()
                      setDragOverDate(day.date)
                    }}
                    onDragLeave={() => setDragOverDate((d) => (d === day.date ? null : d))}
                    onDrop={(e) => {
                      e.preventDefault()
                      setDragOverDate(null)
                      const data = e.dataTransfer.getData('text/plain')
                      if (!data) return
                      const { ruleId, fromDate } = JSON.parse(data) as {
                        ruleId: string
                        fromDate: string
                      }
                      if (fromDate === day.date) return
                      const rule = planRules.find((r) => r.id === ruleId)
                      if (rule) moveOccurrence(rule, fromDate, day.date)
                    }}
                    className="flex min-h-16 cursor-pointer flex-col gap-1 rounded-lg border p-1.5 sm:min-h-20"
                    style={{
                      borderColor:
                        dragOverDate === day.date
                          ? 'var(--accent)'
                          : isToday
                            ? 'var(--accent)'
                            : 'var(--border)',
                      backgroundColor:
                        activeActivity && count > 0
                          ? intensityRgba(count, maxCount, activeActivity.color)
                          : 'var(--surface-2)',
                      opacity: day.inMonth ? 1 : 0.4
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className="text-xs font-medium tabular-nums"
                        style={{ color: isToday ? 'var(--accent)' : 'var(--text)' }}
                      >
                        {dayNumber}
                      </span>
                      {noteDates.has(day.date) && (
                        <NotebookPen size={10} className="text-[var(--text-muted)]" />
                      )}
                    </div>
                    {!activeActivity && (loggedIds.size > 0 || plannedIds.length > 0) && (
                      <div className="flex flex-wrap gap-1">
                        {visibleLogged.map((activityId) => {
                          const activity = activities.find((a) => a.id === activityId)
                          if (!activity) return null
                          return (
                            <span
                              key={activityId}
                              className="h-1.5 w-1.5 flex-shrink-0 rounded-full"
                              style={{ backgroundColor: activity.color }}
                            />
                          )
                        })}
                        {visiblePlanned.map((activityId) => {
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
                                  JSON.stringify({ ruleId: rule.id, fromDate: day.date })
                                )
                              }}
                              className="h-1.5 w-1.5 flex-shrink-0 cursor-grab rounded-full border"
                              style={{ borderColor: activity.color, backgroundColor: 'transparent' }}
                            />
                          )
                        })}
                        {overflow > 0 && (
                          <span className="text-[9px] leading-none text-[var(--text-muted)]">
                            +{overflow}
                          </span>
                        )}
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          ))}
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
    </div>
  )
}
