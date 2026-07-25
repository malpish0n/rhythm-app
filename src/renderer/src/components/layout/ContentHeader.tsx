import { motion } from 'motion/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { MONTH_NAMES_FULL } from '@renderer/lib/date'
import { fastSpring } from '@renderer/lib/motionPresets'
import type { MonthCursor, ViewMode } from '@renderer/state/store'

interface ContentHeaderProps {
  viewMode: ViewMode
  year: number
  onPrevYear: () => void
  onNextYear: () => void
  monthCursor: MonthCursor
  onPrevMonth: () => void
  onNextMonth: () => void
}

const navButtonClass =
  'flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text)] disabled:opacity-30 disabled:hover:bg-transparent'

export function ContentHeader({
  viewMode,
  year,
  onPrevYear,
  onNextYear,
  monthCursor,
  onPrevMonth,
  onNextMonth
}: ContentHeaderProps): JSX.Element {
  const now = new Date()
  const isCurrentYear = year === now.getFullYear()
  const isCurrentMonth =
    monthCursor.year === now.getFullYear() && monthCursor.month === now.getMonth()

  if (viewMode === 'month') {
    return (
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
    <div className="flex items-center gap-1">
      <motion.button
        whileTap={{ scale: 0.9 }}
        transition={fastSpring}
        onClick={onPrevYear}
        className={navButtonClass}
        aria-label="Previous year"
      >
        <ChevronLeft size={17} />
      </motion.button>
      <span className="w-16 text-center text-base font-semibold tabular-nums">{year}</span>
      <motion.button
        whileTap={{ scale: 0.9 }}
        transition={fastSpring}
        onClick={onNextYear}
        disabled={isCurrentYear}
        className={navButtonClass}
        aria-label="Next year"
      >
        <ChevronRight size={17} />
      </motion.button>
    </div>
  )
}
