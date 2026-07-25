import { useEffect, useMemo, useState } from 'react'
import { buildMonthMatrix, monthRange } from '@renderer/lib/date'
import { aggregateByDate, type DayTotals } from '@renderer/lib/aggregate'
import type { DayAggregate } from '@shared/types'

/**
 * Loads aggregate log data for a single month (optionally filtered to one
 * activity) and exposes it as a traditional Sun-start week/day matrix plus a
 * per-day totals map — the month-view counterpart of useYearMatrix.
 */
export function useMonthMatrix(
  year: number,
  month: number,
  activityId: string | undefined,
  refreshToken: number
): {
  matrix: ReturnType<typeof buildMonthMatrix>
  totalsByDate: Map<string, DayTotals>
  maxCount: number
  loading: boolean
} {
  const [aggregates, setAggregates] = useState<DayAggregate[]>([])
  const [loading, setLoading] = useState(true)

  const matrix = useMemo(() => buildMonthMatrix(year, month), [year, month])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    const { start, end } = monthRange(year, month)
    window.api.logEntries.aggregateByRange(start, end, activityId).then((rows) => {
      if (!cancelled) {
        setAggregates(rows)
        setLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [year, month, activityId, refreshToken])

  const { totalsByDate, maxCount } = useMemo(() => aggregateByDate(aggregates), [aggregates])

  return { matrix, totalsByDate, maxCount, loading }
}
