import { useEffect, useState } from 'react'
import { MotionConfig, motion } from 'motion/react'
import { CalendarPlus } from 'lucide-react'
import { useAppStore } from '@renderer/state/store'
import { useActivities } from '@renderer/hooks/useActivities'
import { DEFAULT_DARK_THEME, DEFAULT_LIGHT_THEME, THEME_MAP } from '@renderer/lib/themes'
import { Sidebar } from '@renderer/components/layout/Sidebar'
import { ContentHeader } from '@renderer/components/layout/ContentHeader'
import { MobileBottomBar } from '@renderer/components/layout/MobileBottomBar'
import { YearCalendar } from '@renderer/components/calendar/YearCalendar'
import { MonthCalendar } from '@renderer/components/calendar/MonthCalendar'
import { StatsPanel } from '@renderer/components/stats/StatsPanel'
import { TodayCard } from '@renderer/components/stats/TodayCard'
import { SummaryView } from '@renderer/components/stats/SummaryView'
import { ActivityManagerDialog } from '@renderer/components/activities/ActivityManagerDialog'
import { QuickAddFab } from '@renderer/components/quickadd/QuickAddFab'
import { PlanList } from '@renderer/components/plans/PlanList'

function App(): JSX.Element {
  const themeId = useAppStore((s) => s.themeId)
  const setThemeId = useAppStore((s) => s.setThemeId)
  const year = useAppStore((s) => s.year)
  const setYear = useAppStore((s) => s.setYear)
  const categoryFilter = useAppStore((s) => s.categoryFilter)
  const setCategoryFilter = useAppStore((s) => s.setCategoryFilter)
  const viewMode = useAppStore((s) => s.viewMode)
  const setViewMode = useAppStore((s) => s.setViewMode)
  const monthCursor = useAppStore((s) => s.monthCursor)
  const setMonthCursor = useAppStore((s) => s.setMonthCursor)
  const refreshToken = useAppStore((s) => s.refreshToken)
  const activityDialogOpen = useAppStore((s) => s.activityDialogOpen)
  const setActivityDialogOpen = useAppStore((s) => s.setActivityDialogOpen)

  const { activities } = useActivities()
  const [activityDialogStartNew, setActivityDialogStartNew] = useState(false)
  const [apiMissing, setApiMissing] = useState(false)

  useEffect(() => {
    if (typeof window.api === 'undefined') {
      setApiMissing(true)
      return
    }
    window.api.app.getTheme().then((pref) => {
      const resolved =
        pref === 'system'
          ? window.matchMedia('(prefers-color-scheme: dark)').matches
            ? DEFAULT_DARK_THEME
            : DEFAULT_LIGHT_THEME
          : THEME_MAP[pref]
            ? pref
            : DEFAULT_DARK_THEME
      setThemeId(resolved)
    })
  }, [setThemeId])

  useEffect(() => {
    const theme = THEME_MAP[themeId] ?? THEME_MAP[DEFAULT_DARK_THEME]
    const root = document.documentElement
    root.style.setProperty('--bg', theme.colors.bg)
    root.style.setProperty('--surface', theme.colors.surface)
    root.style.setProperty('--surface-2', theme.colors.surface2)
    root.style.setProperty('--border', theme.colors.border)
    root.style.setProperty('--text', theme.colors.text)
    root.style.setProperty('--text-muted', theme.colors.textMuted)
    root.style.setProperty('--accent', theme.colors.accent)
    root.classList.toggle('dark', theme.isDark)
    root.style.colorScheme = theme.isDark ? 'dark' : 'light'
  }, [themeId])

  const goPrevMonth = (): void => {
    let { year: y, month: m } = monthCursor
    m -= 1
    if (m < 0) {
      m = 11
      y -= 1
    }
    setMonthCursor({ year: y, month: m })
  }

  const goNextMonth = (): void => {
    const now = new Date()
    if (monthCursor.year === now.getFullYear() && monthCursor.month === now.getMonth()) return
    let { year: y, month: m } = monthCursor
    m += 1
    if (m > 11) {
      m = 0
      y += 1
    }
    setMonthCursor({ year: y, month: m })
  }

  const openCategoryManager = (): void => {
    setActivityDialogStartNew(false)
    setActivityDialogOpen(true)
  }

  const openNewCategory = (): void => {
    setActivityDialogStartNew(true)
    setActivityDialogOpen(true)
  }

  if (apiMissing) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[var(--bg)] text-[var(--text)]">
        <p className="text-sm text-[var(--text-muted)]">
          Preload API not available — open this app through Electron, not a plain browser tab.
        </p>
      </div>
    )
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
        <Sidebar
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          activities={activities}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={setCategoryFilter}
          onManageCategories={openCategoryManager}
        />

        <main className="lg:pl-60">
          <div
            className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 sm:px-8"
            style={{
              paddingTop: 'max(1.5rem, env(safe-area-inset-top))',
              paddingBottom: 'max(6rem, calc(env(safe-area-inset-bottom) + 5rem))'
            }}
          >
            {activities.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] py-16 text-center shadow-elevation-sm"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--surface-2)] text-[var(--accent)]">
                  <CalendarPlus size={22} />
                </div>
                <h2 className="text-base font-semibold">No activities yet</h2>
                <p className="max-w-xs text-sm text-[var(--text-muted)]">
                  Create your first activity to start tracking — coding, gym, reading, anything
                  you want to build a streak on.
                </p>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={openNewCategory}
                  className="mt-2 rounded-lg px-4 py-2 text-sm font-medium text-white shadow-elevation-sm transition-shadow hover:shadow-elevation-md"
                  style={{
                    backgroundImage:
                      'linear-gradient(180deg, color-mix(in srgb, var(--accent) 92%, white), var(--accent))'
                  }}
                >
                  Create your first activity
                </motion.button>
              </motion.div>
            ) : (
              <>
                <ContentHeader
                  viewMode={viewMode}
                  year={year}
                  onPrevYear={() => setYear(year - 1)}
                  onNextYear={() => setYear(Math.min(year + 1, new Date().getFullYear()))}
                  monthCursor={monthCursor}
                  onPrevMonth={goPrevMonth}
                  onNextMonth={goNextMonth}
                />

                {viewMode === 'month' ? (
                  <MonthCalendar
                    year={monthCursor.year}
                    month={monthCursor.month}
                    activities={activities}
                    categoryFilter={categoryFilter}
                    refreshToken={refreshToken}
                  />
                ) : viewMode === 'heatmap' ? (
                  <YearCalendar
                    year={year}
                    activities={activities}
                    categoryFilter={categoryFilter}
                    refreshToken={refreshToken}
                  />
                ) : (
                  <SummaryView
                    year={year}
                    activities={activities}
                    categoryFilter={categoryFilter}
                    refreshToken={refreshToken}
                  />
                )}

                <TodayCard activities={activities} refreshToken={refreshToken} />

                <PlanList activities={activities} />

                <StatsPanel activities={activities} refreshToken={refreshToken} />
              </>
            )}
          </div>
        </main>

        <ActivityManagerDialog
          open={activityDialogOpen}
          startNew={activityDialogStartNew}
          onClose={() => setActivityDialogOpen(false)}
        />

        <MobileBottomBar
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          activities={activities}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={setCategoryFilter}
          onManageCategories={openCategoryManager}
        />

        <QuickAddFab onClick={openNewCategory} />
      </div>
    </MotionConfig>
  )
}

export default App
