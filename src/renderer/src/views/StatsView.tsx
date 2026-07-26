import { useState } from 'react'
import { motion } from 'motion/react'
import { Sparkles } from 'lucide-react'
import { useAppStore } from '@renderer/state/store'
import { staggerContainer, staggerItem } from '@renderer/lib/motionPresets'
import { YearNav } from '@renderer/components/layout/YearNav'
import { YearCalendar } from '@renderer/components/calendar/YearCalendar'
import { SummaryView } from '@renderer/components/stats/SummaryView'
import { StatsPanel } from '@renderer/components/stats/StatsPanel'
import { WrappedDialog } from '@renderer/components/stats/WrappedDialog'

export function StatsView(): JSX.Element {
  const activities = useAppStore((s) => s.activities)
  const categoryFilter = useAppStore((s) => s.categoryFilter)
  const refreshToken = useAppStore((s) => s.refreshToken)
  const year = useAppStore((s) => s.year)
  const setYear = useAppStore((s) => s.setYear)
  const [wrappedOpen, setWrappedOpen] = useState(false)

  return (
    <motion.div className="flex flex-col gap-6" initial="hidden" animate="show" variants={staggerContainer}>
      <motion.div variants={staggerItem} className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[var(--text-muted)]">Statistics</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWrappedOpen(true)}
            className="accent-gradient flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-white shadow-elevation-sm transition-shadow hover:shadow-elevation-md"
          >
            <Sparkles size={13} />
            {year} Wrapped
          </button>
          <YearNav
            year={year}
            onPrevYear={() => setYear(year - 1)}
            onNextYear={() => setYear(Math.min(year + 1, new Date().getFullYear()))}
          />
        </div>
      </motion.div>

      <motion.div variants={staggerItem}>
        <YearCalendar
          year={year}
          activities={activities}
          categoryFilter={categoryFilter}
          refreshToken={refreshToken}
        />
      </motion.div>

      <motion.div variants={staggerItem}>
        <SummaryView
          year={year}
          activities={activities}
          categoryFilter={categoryFilter}
          refreshToken={refreshToken}
        />
      </motion.div>

      <motion.div variants={staggerItem}>
        <StatsPanel activities={activities} refreshToken={refreshToken} />
      </motion.div>

      <WrappedDialog
        open={wrappedOpen}
        year={year}
        activities={activities}
        onClose={() => setWrappedOpen(false)}
      />
    </motion.div>
  )
}
