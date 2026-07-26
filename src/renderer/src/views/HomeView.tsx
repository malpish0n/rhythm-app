import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { Sparkles, X } from 'lucide-react'
import { useAppStore } from '@renderer/state/store'
import { todayIso } from '@renderer/lib/date'
import { staggerContainer, staggerItem } from '@renderer/lib/motionPresets'
import { AnimatedFlame } from '@renderer/components/stats/AnimatedFlame'
import { TodayCard } from '@renderer/components/stats/TodayCard'
import { OnThisDayCard } from '@renderer/components/stats/OnThisDayCard'
import { WeeklyGoals } from '@renderer/components/home/WeeklyGoals'
import { PlannedToday } from '@renderer/components/home/PlannedToday'
import { PlanList } from '@renderer/components/plans/PlanList'
import type { StreakResult } from '@shared/types'

const ONBOARDING_SEEN_KEY = 'rhythm:onboardingSeen'

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export function HomeView(): JSX.Element {
  const activities = useAppStore((s) => s.activities)
  const refreshToken = useAppStore((s) => s.refreshToken)
  const today = todayIso()
  const [streak, setStreak] = useState<StreakResult>({ current: 0, longest: 0 })
  const [showTips, setShowTips] = useState(
    () => localStorage.getItem(ONBOARDING_SEEN_KEY) !== 'true'
  )

  useEffect(() => {
    window.api.stats.streak().then(setStreak)
  }, [refreshToken])

  const dismissTips = (): void => {
    localStorage.setItem(ONBOARDING_SEEN_KEY, 'true')
    setShowTips(false)
  }

  const dateLabel = new Date(today + 'T00:00:00').toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  })

  return (
    <motion.div
      className="mx-auto flex w-full max-w-3xl flex-col gap-6"
      initial="hidden"
      animate="show"
      variants={staggerContainer}
    >
      <motion.div variants={staggerItem} className="flex items-center justify-between">
        <div>
          <h1
            className="bg-clip-text text-2xl font-bold text-transparent"
            style={{
              backgroundImage:
                'linear-gradient(90deg, var(--accent), color-mix(in srgb, var(--accent) 55%, var(--text)))'
            }}
          >
            {getGreeting()}
          </h1>
          <p className="text-sm text-[var(--text-muted)]">{dateLabel}</p>
        </div>
        {streak.current > 0 && (
          <div className="flex items-center gap-1.5">
            <AnimatedFlame current={streak.current} />
            <span className="text-lg font-semibold tabular-nums">{streak.current}</span>
          </div>
        )}
      </motion.div>

      {showTips && (
        <motion.div
          variants={staggerItem}
          className="flex items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-elevation-sm"
        >
          <Sparkles size={16} className="mt-0.5 flex-shrink-0 text-[var(--accent)]" />
          <p className="flex-1 text-sm text-[var(--text-muted)]">
            Tips: press <span className="font-medium text-[var(--text)]">⌘K</span> to search or
            log from anywhere · tap a chip above to log today · set weekly goals from{' '}
            <span className="font-medium text-[var(--text)]">Manage categories</span>.
          </p>
          <button
            onClick={dismissTips}
            aria-label="Dismiss tips"
            className="flex-shrink-0 text-[var(--text-muted)] hover:text-[var(--text)]"
          >
            <X size={14} />
          </button>
        </motion.div>
      )}

      <motion.div variants={staggerItem}>
        <TodayCard activities={activities} refreshToken={refreshToken} />
      </motion.div>
      <motion.div variants={staggerItem}>
        <WeeklyGoals activities={activities} refreshToken={refreshToken} />
      </motion.div>
      <motion.div variants={staggerItem}>
        <PlannedToday activities={activities} refreshToken={refreshToken} />
      </motion.div>
      <motion.div variants={staggerItem}>
        <PlanList activities={activities} />
      </motion.div>
      <motion.div variants={staggerItem}>
        <OnThisDayCard date={today} activities={activities} />
      </motion.div>
    </motion.div>
  )
}
