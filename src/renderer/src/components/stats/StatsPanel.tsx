import { useEffect, useState } from 'react'
import { StreakCard } from './StreakCard'
import { TotalsBarChart } from './TotalsBarChart'
import type { Activity, ActivityTotals, StreakResult } from '@shared/types'

const MILESTONES = [7, 30, 100]

interface StatsPanelProps {
  activities: Activity[]
  refreshToken: number
}

export function StatsPanel({ activities, refreshToken }: StatsPanelProps): JSX.Element {
  const [overallStreak, setOverallStreak] = useState<StreakResult>({ current: 0, longest: 0 })
  const [totals, setTotals] = useState<ActivityTotals[]>([])
  const [celebrate, setCelebrate] = useState(false)
  const [prevCurrent, setPrevCurrent] = useState(0)

  useEffect(() => {
    Promise.all([window.api.stats.streak(), window.api.stats.totalsPerActivity()]).then(
      ([streak, totalsResult]) => {
        if (streak.current > prevCurrent && MILESTONES.includes(streak.current)) {
          setCelebrate(true)
          setTimeout(() => setCelebrate(false), 1200)
        }
        setPrevCurrent(streak.current)
        setOverallStreak(streak)
        setTotals(totalsResult)
      }
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshToken])

  const totalsMap = new Map(totals.map((t) => [t.activityId, t.total]))

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <StreakCard
        label="Overall"
        current={overallStreak.current}
        longest={overallStreak.longest}
        color="#22c55e"
        celebrate={celebrate}
      />
      <TotalsBarChart activities={activities} totals={totalsMap} />
    </div>
  )
}
