import { useEffect, useState } from 'react'
import { MotionConfig, motion } from 'motion/react'
import { CalendarPlus } from 'lucide-react'
import { useAppStore } from '@renderer/state/store'
import { useActivities } from '@renderer/hooks/useActivities'
import { DEFAULT_DARK_THEME, DEFAULT_LIGHT_THEME, THEME_MAP } from '@renderer/lib/themes'
import { FONT_MAP, DEFAULT_FONT } from '@renderer/lib/fonts'
import { Sidebar } from '@renderer/components/layout/Sidebar'
import { ContentHeader } from '@renderer/components/layout/ContentHeader'
import { YearNav } from '@renderer/components/layout/YearNav'
import { MobileBottomBar } from '@renderer/components/layout/MobileBottomBar'
import { YearCalendar } from '@renderer/components/calendar/YearCalendar'
import { MonthCalendar } from '@renderer/components/calendar/MonthCalendar'
import { WeekView } from '@renderer/components/calendar/WeekView'
import { DayView } from '@renderer/components/calendar/DayView'
import { addDays, todayIso, weekRange } from '@renderer/lib/date'
import { StatsPanel } from '@renderer/components/stats/StatsPanel'
import { TodayCard } from '@renderer/components/stats/TodayCard'
import { SummaryView } from '@renderer/components/stats/SummaryView'
import { ActivityManagerDialog } from '@renderer/components/activities/ActivityManagerDialog'
import { SettingsDialog } from '@renderer/components/settings/SettingsDialog'
import { QuickAddFab } from '@renderer/components/quickadd/QuickAddFab'
import { PlanList } from '@renderer/components/plans/PlanList'

function App(): JSX.Element {
  const themeId = useAppStore((s) => s.themeId)
  const setThemeId = useAppStore((s) => s.setThemeId)
  const setDockIconStyle = useAppStore((s) => s.setDockIconStyle)
  const year = useAppStore((s) => s.year)
  const setYear = useAppStore((s) => s.setYear)
  const categoryFilter = useAppStore((s) => s.categoryFilter)
  const setCategoryFilter = useAppStore((s) => s.setCategoryFilter)
  const calendarFormat = useAppStore((s) => s.calendarFormat)
  const setCalendarFormat = useAppStore((s) => s.setCalendarFormat)
  const monthCursor = useAppStore((s) => s.monthCursor)
  const setMonthCursor = useAppStore((s) => s.setMonthCursor)
  const dayCursor = useAppStore((s) => s.dayCursor)
  const setDayCursor = useAppStore((s) => s.setDayCursor)
  const weekCursor = useAppStore((s) => s.weekCursor)
  const setWeekCursor = useAppStore((s) => s.setWeekCursor)
  const refreshToken = useAppStore((s) => s.refreshToken)
  const activityDialogOpen = useAppStore((s) => s.activityDialogOpen)
  const setActivityDialogOpen = useAppStore((s) => s.setActivityDialogOpen)
  const settingsOpen = useAppStore((s) => s.settingsOpen)
  const setSettingsOpen = useAppStore((s) => s.setSettingsOpen)
  const reduceMotion = useAppStore((s) => s.reduceMotion)
  const fontId = useAppStore((s) => s.fontId)
  const customThemeColors = useAppStore((s) => s.customThemeColors)
  const customThemeIsDark = useAppStore((s) => s.customThemeIsDark)

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
          : THEME_MAP[pref] || pref === 'custom'
            ? pref
            : DEFAULT_DARK_THEME
      setThemeId(resolved)
    })
    window.api.app.getDockIconStyle().then(setDockIconStyle)
  }, [setThemeId, setDockIconStyle])

  useEffect(() => {
    const isCustom = themeId === 'custom'
    const theme = THEME_MAP[themeId] ?? THEME_MAP[DEFAULT_DARK_THEME]
    const colors = isCustom ? customThemeColors : theme.colors
    const isDark = isCustom ? customThemeIsDark : theme.isDark
    const root = document.documentElement
    root.style.setProperty('--bg', colors.bg)
    root.style.setProperty('--surface', colors.surface)
    root.style.setProperty('--surface-2', colors.surface2)
    root.style.setProperty('--border', colors.border)
    root.style.setProperty('--text', colors.text)
    root.style.setProperty('--text-muted', colors.textMuted)
    root.style.setProperty('--accent', colors.accent)
    root.classList.toggle('dark', isDark)
    root.style.colorScheme = isDark ? 'dark' : 'light'
  }, [themeId, customThemeColors, customThemeIsDark])

  useEffect(() => {
    const font = FONT_MAP[fontId] ?? FONT_MAP[DEFAULT_FONT]
    document.documentElement.style.setProperty('--font-sans', font.stack)
  }, [fontId])

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

  const goPrevDay = (): void => {
    setDayCursor(addDays(dayCursor, -1))
  }

  const goNextDay = (): void => {
    if (dayCursor === todayIso()) return
    setDayCursor(addDays(dayCursor, 1))
  }

  const goPrevWeek = (): void => {
    setWeekCursor(addDays(weekCursor, -7))
  }

  const goNextWeek = (): void => {
    if (weekRange(weekCursor).start === weekRange(todayIso()).start) return
    setWeekCursor(addDays(weekCursor, 7))
  }

  const openCategoryManager = (): void => {
    setActivityDialogStartNew(false)
    setActivityDialogOpen(true)
  }

  const openNewCategory = (): void => {
    setActivityDialogStartNew(true)
    setActivityDialogOpen(true)
  }

  const openSettings = (): void => {
    setSettingsOpen(true)
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
    <MotionConfig reducedMotion={reduceMotion ? 'always' : 'user'}>
      <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
        <Sidebar
          activities={activities}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={setCategoryFilter}
          onManageCategories={openCategoryManager}
          onOpenSettings={openSettings}
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
                  calendarFormat={calendarFormat}
                  onCalendarFormatChange={setCalendarFormat}
                  monthCursor={monthCursor}
                  onPrevMonth={goPrevMonth}
                  onNextMonth={goNextMonth}
                  dayCursor={dayCursor}
                  onPrevDay={goPrevDay}
                  onNextDay={goNextDay}
                  weekCursor={weekCursor}
                  onPrevWeek={goPrevWeek}
                  onNextWeek={goNextWeek}
                />

                {calendarFormat === 'day' ? (
                  <DayView date={dayCursor} activities={activities} refreshToken={refreshToken} />
                ) : calendarFormat === 'week' ? (
                  <WeekView
                    weekCursor={weekCursor}
                    activities={activities}
                    categoryFilter={categoryFilter}
                    refreshToken={refreshToken}
                  />
                ) : (
                  <MonthCalendar
                    year={monthCursor.year}
                    month={monthCursor.month}
                    activities={activities}
                    categoryFilter={categoryFilter}
                    refreshToken={refreshToken}
                  />
                )}

                <TodayCard activities={activities} refreshToken={refreshToken} />

                <PlanList activities={activities} />

                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-[var(--text-muted)]">Statistics</h2>
                  <YearNav
                    year={year}
                    onPrevYear={() => setYear(year - 1)}
                    onNextYear={() => setYear(Math.min(year + 1, new Date().getFullYear()))}
                  />
                </div>

                <YearCalendar
                  year={year}
                  activities={activities}
                  categoryFilter={categoryFilter}
                  refreshToken={refreshToken}
                />

                <SummaryView
                  year={year}
                  activities={activities}
                  categoryFilter={categoryFilter}
                  refreshToken={refreshToken}
                />

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

        <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />

        <MobileBottomBar
          activities={activities}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={setCategoryFilter}
          onManageCategories={openCategoryManager}
          onOpenSettings={openSettings}
        />

        <QuickAddFab onClick={openNewCategory} />
      </div>
    </MotionConfig>
  )
}

export default App
