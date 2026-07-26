import { useEffect, useState } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import { CalendarPlus } from 'lucide-react'
import { useAppStore } from '@renderer/state/store'
import { useActivities } from '@renderer/hooks/useActivities'
import { DEFAULT_DARK_THEME, DEFAULT_LIGHT_THEME, THEME_MAP } from '@renderer/lib/themes'
import { FONT_MAP, DEFAULT_FONT } from '@renderer/lib/fonts'
import { fade } from '@renderer/lib/motionPresets'
import { Sidebar } from '@renderer/components/layout/Sidebar'
import { MobileBottomBar } from '@renderer/components/layout/MobileBottomBar'
import { todayIso } from '@renderer/lib/date'
import { HomeView } from '@renderer/views/HomeView'
import { CalendarView } from '@renderer/views/CalendarView'
import { StatsView } from '@renderer/views/StatsView'
import { ActivityManagerDialog } from '@renderer/components/activities/ActivityManagerDialog'
import { SettingsDialog } from '@renderer/components/settings/SettingsDialog'
import { CommandPalette } from '@renderer/components/layout/CommandPalette'
import { QuickAddFab } from '@renderer/components/quickadd/QuickAddFab'
import { TrayQuickLog } from '@renderer/components/tray/TrayQuickLog'

const isTrayWindow = new URLSearchParams(window.location.search).get('tray') === '1'

function App(): JSX.Element {
  const themeId = useAppStore((s) => s.themeId)
  const setThemeId = useAppStore((s) => s.setThemeId)
  const setThemeMode = useAppStore((s) => s.setThemeMode)
  const setDockIconStyle = useAppStore((s) => s.setDockIconStyle)
  const activeView = useAppStore((s) => s.activeView)
  const setActiveView = useAppStore((s) => s.setActiveView)
  const categoryFilter = useAppStore((s) => s.categoryFilter)
  const setCategoryFilter = useAppStore((s) => s.setCategoryFilter)
  const setCalendarFormat = useAppStore((s) => s.setCalendarFormat)
  const setDayCursor = useAppStore((s) => s.setDayCursor)
  const setWeekCursor = useAppStore((s) => s.setWeekCursor)
  const setMonthCursor = useAppStore((s) => s.setMonthCursor)
  const activityDialogOpen = useAppStore((s) => s.activityDialogOpen)
  const setActivityDialogOpen = useAppStore((s) => s.setActivityDialogOpen)
  const settingsOpen = useAppStore((s) => s.settingsOpen)
  const setSettingsOpen = useAppStore((s) => s.setSettingsOpen)
  const commandPaletteOpen = useAppStore((s) => s.commandPaletteOpen)
  const setCommandPaletteOpen = useAppStore((s) => s.setCommandPaletteOpen)
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
      setThemeMode(pref === 'system' ? 'system' : 'manual')
    })
    window.api.app.getDockIconStyle().then(setDockIconStyle)
  }, [setThemeId, setThemeMode, setDockIconStyle])

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

  useEffect(() => {
    const handler = (e: KeyboardEvent): void => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setCommandPaletteOpen(true)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [setCommandPaletteOpen])

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

  const goToToday = (): void => {
    const today = todayIso()
    const now = new Date()
    setDayCursor(today)
    setWeekCursor(today)
    setMonthCursor({ year: now.getFullYear(), month: now.getMonth() })
    setCalendarFormat('day')
    setActiveView('calendar')
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

  if (isTrayWindow) {
    return (
      <MotionConfig reducedMotion={reduceMotion ? 'always' : 'user'}>
        <TrayQuickLog />
      </MotionConfig>
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
                  className="accent-gradient mt-2 rounded-lg px-4 py-2 text-sm font-medium text-white shadow-elevation-sm transition-shadow hover:shadow-elevation-md"
                >
                  Create your first activity
                </motion.button>
              </motion.div>
            ) : (
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={activeView}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={fade}
                >
                  {activeView === 'home' ? (
                    <HomeView />
                  ) : activeView === 'calendar' ? (
                    <CalendarView />
                  ) : (
                    <StatsView />
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </main>

        <ActivityManagerDialog
          open={activityDialogOpen}
          startNew={activityDialogStartNew}
          onClose={() => setActivityDialogOpen(false)}
        />

        <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />

        <CommandPalette
          open={commandPaletteOpen}
          onClose={() => setCommandPaletteOpen(false)}
          activities={activities}
          onGoToToday={goToToday}
          onOpenSettings={openSettings}
          onManageCategories={openCategoryManager}
        />

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
