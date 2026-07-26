import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Target } from 'lucide-react'
import { getActivityIcon } from '@renderer/lib/icons'
import { todayIso, weekRange } from '@renderer/lib/date'
import { SectionCard } from '@renderer/components/ui/SectionCard'
import { ProgressRing } from '@renderer/components/ui/ProgressRing'
import { fastSpring } from '@renderer/lib/motionPresets'
import type { Activity, LogEntry } from '@shared/types'

interface WeeklyGoalsProps {
  activities: Activity[]
  refreshToken: number
}

const HINT_DISMISSED_KEY = 'rhythm:goalsHintDismissed'

export function WeeklyGoals({ activities, refreshToken }: WeeklyGoalsProps): JSX.Element | null {
  const [entries, setEntries] = useState<LogEntry[]>([])
  const [celebrating, setCelebrating] = useState<string | null>(null)
  const [hintDismissed, setHintDismissed] = useState(
    () => localStorage.getItem(HINT_DISMISSED_KEY) === 'true'
  )
  const prevDaysDone = useRef<Map<string, number>>(new Map())

  useEffect(() => {
    const { start, end } = weekRange(todayIso())
    window.api.logEntries.listByRange(start, end).then(setEntries)
  }, [refreshToken])

  const goalActivities = activities.filter((a) => a.weeklyTarget && a.weeklyTarget > 0)

  useEffect(() => {
    for (const activity of goalActivities) {
      const daysDone = new Set(
        entries.filter((e) => e.activityId === activity.id).map((e) => e.date)
      ).size
      const prev = prevDaysDone.current.get(activity.id) ?? 0
      if (daysDone === activity.weeklyTarget && prev < daysDone) {
        setCelebrating(activity.id)
        setTimeout(() => setCelebrating((c) => (c === activity.id ? null : c)), 800)
      }
      prevDaysDone.current.set(activity.id, daysDone)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries])

  if (goalActivities.length === 0) {
    if (hintDismissed) return null
    return (
      <SectionCard>
        <div className="flex items-center justify-between gap-3">
          <p className="flex items-center gap-1.5 text-sm text-[var(--text-muted)]">
            <Target size={14} />
            Set a weekly goal on any activity to track your progress here.
          </p>
          <button
            onClick={() => {
              localStorage.setItem(HINT_DISMISSED_KEY, 'true')
              setHintDismissed(true)
            }}
            className="flex-shrink-0 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text)]"
          >
            Dismiss
          </button>
        </div>
      </SectionCard>
    )
  }

  return (
    <SectionCard title="Weekly goals" icon={Target}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {goalActivities.map((activity) => {
          const daysDone = new Set(
            entries.filter((e) => e.activityId === activity.id).map((e) => e.date)
          ).size
          const target = activity.weeklyTarget ?? 1
          const Icon = getActivityIcon(activity.icon)
          const isCelebrating = celebrating === activity.id
          return (
            <div
              key={activity.id}
              className="relative flex flex-col items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3 text-center"
            >
              <motion.div animate={isCelebrating ? { scale: [1, 1.15, 1] } : {}} transition={fastSpring}>
                <ProgressRing progress={daysDone / target} color={activity.color}>
                  {Icon ? (
                    <Icon size={16} style={{ color: activity.color }} />
                  ) : (
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: activity.color }}
                    />
                  )}
                </ProgressRing>
              </motion.div>
              <div>
                <p className="text-xs font-medium">{activity.name}</p>
                <p className="text-[11px] text-[var(--text-muted)]">
                  {daysDone} of {target} this week
                </p>
              </div>
              <AnimatePresence>
                {isCelebrating && (
                  <>
                    {Array.from({ length: 8 }).map((_, i) => {
                      const angle = (i / 8) * Math.PI * 2
                      return (
                        <motion.span
                          key={i}
                          initial={{ opacity: 1, x: 0, y: 0, scale: 0 }}
                          animate={{
                            opacity: 0,
                            x: Math.cos(angle) * 36,
                            y: Math.sin(angle) * 36,
                            scale: 1
                          }}
                          transition={{ duration: 0.7, ease: 'easeOut' }}
                          className="pointer-events-none absolute left-1/2 top-8 h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: activity.color }}
                        />
                      )
                    })}
                  </>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </SectionCard>
  )
}
