import type { MonthLabel } from '@renderer/lib/date'

interface MonthBlockProps {
  monthLabels: MonthLabel[]
  totalWeeks: number
}

export function MonthBlock({ monthLabels, totalWeeks }: MonthBlockProps): JSX.Element {
  return (
    <div className="relative h-4">
      {monthLabels.map((m) => (
        <span
          key={`${m.label}-${m.weekIndex}`}
          className="absolute text-xs text-[var(--text-muted)]"
          style={{ left: `${(m.weekIndex / totalWeeks) * 100}%` }}
        >
          {m.label}
        </span>
      ))}
    </div>
  )
}
