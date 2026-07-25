import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useYearMatrix, type DayTotals } from '@renderer/hooks/useYearMatrix'
import { useAppStore } from '@renderer/state/store'
import { resolveActiveAccent } from '@renderer/lib/themes'
import { DayCell } from './DayCell'
import { MonthBlock } from './MonthBlock'
import { CalendarLegend } from './CalendarLegend'
import { CalendarTooltip } from './CalendarTooltip'
import { DayDetailPopover } from './DayDetailPopover'
import type { Activity } from '@shared/types'

const GAP = 3

interface YearCalendarProps {
  year: number
  activities: Activity[]
  categoryFilter: string
  refreshToken: number
}

export function YearCalendar({
  year,
  activities,
  categoryFilter,
  refreshToken
}: YearCalendarProps): JSX.Element {
  const heatmapColorOverride = useAppStore((s) => s.heatmapColor)
  const themeId = useAppStore((s) => s.themeId)
  const customAccent = useAppStore((s) => s.customThemeColors.accent)
  const heatmapColor = heatmapColorOverride ?? resolveActiveAccent(themeId, customAccent)
  const activeActivity =
    categoryFilter === 'all' ? undefined : activities.find((a) => a.id === categoryFilter)

  const { matrix, totalsByDate, maxCount, loading } = useYearMatrix(
    year,
    activeActivity?.id,
    refreshToken
  )

  const [hover, setHover] = useState<{
    date: string
    totals: DayTotals | undefined
    position: { x: number; y: number }
  } | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const handleHover = (
    date: string,
    totals: DayTotals | undefined,
    e: React.MouseEvent
  ): void => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setHover({ date, totals, position: { x: rect.left + rect.width / 2, y: rect.top } })
  }

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-elevation-sm">
      <AnimatePresence mode="wait">
        <motion.div
          key={`${year}-${categoryFilter}`}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.25 }}
        >
          <div className="flex" style={{ gap: GAP }}>
            <div className="flex flex-shrink-0 flex-col justify-between pb-1 pr-2 pt-5 text-xs text-[var(--text-muted)]">
              <span>Mon</span>
              <span>Wed</span>
              <span>Fri</span>
            </div>

            {/* py-1 gives hover-scaled cells breathing room so they don't visually clip against the edges */}
            <div className="min-w-0 flex-1 py-1">
              <MonthBlock monthLabels={matrix.monthLabels} totalWeeks={matrix.weeks.length} />

              <div
                className="grid"
                style={{
                  gridTemplateColumns: `repeat(${matrix.weeks.length}, minmax(0, 1fr))`,
                  gap: GAP,
                  marginTop: 4
                }}
              >
                {matrix.weeks.map((week, weekIdx) => (
                  <div key={weekIdx} className="grid" style={{ gridTemplateRows: 'repeat(7, 1fr)', gap: GAP }}>
                    {week.map((day, dayIdx) => (
                      <DayCell
                        key={day.date}
                        date={day.date}
                        inYear={day.inYear}
                        totals={totalsByDate.get(day.date)}
                        maxCount={maxCount}
                        activeActivity={activeActivity}
                        heatmapColor={heatmapColor}
                        index={weekIdx * 7 + dayIdx}
                        onHover={handleHover}
                        onLeave={() => setHover(null)}
                        onClick={setSelectedDate}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-[var(--text-muted)]">
          {loading ? 'Loading…' : `${year} activity`}
        </span>
        <CalendarLegend color={activeActivity?.color ?? heatmapColor} />
      </div>

      <CalendarTooltip
        date={hover?.date ?? null}
        totals={hover?.totals}
        activities={activities}
        position={hover?.position ?? null}
      />

      {selectedDate && (
        <DayDetailPopover
          date={selectedDate}
          activities={activities}
          refreshToken={refreshToken}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  )
}
