import type { MonthLabel } from '@renderer/lib/date'

interface MonthBlockProps {
  monthLabels: MonthLabel[]
  cellWidth: number
  gap: number
  noIndent?: boolean
}

export function MonthBlock({
  monthLabels,
  cellWidth,
  gap,
  noIndent
}: MonthBlockProps): JSX.Element {
  return (
    <div className="relative h-4" style={{ marginLeft: noIndent ? 0 : 24 }}>
      {monthLabels.map((m) => (
        <span
          key={`${m.label}-${m.weekIndex}`}
          className="absolute text-xs text-[var(--text-muted)]"
          style={{ left: m.weekIndex * (cellWidth + gap) }}
        >
          {m.label}
        </span>
      ))}
    </div>
  )
}
