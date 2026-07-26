import { motion } from 'motion/react'

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

interface WeekdayInsightProps {
  totals: number[]
  color: string
}

export function WeekdayInsight({ totals, color }: WeekdayInsightProps): JSX.Element {
  const max = Math.max(1, ...totals)

  return (
    <div>
      <p className="mb-3 text-xs text-[var(--text-muted)]">Busiest days of the week</p>
      <div className="flex items-end gap-2" style={{ height: 96 }}>
        {totals.map((total, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
            <div className="flex h-20 w-full items-end overflow-hidden rounded-md bg-[var(--surface-2)]">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(total / max) * 100}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="w-full rounded-md"
                style={{ backgroundColor: color }}
              />
            </div>
            <span className="text-[10px] text-[var(--text-muted)]">{WEEKDAY_LABELS[i]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
