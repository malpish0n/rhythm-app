import { useEffect, useState } from 'react'
import { History } from 'lucide-react'
import { getActivityIcon } from '@renderer/lib/icons'
import { yearsAgoIso } from '@renderer/lib/date'
import { SectionCard } from '@renderer/components/ui/SectionCard'
import { Chip } from '@renderer/components/ui/Chip'
import type { Activity, LogEntry } from '@shared/types'

interface OnThisDayCardProps {
  date: string
  activities: Activity[]
}

interface YearMemory {
  yearsAgo: number
  entries: LogEntry[]
  note: string | null
}

const LOOKBACK_YEARS = [1, 2, 3]

export function OnThisDayCard({ date, activities }: OnThisDayCardProps): JSX.Element | null {
  const [memories, setMemories] = useState<YearMemory[]>([])

  useEffect(() => {
    let cancelled = false

    Promise.all(
      LOOKBACK_YEARS.map(async (yearsAgo) => {
        const target = yearsAgoIso(date, yearsAgo)
        const [entries, notes] = await Promise.all([
          window.api.logEntries.listByRange(target, target),
          window.api.dayNotes.listByRange(target, target)
        ])
        return { yearsAgo, entries, note: notes[0]?.content ?? null }
      })
    ).then((results) => {
      if (!cancelled) {
        setMemories(results.filter((m) => m.entries.length > 0 || m.note))
      }
    })

    return () => {
      cancelled = true
    }
  }, [date])

  if (memories.length === 0) return null

  return (
    <SectionCard title="On this day" icon={History} hoverLift>
      <div className="flex flex-col gap-3">
        {memories.map((memory) => {
          const loggedIds = [...new Set(memory.entries.map((e) => e.activityId))]
          return (
            <div key={memory.yearsAgo} className="flex flex-col gap-1.5">
              <p className="text-xs text-[var(--text-muted)]">
                {memory.yearsAgo === 1 ? '1 year ago' : `${memory.yearsAgo} years ago`}
              </p>
              {loggedIds.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {loggedIds.map((id) => {
                    const activity = activities.find((a) => a.id === id)
                    if (!activity) return null
                    const Icon = getActivityIcon(activity.icon)
                    return (
                      <Chip
                        key={id}
                        color={activity.color}
                        active
                        icon={Icon ?? undefined}
                        label={activity.name}
                      />
                    )
                  })}
                </div>
              )}
              {memory.note && (
                <p className="line-clamp-2 text-sm text-[var(--text-muted)]">{memory.note}</p>
              )}
            </div>
          )
        })}
      </div>
    </SectionCard>
  )
}
