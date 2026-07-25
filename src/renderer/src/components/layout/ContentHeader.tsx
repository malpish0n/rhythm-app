import { motion } from 'motion/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { MONTH_NAMES_FULL, todayIso, weekRange } from '@renderer/lib/date'
import { fastSpring } from '@renderer/lib/motionPresets'
import { CalendarFormatSwitcher } from './CalendarFormatSwitcher'
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

const navButtonClass =
  'flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text)] disabled:opacity-30 disabled:hover:bg-transparent'

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
        <motion.button
          whileTap={{ scale: 0.9 }}
          transition={fastSpring}
          onClick={onPrevDay}
          className={navButtonClass}
          aria-label="Previous day"
        >
          <ChevronLeft size={17} />
        </motion.button>
        <span className="w-44 text-center text-base font-semibold tabular-nums">{label}</span>
        <motion.button
          whileTap={{ scale: 0.9 }}
          transition={fastSpring}
          onClick={onNextDay}
          disabled={isToday}
          className={navButtonClass}
          aria-label="Next day"
        >
          <ChevronRight size={17} />
        </motion.button>
      </div>
    )
  } else if (calendarFormat === 'week') {
    dateNav = (
      <div className="flex items-center gap-1">
        <motion.button
          whileTap={{ scale: 0.9 }}
          transition={fastSpring}
          onClick={onPrevWeek}
          className={navButtonClass}
          aria-label="Previous week"
        >
          <ChevronLeft size={17} />
        </motion.button>
        <span className="w-44 text-center text-base font-semibold tabular-nums">
          {formatWeekLabel(weekCursor)}
        </span>
        <motion.button
          whileTap={{ scale: 0.9 }}
          transition={fastSpring}
          onClick={onNextWeek}
          disabled={isCurrentWeek}
          className={navButtonClass}
          aria-label="Next week"
        >
          <ChevronRight size={17} />
        </motion.button>
      </div>
    )
  } else {
    dateNav = (
      <div className="flex items-center gap-1">
        <motion.button
          whileTap={{ scale: 0.9 }}
          transition={fastSpring}
          onClick={onPrevMonth}
          className={navButtonClass}
          aria-label="Previous month"
        >
          <ChevronLeft size={17} />
        </motion.button>
        <span className="w-36 text-center text-base font-semibold tabular-nums">
          {MONTH_NAMES_FULL[monthCursor.month]} {monthCursor.year}
        </span>
        <motion.button
          whileTap={{ scale: 0.9 }}
          transition={fastSpring}
          onClick={onNextMonth}
          disabled={isCurrentMonth}
          className={navButtonClass}
          aria-label="Next month"
        >
          <ChevronRight size={17} />
        </motion.button>
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
