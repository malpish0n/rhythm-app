import { useEffect, useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { format, startOfMonth, startOfWeek } from 'date-fns'
import { yearRange } from '@renderer/lib/date'
import type { Activity, DayAggregate } from '@shared/types'

interface SummaryViewProps {
  year: number
  activities: Activity[]
  categoryFilter: string
  refreshToken: number
}

type GroupBy = 'week' | 'month'

export function SummaryView({
  year,
  activities,
  categoryFilter,
  refreshToken
}: SummaryViewProps): JSX.Element {
  const [aggregates, setAggregates] = useState<DayAggregate[]>([])
  const [groupBy, setGroupBy] = useState<GroupBy>('month')

  const activeActivity =
    categoryFilter === 'all' ? undefined : activities.find((a) => a.id === categoryFilter)

  useEffect(() => {
    const { start, end } = yearRange(year)
    window.api.logEntries.aggregateByRange(start, end, activeActivity?.id).then(setAggregates)
  }, [year, activeActivity?.id, refreshToken])

  const buckets = useMemo(() => {
    const map = new Map<string, number>()
    for (const row of aggregates) {
      const date = new Date(row.date + 'T00:00:00')
      const bucketStart =
        groupBy === 'month' ? startOfMonth(date) : startOfWeek(date, { weekStartsOn: 1 })
      const key = format(bucketStart, groupBy === 'month' ? 'yyyy-MM' : 'yyyy-MM-dd')
      map.set(key, (map.get(key) ?? 0) + row.total)
    }
    return Array.from(map.entries())
      .map(([key, total]) => ({ key, total }))
      .sort((a, b) => a.key.localeCompare(b.key))
  }, [aggregates, groupBy])

  const max = Math.max(1, ...buckets.map((b) => b.total))
  const color = activeActivity?.color ?? '#22c55e'

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-elevation-sm">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs text-[var(--text-muted)]">{year} summary</span>
        <div className="flex gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-1">
          {(['week', 'month'] as GroupBy[]).map((g) => (
            <button
              key={g}
              onClick={() => setGroupBy(g)}
              className="rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors"
              style={{
                backgroundColor: groupBy === g ? 'var(--accent)' : 'transparent',
                color: groupBy === g ? 'white' : 'var(--text-muted)'
              }}
            >
              {g}ly
            </button>
          ))}
        </div>
      </div>

      {buckets.length === 0 ? (
        <p className="py-8 text-center text-sm text-[var(--text-muted)]">
          No activity logged in {year} yet.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {buckets.map((bucket) => (
            <div key={bucket.key} className="flex items-center gap-3">
              <span className="w-16 flex-shrink-0 text-xs text-[var(--text-muted)]">
                {groupBy === 'month'
                  ? format(new Date(bucket.key + '-01T00:00:00'), 'MMM')
                  : format(new Date(bucket.key + 'T00:00:00'), 'MMM d')}
              </span>
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[var(--surface-2)]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(bucket.total / max) * 100}%` }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: color }}
                />
              </div>
              <span className="w-8 flex-shrink-0 text-right text-xs font-medium tabular-nums">
                {bucket.total}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
