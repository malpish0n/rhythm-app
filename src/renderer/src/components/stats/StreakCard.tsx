import { motion } from 'motion/react'
import { Flame } from 'lucide-react'

interface StreakCardProps {
  label: string
  current: number
  longest: number
  color: string
  celebrate: boolean
}

export function StreakCard({ label, current, longest, color, celebrate }: StreakCardProps): JSX.Element {
  return (
    <motion.div
      layout
      className="flex flex-col gap-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-elevation-sm"
    >
      <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-muted)]">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
        {label}
      </div>
      <div className="flex items-baseline gap-2">
        <motion.span
          key={current}
          initial={celebrate ? { scale: 1.4 } : false}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 12 }}
          className="text-2xl font-semibold tabular-nums"
        >
          {current}
        </motion.span>
        <span className="text-xs text-[var(--text-muted)]">day streak</span>
        {celebrate && (
          <motion.span
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="text-orange-400"
          >
            <Flame size={16} />
          </motion.span>
        )}
      </div>
      <span className="text-xs text-[var(--text-muted)]">Longest: {longest}</span>
    </motion.div>
  )
}
