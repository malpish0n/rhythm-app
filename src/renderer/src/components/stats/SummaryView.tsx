import { useEffect, useMemo, useState } from 'react'
import { format, startOfMonth, startOfWeek } from 'date-fns'
import { yearRange } from '@renderer/lib/date'
import { aggregateByWeekday } from '@renderer/lib/aggregate'
import { WeekdayInsight } from './WeekdayInsight'
import { SectionCard } from '@renderer/components/ui/SectionCard'
import { SegmentedControl } from '@renderer/components/ui/SegmentedControl'
import { BarList } from '@renderer/components/ui/BarList'
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
  const weekdayTotals = useMemo(() => aggregateByWeekday(aggregates), [aggregates])

  return (
    <SectionCard
      className="p-6"
      title={`${year} summary`}
      action={
        <SegmentedControl
          layoutId="summaryGroupBy"
          value={groupBy}
          onChange={setGroupBy}
          size="sm"
          options={[
            { value: 'week', label: 'Weekly' },
            { value: 'month', label: 'Monthly' }
          ]}
        />
      }
    >
      {buckets.length === 0 ? (
        <p className="py-8 text-center text-sm text-[var(--text-muted)]">
          No activity logged in {year} yet.
        </p>
      ) : (
        <BarList
          max={max}
          rows={buckets.map((bucket) => ({
            key: bucket.key,
            label:
              groupBy === 'month'
                ? format(new Date(bucket.key + '-01T00:00:00'), 'MMM')
                : format(new Date(bucket.key + 'T00:00:00'), 'MMM d'),
            value: bucket.total,
            color
          }))}
        />
      )}

      {buckets.length > 0 && (
        <div className="mt-6 border-t border-[var(--border)] pt-6">
          <WeekdayInsight totals={weekdayTotals} color={color} />
        </div>
      )}
    </SectionCard>
  )
}
