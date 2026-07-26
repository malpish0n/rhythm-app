import { SectionCard } from '@renderer/components/ui/SectionCard'
import { BarList } from '@renderer/components/ui/BarList'
import type { Activity } from '@shared/types'

interface TotalsBarChartProps {
  activities: Activity[]
  totals: Map<string, number>
}

export function TotalsBarChart({ activities, totals }: TotalsBarChartProps): JSX.Element {
  return (
    <SectionCard title="Totals by category" hoverLift>
      {activities.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)]">No categories yet.</p>
      ) : (
        <BarList
          labelWidth="w-20"
          barHeight="h-2"
          rows={activities.map((activity) => ({
            key: activity.id,
            label: activity.name,
            value: totals.get(activity.id) ?? 0,
            color: activity.color
          }))}
        />
      )}
    </SectionCard>
  )
}
