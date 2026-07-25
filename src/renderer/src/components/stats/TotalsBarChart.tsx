import { motion } from 'motion/react'
import type { Activity } from '@shared/types'

interface TotalsBarChartProps {
  activities: Activity[]
  totals: Map<string, number>
}

export function TotalsBarChart({ activities, totals }: TotalsBarChartProps): JSX.Element {
  const max = Math.max(1, ...activities.map((a) => totals.get(a.id) ?? 0))

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-elevation-sm">
      <span className="text-xs font-medium text-[var(--text-muted)]">Totals by category</span>
      {activities.length === 0 && (
        <p className="text-sm text-[var(--text-muted)]">No categories yet.</p>
      )}
      {activities.map((activity) => {
        const total = totals.get(activity.id) ?? 0
        return (
          <div key={activity.id} className="flex items-center gap-3">
            <span className="w-20 flex-shrink-0 truncate text-xs text-[var(--text-muted)]">
              {activity.name}
            </span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--surface-2)]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(total / max) * 100}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ backgroundColor: activity.color }}
              />
            </div>
            <span className="w-8 flex-shrink-0 text-right text-xs font-medium tabular-nums">
              {total}
            </span>
          </div>
        )
      })}
    </div>
  )
}
