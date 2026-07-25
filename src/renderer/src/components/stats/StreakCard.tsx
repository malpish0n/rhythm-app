import { motion } from 'motion/react'
import { AnimatedFlame } from './AnimatedFlame'

interface StreakCardProps {
  label: string
  current: number
  longest: number
  color: string
  celebrate: boolean
}

export function StreakCard({
  label,
  current,
  longest,
  color,
  celebrate
}: StreakCardProps): JSX.Element {
  return (
    <motion.div
      layout
      className="flex flex-col gap-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-elevation-sm"
    >
      <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-muted)]">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
        {label}
      </div>
      <div className="flex items-center gap-2">
        <AnimatedFlame current={current} />
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
      </div>
      <span className="text-xs text-[var(--text-muted)]">Longest: {longest}</span>
    </motion.div>
  )
}
