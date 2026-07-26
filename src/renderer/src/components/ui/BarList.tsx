import { motion } from 'motion/react'

export interface BarListRow {
  key: string
  label: string
  value: number
  color: string
  valueLabel?: string
}

interface BarListProps {
  rows: BarListRow[]
  max?: number
  labelWidth?: string
  barHeight?: string
}

export function BarList({
  rows,
  max,
  labelWidth = 'w-16',
  barHeight = 'h-2.5'
}: BarListProps): JSX.Element {
  const resolvedMax = max ?? Math.max(1, ...rows.map((r) => r.value))

  return (
    <div className="flex flex-col gap-2">
      {rows.map((row, i) => (
        <div key={row.key} className="flex items-center gap-3">
          <span className={`${labelWidth} flex-shrink-0 truncate text-xs text-[var(--text-muted)]`}>
            {row.label}
          </span>
          <div className={`${barHeight} flex-1 overflow-hidden rounded-full bg-[var(--surface-2)]`}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(row.value / resolvedMax) * 100}%` }}
              transition={{ duration: 0.4, ease: 'easeOut', delay: i * 0.03 }}
              className="h-full rounded-full"
              style={{ backgroundColor: row.color }}
            />
          </div>
          <span className="w-8 flex-shrink-0 text-right text-xs font-medium tabular-nums">
            {row.valueLabel ?? row.value}
          </span>
        </div>
      ))}
    </div>
  )
}
