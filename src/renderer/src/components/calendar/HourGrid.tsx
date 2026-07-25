import { useEffect, useMemo, useRef, useState } from 'react'
import { formatEntryTime, formatHourLabel } from '@renderer/lib/time'
import type { Activity, LogEntry } from '@shared/types'
import type { TimeFormat } from '@renderer/lib/time'

export interface HourGridColumn {
  date: string
  label: string
  isToday: boolean
}

export interface PlannedRangeItem {
  ruleId: string
  date: string
  activityId: string
  startTime: string // 'HH:MM'
  endTime: string // 'HH:MM'
}

interface HourGridProps {
  columns: HourGridColumn[]
  entriesByDate: Map<string, LogEntry[]>
  activities: Activity[]
  timeFormat: TimeFormat
  plannedRanges?: PlannedRangeItem[]
  onDayClick?: (date: string) => void
}

function timeToHourFraction(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h + m / 60
}

const HOURS = Array.from({ length: 24 }, (_, i) => i)
const ROW_HEIGHT = 48

export function HourGrid({
  columns,
  entriesByDate,
  activities,
  timeFormat,
  plannedRanges = [],
  onDayClick
}: HourGridProps): JSX.Element {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 7 * ROW_HEIGHT })
  }, [])

  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])
  const currentHour = now.getHours()
  const currentMinutePct = (now.getMinutes() / 60) * 100

  const { allDayByDate, timedByKey, hasAllDay } = useMemo(() => {
    const allDay = new Map<string, LogEntry[]>()
    const timed = new Map<string, LogEntry[]>()
    let any = false

    for (const col of columns) {
      for (const entry of entriesByDate.get(col.date) ?? []) {
        if (!entry.time) {
          const list = allDay.get(col.date) ?? []
          list.push(entry)
          allDay.set(col.date, list)
          any = true
        } else {
          const hour = Number(entry.time.slice(0, 2))
          const key = `${col.date}|${hour}`
          const list = timed.get(key) ?? []
          list.push(entry)
          timed.set(key, list)
        }
      }
    }

    return { allDayByDate: allDay, timedByKey: timed, hasAllDay: any }
  }, [columns, entriesByDate])

  const plannedByStartKey = useMemo(() => {
    const map = new Map<string, PlannedRangeItem[]>()
    for (const item of plannedRanges) {
      const startHour = Math.floor(timeToHourFraction(item.startTime))
      const key = `${item.date}|${startHour}`
      const list = map.get(key) ?? []
      list.push(item)
      map.set(key, list)
    }
    return map
  }, [plannedRanges])

  const gridTemplateColumns = `3.5rem repeat(${columns.length}, 1fr)`

  return (
    <div className="flex flex-col">
      <div className="grid" style={{ gridTemplateColumns }}>
        <div />
        {columns.map((col) => (
          <div
            key={col.date}
            className="pb-2 text-center text-xs font-medium"
            style={{ color: col.isToday ? 'var(--accent)' : 'var(--text-muted)' }}
          >
            {col.label}
          </div>
        ))}
      </div>

      {hasAllDay && (
        <div
          className="mb-1 grid border-b border-[var(--border)] pb-2"
          style={{ gridTemplateColumns }}
        >
          <div className="pr-2 text-right text-[9px] uppercase tracking-wide text-[var(--text-muted)]">
            All day
          </div>
          {columns.map((col) => (
            <div key={col.date} className="flex flex-wrap gap-1 px-1">
              {(allDayByDate.get(col.date) ?? []).map((entry) => {
                const activity = activities.find((a) => a.id === entry.activityId)
                if (!activity) return null
                return (
                  <button
                    key={entry.id}
                    onClick={() => onDayClick?.(col.date)}
                    className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
                    style={{ backgroundColor: `${activity.color}22`, color: activity.color }}
                  >
                    <span
                      className="h-1.5 w-1.5 flex-shrink-0 rounded-full"
                      style={{ backgroundColor: activity.color }}
                    />
                    {activity.name}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      )}

      <div ref={scrollRef} className="max-h-[28rem] overflow-y-auto">
        {HOURS.map((hour) => (
          <div
            key={hour}
            className="grid"
            style={{ gridTemplateColumns, minHeight: ROW_HEIGHT }}
          >
            <div className="-translate-y-2 pr-2 text-right text-[9px] text-[var(--text-muted)]">
              {formatHourLabel(hour, timeFormat)}
            </div>
            {columns.map((col) => {
              const items = timedByKey.get(`${col.date}|${hour}`) ?? []
              return (
                <div
                  key={col.date}
                  onClick={() => onDayClick?.(col.date)}
                  className="relative cursor-pointer border-t border-[var(--border)] px-1 py-0.5 transition-colors hover:bg-[var(--surface-2)]"
                >
                  {col.isToday && hour === currentHour && (
                    <div
                      className="pointer-events-none absolute inset-x-0 z-10"
                      style={{ top: `${currentMinutePct}%` }}
                    >
                      <div className="absolute -left-1 -top-[3px] h-[7px] w-[7px] rounded-full bg-red-500" />
                      <div className="h-[2px] bg-red-500" />
                    </div>
                  )}
                  {items.map((entry) => {
                    const activity = activities.find((a) => a.id === entry.activityId)
                    if (!activity) return null
                    if (entry.endTime) {
                      const startFrac = timeToHourFraction(entry.time!)
                      const endFrac = timeToHourFraction(entry.endTime)
                      const top = (startFrac - hour) * ROW_HEIGHT
                      const height = Math.max(18, (endFrac - startFrac) * ROW_HEIGHT - 2)
                      return (
                        <div
                          key={entry.id}
                          className="absolute inset-x-1 z-[5] overflow-hidden truncate rounded px-1.5 py-0.5 text-[10px] font-medium text-white"
                          style={{ top, height, backgroundColor: activity.color }}
                        >
                          {formatEntryTime(entry.time!, timeFormat)} {activity.name}
                        </div>
                      )
                    }
                    return (
                      <div
                        key={entry.id}
                        className="mb-0.5 truncate rounded px-1.5 py-0.5 text-[10px] font-medium text-white"
                        style={{ backgroundColor: activity.color }}
                      >
                        {formatEntryTime(entry.time!, timeFormat)} {activity.name}
                      </div>
                    )
                  })}
                  {(plannedByStartKey.get(`${col.date}|${hour}`) ?? []).map((item) => {
                    const activity = activities.find((a) => a.id === item.activityId)
                    if (!activity) return null
                    const startFrac = timeToHourFraction(item.startTime)
                    const endFrac = timeToHourFraction(item.endTime)
                    const top = (startFrac - hour) * ROW_HEIGHT
                    const height = Math.max(18, (endFrac - startFrac) * ROW_HEIGHT - 2)
                    return (
                      <div
                        key={item.ruleId}
                        className="absolute inset-x-1 z-[5] overflow-hidden truncate rounded border border-dashed px-1.5 py-0.5 text-[10px] font-medium"
                        style={{
                          top,
                          height,
                          backgroundColor: `${activity.color}22`,
                          borderColor: activity.color,
                          color: activity.color
                        }}
                      >
                        {formatEntryTime(item.startTime, timeFormat)} {activity.name}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
