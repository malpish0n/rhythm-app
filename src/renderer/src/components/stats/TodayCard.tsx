import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { todayIso } from '@renderer/lib/date'
import { getActivityIcon } from '@renderer/lib/icons'
import { useLogEntries } from '@renderer/hooks/useLogEntries'
import { fastSpring } from '@renderer/lib/motionPresets'
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
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-elevation-sm">
      <p className="mb-3 text-xs font-medium text-[var(--text-muted)]">Today</p>
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
            <motion.button
              key={activity.id}
              variants={{ hidden: { opacity: 0, y: 4 }, show: { opacity: 1, y: 0 } }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.95 }}
              transition={fastSpring}
              onClick={() => toggle(activity, logged)}
              className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium shadow-elevation-sm transition-colors active:shadow-none"
              style={{
                borderColor: logged ? activity.color : 'var(--border)',
                backgroundColor: logged ? `${activity.color}22` : 'var(--surface-2)',
                color: logged ? activity.color : 'var(--text-muted)'
              }}
            >
              {Icon && <Icon size={12} />}
              {activity.name}
              {logged && <span className="tabular-nums">· {count}</span>}
            </motion.button>
          )
        })}
      </motion.div>
    </div>
  )
}
