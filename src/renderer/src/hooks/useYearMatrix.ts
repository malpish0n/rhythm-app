import { useEffect, useMemo, useState } from 'react'
import { buildYearMatrix, yearRange } from '@renderer/lib/date'
import { aggregateByDate, type DayTotals } from '@renderer/lib/aggregate'
import type { DayAggregate } from '@shared/types'

export type { DayTotals }

/**
 * Loads aggregate log data for a year (optionally filtered to one activity)
 * and exposes it as the GitHub-style week/day matrix plus a per-day totals map.
 */
export function useYearMatrix(
  year: number,
  activityId: string | undefined,
  refreshToken: number
): {
  matrix: ReturnType<typeof buildYearMatrix>
  totalsByDate: Map<string, DayTotals>
  maxCount: number
  loading: boolean
} {
  const [aggregates, setAggregates] = useState<DayAggregate[]>([])
  const [loading, setLoading] = useState(true)

  const matrix = useMemo(() => buildYearMatrix(year), [year])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    const { start, end } = yearRange(year)
    window.api.logEntries.aggregateByRange(start, end, activityId).then((rows) => {
      if (!cancelled) {
        setAggregates(rows)
        setLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [year, activityId, refreshToken])

  const { totalsByDate, maxCount } = useMemo(() => aggregateByDate(aggregates), [aggregates])

  return { matrix, totalsByDate, maxCount, loading }
}
