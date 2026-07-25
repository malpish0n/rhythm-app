import { AnimatePresence, motion } from 'motion/react'
import type { DayTotals } from '@renderer/hooks/useYearMatrix'
import { getActivityIcon } from '@renderer/lib/icons'
import type { Activity } from '@shared/types'

interface CalendarTooltipProps {
  date: string | null
  totals: DayTotals | undefined
  activities: Activity[]
  position: { x: number; y: number } | null
}

export function CalendarTooltip({
  date,
  totals,
  activities,
  position
}: CalendarTooltipProps): JSX.Element | null {
  if (!date || !position) return null

  const formatted = new Date(date + 'T00:00:00').toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  })

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.12 }}
        className="pointer-events-none fixed z-50 min-w-[160px] rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 text-xs shadow-lg"
        style={{ left: position.x, top: position.y - 12, transform: 'translate(-50%, -100%)' }}
      >
        <div className="mb-1 font-semibold">{formatted}</div>
        {!totals || totals.total === 0 ? (
          <div className="text-[var(--text-muted)]">No activity logged</div>
        ) : (
          <ul className="space-y-0.5">
            {Object.entries(totals.byActivity).map(([activityId, count]) => {
              const activity = activities.find((a) => a.id === activityId)
              if (!activity) return null
              const Icon = getActivityIcon(activity.icon)
              return (
                <li key={activityId} className="flex items-center gap-1.5">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: activity.color }}
                  />
                  {Icon && <Icon size={11} className="text-[var(--text-muted)]" />}
                  <span className="text-[var(--text-muted)]">{activity.name}</span>
                  <span className="ml-auto font-medium tabular-nums">{count}</span>
                </li>
              )
            })}
          </ul>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
