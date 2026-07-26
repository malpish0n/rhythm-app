import { computeStreak } from '@shared/sql'
import { aggregateByWeekday } from './aggregate'
import type { Activity, DayAggregate, LogEntry } from '@shared/types'

export interface WrappedStats {
  totalLogs: number
  totalCount: number
  topActivity: { activity: Activity; total: number } | null
  longestStreak: number
  busiestMonth: { month: number; total: number } | null
  busiestWeekday: number
  activeDays: number
}

export function computeWrappedStats(
  entries: LogEntry[],
  aggregates: DayAggregate[],
  activities: Activity[]
): WrappedStats {
  const totalLogs = entries.length
  const totalCount = entries.reduce((sum, e) => sum + e.count, 0)

  const totalsByActivity = new Map<string, number>()
  for (const row of aggregates) {
    totalsByActivity.set(row.activityId, (totalsByActivity.get(row.activityId) ?? 0) + row.total)
  }
  let topActivity: WrappedStats['topActivity'] = null
  for (const [activityId, total] of totalsByActivity) {
    if (!topActivity || total > topActivity.total) {
      const activity = activities.find((a) => a.id === activityId)
      if (activity) topActivity = { activity, total }
    }
  }

  const distinctDates = [...new Set(entries.map((e) => e.date))].sort()
  const { longest } = computeStreak(distinctDates)

  const totalsByMonth = new Map<number, number>()
  for (const row of aggregates) {
    const month = Number(row.date.slice(5, 7)) - 1
    totalsByMonth.set(month, (totalsByMonth.get(month) ?? 0) + row.total)
  }
  let busiestMonth: WrappedStats['busiestMonth'] = null
  for (const [month, total] of totalsByMonth) {
    if (!busiestMonth || total > busiestMonth.total) busiestMonth = { month, total }
  }

  const weekdayTotals = aggregateByWeekday(aggregates)
  const busiestWeekday = weekdayTotals.indexOf(Math.max(...weekdayTotals))

  return {
    totalLogs,
    totalCount,
    topActivity,
    longestStreak: longest,
    busiestMonth,
    busiestWeekday,
    activeDays: distinctDates.length
  }
}
