import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { HourGrid, type PlannedRangeItem } from './HourGrid'
import { DayAgenda } from './DayAgenda'
import { useAppStore } from '@renderer/state/store'
import { usePlanRules } from '@renderer/hooks/usePlanRules'
import { expandPlanRule } from '@renderer/lib/planRecurrence'
import { todayIso } from '@renderer/lib/date'
import type { Activity, LogEntry } from '@shared/types'

interface DayViewProps {
  date: string
  activities: Activity[]
  refreshToken: number
}

export function DayView({ date, activities, refreshToken }: DayViewProps): JSX.Element {
  const timeFormat = useAppStore((s) => s.timeFormat)
  const [entries, setEntries] = useState<LogEntry[]>([])

  useEffect(() => {
    window.api.logEntries.listByRange(date, date).then(setEntries)
  }, [date, refreshToken])

  const entriesByDate = useMemo(() => new Map([[date, entries]]), [date, entries])
  const columns = useMemo(
    () => [{ date, label: 'Today', isToday: date === todayIso() }],
    [date]
  )

  const { planRules } = usePlanRules()
  const plannedRanges = useMemo<PlannedRangeItem[]>(() => {
    const loggedIds = new Set(entries.map((e) => e.activityId))
    const result: PlannedRangeItem[] = []
    for (const rule of planRules) {
      if (!rule.startTime || !rule.endTime) continue
      if (loggedIds.has(rule.activityId)) continue
      if (expandPlanRule(rule, date, date).length === 0) continue
      result.push({
        ruleId: rule.id,
        date,
        activityId: rule.activityId,
        startTime: rule.startTime,
        endTime: rule.endTime
      })
    }
    return result
  }, [planRules, entries, date])

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={date}
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -12 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col gap-4"
      >
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-elevation-sm sm:p-6">
          <HourGrid
            columns={columns}
            entriesByDate={entriesByDate}
            activities={activities}
            timeFormat={timeFormat}
            plannedRanges={plannedRanges}
          />
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-elevation-sm sm:p-6">
          <DayAgenda
            date={date}
            activities={activities}
            refreshToken={refreshToken}
            scrollable={false}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
