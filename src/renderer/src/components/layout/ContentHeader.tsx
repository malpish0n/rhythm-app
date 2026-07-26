import { MONTH_NAMES_FULL, todayIso, weekRange } from '@renderer/lib/date'
import { CalendarFormatSwitcher } from './CalendarFormatSwitcher'
import { NavArrowButton } from '@renderer/components/ui/NavArrowButton'
import type { CalendarFormat, MonthCursor } from '@renderer/state/store'

interface ContentHeaderProps {
  calendarFormat: CalendarFormat
  onCalendarFormatChange: (format: CalendarFormat) => void
  monthCursor: MonthCursor
  onPrevMonth: () => void
  onNextMonth: () => void
  dayCursor: string
  onPrevDay: () => void
  onNextDay: () => void
  weekCursor: string
  onPrevWeek: () => void
  onNextWeek: () => void
}

function formatWeekLabel(weekCursor: string): string {
  const { start, end } = weekRange(weekCursor)
  const startDate = new Date(start + 'T00:00:00')
  const endDate = new Date(end + 'T00:00:00')
  const sameMonth = startDate.getMonth() === endDate.getMonth()
  const startLabel = startDate.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric'
  })
  const endLabel = endDate.toLocaleDateString(
    undefined,
    sameMonth ? { day: 'numeric' } : { month: 'short', day: 'numeric' }
  )
  return `${startLabel} – ${endLabel}, ${endDate.getFullYear()}`
}

export function ContentHeader({
  calendarFormat,
  onCalendarFormatChange,
  monthCursor,
  onPrevMonth,
  onNextMonth,
  dayCursor,
  onPrevDay,
  onNextDay,
  weekCursor,
  onPrevWeek,
  onNextWeek
}: ContentHeaderProps): JSX.Element {
  const now = new Date()
  const isCurrentMonth =
    monthCursor.year === now.getFullYear() && monthCursor.month === now.getMonth()
  const isToday = dayCursor === todayIso()
  const isCurrentWeek = weekRange(weekCursor).start === weekRange(todayIso()).start

  let dateNav: JSX.Element

  if (calendarFormat === 'day') {
    const label = new Date(dayCursor + 'T00:00:00').toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    })
    dateNav = (
      <div className="flex items-center gap-1">
        <NavArrowButton direction="prev" label="Previous day" onClick={onPrevDay} tooltipSide="bottom" />
        <span className="w-44 text-center text-base font-semibold tabular-nums">{label}</span>
        <NavArrowButton
          direction="next"
          label="Next day"
          onClick={onNextDay}
          disabled={isToday}
          tooltipSide="bottom"
        />
      </div>
    )
  } else if (calendarFormat === 'week') {
    dateNav = (
      <div className="flex items-center gap-1">
        <NavArrowButton
          direction="prev"
          label="Previous week"
          onClick={onPrevWeek}
          tooltipSide="bottom"
        />
        <span className="w-44 text-center text-base font-semibold tabular-nums">
          {formatWeekLabel(weekCursor)}
        </span>
        <NavArrowButton
          direction="next"
          label="Next week"
          onClick={onNextWeek}
          disabled={isCurrentWeek}
          tooltipSide="bottom"
        />
      </div>
    )
  } else {
    dateNav = (
      <div className="flex items-center gap-1">
        <NavArrowButton
          direction="prev"
          label="Previous month"
          onClick={onPrevMonth}
          tooltipSide="bottom"
        />
        <span className="w-36 text-center text-base font-semibold tabular-nums">
          {MONTH_NAMES_FULL[monthCursor.month]} {monthCursor.year}
        </span>
        <NavArrowButton
          direction="next"
          label="Next month"
          onClick={onNextMonth}
          disabled={isCurrentMonth}
          tooltipSide="bottom"
        />
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between gap-2">
      {dateNav}
      <CalendarFormatSwitcher format={calendarFormat} onChange={onCalendarFormatChange} />
    </div>
  )
}
