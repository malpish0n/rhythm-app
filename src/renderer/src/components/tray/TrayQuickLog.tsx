import { getActivityIcon } from '@renderer/lib/icons'
import { useActivities } from '@renderer/hooks/useActivities'
import { useLogEntries } from '@renderer/hooks/useLogEntries'
import { useAppStore } from '@renderer/state/store'
import { todayIso } from '@renderer/lib/date'
import { fastSpring } from '@renderer/lib/motionPresets'
import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import type { LogEntry } from '@shared/types'

export function TrayQuickLog(): JSX.Element {
  const { activities } = useActivities()
  const { quickAdd, undoLast } = useLogEntries()
  const refreshToken = useAppStore((s) => s.refreshToken)
  const [entries, setEntries] = useState<LogEntry[]>([])

  useEffect(() => {
    const today = todayIso()
    window.api.logEntries.listByRange(today, today).then(setEntries)
  }, [refreshToken])

  const loggedIds = new Set(entries.map((e) => e.activityId))

  return (
    <div className="flex h-screen w-screen flex-col gap-3 bg-[var(--bg)] p-4 text-[var(--text)]">
      <p className="text-xs font-medium text-[var(--text-muted)]">Log today</p>
      <div className="flex flex-1 flex-col gap-1.5 overflow-y-auto">
        {activities.length === 0 && (
          <p className="py-6 text-center text-sm text-[var(--text-muted)]">
            No activities yet — add some from the main window.
          </p>
        )}
        {activities.map((activity) => {
          const Icon = getActivityIcon(activity.icon)
          const logged = loggedIds.has(activity.id)
          return (
            <motion.button
              key={activity.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={fastSpring}
              onClick={() =>
                logged
                  ? undoLast(activity.id)
                  : quickAdd(activity.id, activity.defaultIncrement)
              }
              className="flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm font-medium transition-colors"
              style={{
                borderColor: logged ? activity.color : 'var(--border)',
                backgroundColor: logged ? `${activity.color}22` : 'var(--surface-2)',
                color: logged ? activity.color : 'var(--text)'
              }}
            >
              {Icon && <Icon size={14} />}
              <span className="flex-1">{activity.name}</span>
              {logged && <span className="text-xs">✓</span>}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
