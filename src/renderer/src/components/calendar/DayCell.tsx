import { motion } from 'motion/react'
import { intensityRgba } from '@renderer/lib/color'
import type { DayTotals } from '@renderer/hooks/useYearMatrix'
import type { Activity } from '@shared/types'

interface DayCellProps {
  date: string
  inYear: boolean
  totals: DayTotals | undefined
  maxCount: number
  activeActivity: Activity | undefined
  activities: Activity[]
  onHover: (date: string, totals: DayTotals | undefined, e: React.MouseEvent) => void
  onLeave: () => void
  onClick: (date: string) => void
  index: number
}

export function DayCell({
  date,
  inYear,
  totals,
  maxCount,
  activeActivity,
  activities,
  onHover,
  onLeave,
  onClick,
  index
}: DayCellProps): JSX.Element {
  if (!inYear) {
    return <div className="h-[13px] w-[13px]" />
  }

  const count = totals?.total ?? 0
  const isToday = date === new Date().toISOString().slice(0, 10)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, delay: Math.min(index * 0.0015, 0.3) }}
      whileHover={{ scale: 1.35, zIndex: 10 }}
      whileTap={{ scale: 0.85 }}
      onMouseEnter={(e) => onHover(date, totals, e)}
      onMouseLeave={onLeave}
      onClick={() => onClick(date)}
      className="relative h-[13px] w-[13px] cursor-pointer rounded-[3px] bg-[var(--surface-2)]"
      style={{ outline: isToday ? '1.5px solid var(--accent)' : undefined, outlineOffset: 1 }}
    >
      {activeActivity && count > 0 && (
        <div
          className="absolute inset-0 rounded-[3px]"
          style={{ backgroundColor: intensityRgba(count, maxCount, activeActivity.color) }}
        />
      )}
      {!activeActivity && count > 0 && totals && (
        <div className="absolute inset-0 flex overflow-hidden rounded-[3px]">
          {Object.entries(totals.byActivity).map(([activityId, activityCount]) => {
            const activity = activities.find((a) => a.id === activityId)
            if (!activity) return null
            return (
              <div
                key={activityId}
                style={{
                  backgroundColor: intensityRgba(activityCount, maxCount, activity.color),
                  flex: 1
                }}
              />
            )
          })}
        </div>
      )}
    </motion.div>
  )
}
