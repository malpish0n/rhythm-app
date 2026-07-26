import type { DayAggregate } from '@shared/types'

export interface DayTotals {
  total: number
  byActivity: Record<string, number>
}

export function aggregateByWeekday(rows: DayAggregate[]): number[] {
  const totals = [0, 0, 0, 0, 0, 0, 0]
  for (const row of rows) {
    const weekday = new Date(row.date + 'T00:00:00').getDay()
    totals[weekday] += row.total
  }
  return totals
}

export function aggregateByDate(rows: DayAggregate[]): { totalsByDate: Map<string, DayTotals>; maxCount: number } {
  const map = new Map<string, DayTotals>()
  let max = 0
  for (const row of rows) {
    const entry = map.get(row.date) ?? { total: 0, byActivity: {} }
    entry.total += row.total
    entry.byActivity[row.activityId] = (entry.byActivity[row.activityId] ?? 0) + row.total
    map.set(row.date, entry)
    if (entry.total > max) max = entry.total
  }
  return { totalsByDate: map, maxCount: max }
}
