import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { todayIso } from '@renderer/lib/date'
import { getActivityIcon } from '@renderer/lib/icons'
import { useLogEntries } from '@renderer/hooks/useLogEntries'
import { SectionCard } from '@renderer/components/ui/SectionCard'
import { Chip } from '@renderer/components/ui/Chip'
import type { Activity, LogEntry } from '@shared/types'

interface TodayCardProps {
  activities: Activity[]
  refreshToken: number
}

export function TodayCard({ activities, refreshToken }: TodayCardProps): JSX.Element | null {
  const { quickAdd, undoLast } = useLogEntries()
  const [entries, setEntries] = useState<LogEntry[]>([])

  useEffect(() => {
    const today = todayIso()
    window.api.logEntries.listByRange(today, today).then(setEntries)
  }, [refreshToken])

  if (activities.length === 0) return null

  const totalsByActivity = new Map<string, number>()
  for (const entry of entries) {
    totalsByActivity.set(entry.activityId, (totalsByActivity.get(entry.activityId) ?? 0) + entry.count)
  }

  const toggle = (activity: Activity, logged: boolean): void => {
    if (logged) {
      undoLast(activity.id)
    } else {
      quickAdd(activity.id, activity.defaultIncrement)
    }
  }

  return (
    <SectionCard title="Today">
      <motion.div
        className="flex flex-wrap gap-2"
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.03 } } }}
      >
        {activities.map((activity) => {
          const Icon = getActivityIcon(activity.icon)
          const count = totalsByActivity.get(activity.id)
          const logged = count !== undefined
          return (
            <motion.div
              key={activity.id}
              variants={{ hidden: { opacity: 0, y: 4 }, show: { opacity: 1, y: 0 } }}
            >
              <Chip
                color={activity.color}
                active={logged}
                icon={Icon ?? undefined}
                label={activity.name}
                detail={logged ? `· ${count}${activity.unit ? ` ${activity.unit}` : ''}` : undefined}
                onClick={() => toggle(activity, logged)}
              />
            </motion.div>
          )
        })}
      </motion.div>
    </SectionCard>
  )
}
