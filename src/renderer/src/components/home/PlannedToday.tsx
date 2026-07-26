import { useEffect, useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { Check, ListTodo } from 'lucide-react'
import { getActivityIcon } from '@renderer/lib/icons'
import { todayIso } from '@renderer/lib/date'
import { usePlanRules } from '@renderer/hooks/usePlanRules'
import { useLogEntries } from '@renderer/hooks/useLogEntries'
import { expandPlanRule } from '@renderer/lib/planRecurrence'
import { SectionCard } from '@renderer/components/ui/SectionCard'
import { fastSpring } from '@renderer/lib/motionPresets'
import type { Activity, LogEntry } from '@shared/types'

interface PlannedTodayProps {
  activities: Activity[]
  refreshToken: number
}

export function PlannedToday({ activities, refreshToken }: PlannedTodayProps): JSX.Element | null {
  const { planRules } = usePlanRules()
  const { quickAdd } = useLogEntries()
  const [entries, setEntries] = useState<LogEntry[]>([])
  const today = todayIso()

  useEffect(() => {
    window.api.logEntries.listByRange(today, today).then(setEntries)
  }, [today, refreshToken])

  const loggedIds = useMemo(() => new Set(entries.map((e) => e.activityId)), [entries])

  const todaysRules = useMemo(
    () => planRules.filter((rule) => expandPlanRule(rule, today, today).length > 0),
    [planRules, today]
  )

  if (todaysRules.length === 0) return null

  return (
    <SectionCard title="Planned today" icon={ListTodo}>
      <div className="flex flex-col gap-1.5">
        {todaysRules.map((rule) => {
          const activity = activities.find((a) => a.id === rule.activityId)
          if (!activity) return null
          const Icon = getActivityIcon(activity.icon)
          const done = loggedIds.has(activity.id)
          return (
            <motion.button
              key={rule.id}
              whileTap={done ? undefined : { scale: 0.98 }}
              transition={fastSpring}
              disabled={done}
              onClick={() => quickAdd(activity.id, activity.defaultIncrement)}
              className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-sm transition-colors disabled:cursor-default"
              style={{ opacity: done ? 0.6 : 1 }}
            >
              <span
                className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border"
                style={{
                  borderColor: activity.color,
                  backgroundColor: done ? activity.color : 'transparent'
                }}
              >
                {done && <Check size={11} className="text-white" />}
              </span>
              {Icon && <Icon size={13} style={{ color: activity.color }} />}
              <span className={done ? 'line-through' : ''}>{activity.name}</span>
              {rule.startTime && (
                <span className="ml-auto text-xs text-[var(--text-muted)]">
                  {rule.startTime}
                  {rule.endTime ? `–${rule.endTime}` : ''}
                </span>
              )}
            </motion.button>
          )
        })}
      </div>
    </SectionCard>
  )
}
