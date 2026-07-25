import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Repeat, Trash2 } from 'lucide-react'
import { usePlanRules } from '@renderer/hooks/usePlanRules'
import { getActivityIcon } from '@renderer/lib/icons'
import { RecurrencePicker, type RecurrenceValue } from './RecurrencePicker'
import type { Activity, PlanRule } from '@shared/types'

const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function describe(rule: PlanRule): string {
  let base: string
  if (rule.frequency === 'once') {
    const d = new Date(rule.startDate + 'T00:00:00')
    base = `On ${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
  } else if (rule.frequency === 'daily') {
    base = rule.interval === 1 ? 'Every day' : `Every ${rule.interval} days`
  } else if (rule.frequency === 'monthly') {
    const day = new Date(rule.startDate + 'T00:00:00').getDate()
    base =
      rule.interval === 1
        ? `Every month on the ${day}`
        : `Every ${rule.interval} months on the ${day}`
  } else {
    const days = [...rule.weekdays].sort().map((d) => WEEKDAY_SHORT[d]).join(', ')
    base = rule.interval === 1 ? `Every week on ${days}` : `Every ${rule.interval} weeks on ${days}`
  }
  return rule.startTime && rule.endTime ? `${base}, ${rule.startTime}–${rule.endTime}` : base
}

interface PlanListProps {
  activities: Activity[]
}

export function PlanList({ activities }: PlanListProps): JSX.Element | null {
  const { planRules, updatePlan, deletePlan } = usePlanRules()
  const [editingId, setEditingId] = useState<string | null>(null)

  const recurring = planRules.filter((r) => r.frequency !== 'once')
  if (recurring.length === 0) return null

  const handleSave = async (rule: PlanRule, value: RecurrenceValue): Promise<void> => {
    await updatePlan(rule.id, {
      frequency: value.frequency,
      interval: value.interval,
      weekdays: value.frequency === 'weekly' ? value.weekdays : [],
      startTime: value.startTime,
      endTime: value.endTime
    })
    setEditingId(null)
  }

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-elevation-sm">
      <p className="mb-3 flex items-center gap-1.5 text-xs font-medium text-[var(--text-muted)]">
        <Repeat size={12} /> Recurring plans
      </p>
      <div className="flex flex-col gap-2">
        <AnimatePresence initial={false}>
          {recurring.map((rule) => {
            const activity = activities.find((a) => a.id === rule.activityId)
            if (!activity) return null
            const Icon = getActivityIcon(activity.icon)

            if (editingId === rule.id) {
              return (
                <motion.div key={rule.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <RecurrencePicker
                    initialDate={rule.startDate}
                    initial={{
                      frequency: rule.frequency,
                      interval: rule.interval,
                      weekdays: rule.weekdays,
                      allDay: !rule.startTime,
                      startTime: rule.startTime,
                      endTime: rule.endTime
                    }}
                    onSave={(value) => handleSave(rule, value)}
                    onCancel={() => setEditingId(null)}
                  />
                </motion.div>
              )
            }

            return (
              <motion.div
                key={rule.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 shadow-elevation-sm transition-shadow hover:shadow-elevation-md"
              >
                <span
                  className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: activity.color }}
                />
                {Icon && <Icon size={13} className="flex-shrink-0 text-[var(--text-muted)]" />}
                <span className="flex-1 truncate text-sm">{activity.name}</span>
                <span className="text-xs text-[var(--text-muted)]">{describe(rule)}</span>
                <button
                  onClick={() => setEditingId(rule.id)}
                  className="rounded-md p-1 text-[var(--text-muted)] hover:text-[var(--text)]"
                  aria-label="Edit schedule"
                >
                  <Repeat size={13} />
                </button>
                <button
                  onClick={() => deletePlan(rule.id)}
                  className="rounded-md p-1 text-[var(--text-muted)] hover:text-red-500"
                  aria-label="Delete schedule"
                >
                  <Trash2 size={13} />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
