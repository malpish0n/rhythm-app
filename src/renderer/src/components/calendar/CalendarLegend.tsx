import { intensityRgba } from '@renderer/lib/color'

interface CalendarLegendProps {
  color: string
}

export function CalendarLegend({ color }: CalendarLegendProps): JSX.Element {
  return (
    <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
      <span>Less</span>
      <div className="h-3 w-3 rounded-[3px] bg-[var(--surface-2)]" />
      {[1, 2, 3, 4].map((step) => (
        <div
          key={step}
          className="h-3 w-3 rounded-[3px]"
          style={{ backgroundColor: intensityRgba(step, 4, color) }}
        />
      ))}
      <span>More</span>
    </div>
  )
}
