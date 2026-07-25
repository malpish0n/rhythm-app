import { motion } from 'motion/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { fastSpring } from '@renderer/lib/motionPresets'

interface YearNavProps {
  year: number
  onPrevYear: () => void
  onNextYear: () => void
}

const navButtonClass =
  'flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text)] disabled:opacity-30 disabled:hover:bg-transparent'

export function YearNav({ year, onPrevYear, onNextYear }: YearNavProps): JSX.Element {
  const isCurrentYear = year === new Date().getFullYear()

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
