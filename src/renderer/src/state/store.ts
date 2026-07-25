import { create } from 'zustand'
import { DEFAULT_FONT } from '@renderer/lib/fonts'
import { todayIso } from '@renderer/lib/date'
import { loadCustomTheme, saveCustomTheme } from '@renderer/lib/customTheme'
import type { TimeFormat } from '@renderer/lib/time'
import type { ThemeColors } from '@renderer/lib/themes'
import type { Activity, DockIconStyle, PlanRule } from '@shared/types'

export type CategoryFilter = 'all' | string
export type CalendarFormat = 'day' | 'week' | 'month'

export interface MonthCursor {
  year: number
  month: number // 0-11
}

interface AppState {
  calendarFormat: CalendarFormat
  setCalendarFormat: (format: CalendarFormat) => void
  dayCursor: string
  setDayCursor: (date: string) => void
  weekCursor: string
  setWeekCursor: (date: string) => void
  monthCursor: MonthCursor
  setMonthCursor: (cursor: MonthCursor) => void
  activities: Activity[]
  setActivities: (activities: Activity[]) => void
  planRules: PlanRule[]
  setPlanRules: (planRules: PlanRule[]) => void
  year: number
  setYear: (year: number) => void
  categoryFilter: CategoryFilter
  setCategoryFilter: (filter: CategoryFilter) => void
  themeId: string
  setThemeId: (themeId: string) => void
  themeMode: 'system' | 'manual'
  setThemeMode: (mode: 'system' | 'manual') => void
  favoriteThemeIds: string[]
  toggleFavoriteTheme: (id: string) => void
  dockIconStyle: DockIconStyle
  setDockIconStyle: (style: DockIconStyle) => void
  heatmapColor: string | null // null = follow the current theme's accent color
  setHeatmapColor: (color: string | null) => void
  refreshToken: number
  bumpRefreshToken: () => void
  activityDialogOpen: boolean
  setActivityDialogOpen: (open: boolean) => void
  settingsOpen: boolean
  setSettingsOpen: (open: boolean) => void
  reduceMotion: boolean
  setReduceMotion: (value: boolean) => void
  fontId: string
  setFontId: (fontId: string) => void
  timeFormat: TimeFormat
  setTimeFormat: (timeFormat: TimeFormat) => void
  customThemeColors: ThemeColors
  setCustomThemeColor: (key: keyof ThemeColors, value: string) => void
  customThemeIsDark: boolean
  setCustomThemeIsDark: (isDark: boolean) => void
}

const now = new Date()
const REDUCE_MOTION_KEY = 'rhythm:reduceMotion'
const FONT_KEY = 'rhythm:fontId'
const TIME_FORMAT_KEY = 'rhythm:timeFormat'
const FAVORITE_THEMES_KEY = 'rhythm:favoriteThemes'
const HEATMAP_COLOR_KEY = 'rhythm:heatmapColor'

function loadFavoriteThemes(): string[] {
  try {
    const raw = localStorage.getItem(FAVORITE_THEMES_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}
const initialCustomTheme = loadCustomTheme()

export const useAppStore = create<AppState>((set) => ({
  calendarFormat: 'month',
  setCalendarFormat: (calendarFormat) => set({ calendarFormat }),
  dayCursor: todayIso(),
  setDayCursor: (dayCursor) => set({ dayCursor }),
  weekCursor: todayIso(),
  setWeekCursor: (weekCursor) => set({ weekCursor }),
  monthCursor: { year: now.getFullYear(), month: now.getMonth() },
  setMonthCursor: (monthCursor) => set({ monthCursor }),
  activities: [],
  setActivities: (activities) => set({ activities }),
  planRules: [],
  setPlanRules: (planRules) => set({ planRules }),
  year: now.getFullYear(),
  setYear: (year) => set({ year }),
  categoryFilter: 'all',
  setCategoryFilter: (categoryFilter) => set({ categoryFilter }),
  themeId: 'deep-space',
  setThemeId: (themeId) => set({ themeId }),
  themeMode: 'manual',
  setThemeMode: (themeMode) => set({ themeMode }),
  favoriteThemeIds: loadFavoriteThemes(),
  toggleFavoriteTheme: (id) =>
    set((state) => {
      const next = state.favoriteThemeIds.includes(id)
        ? state.favoriteThemeIds.filter((f) => f !== id)
        : [...state.favoriteThemeIds, id]
      localStorage.setItem(FAVORITE_THEMES_KEY, JSON.stringify(next))
      return { favoriteThemeIds: next }
    }),
  dockIconStyle: 'light',
  setDockIconStyle: (dockIconStyle) => set({ dockIconStyle }),
  heatmapColor: localStorage.getItem(HEATMAP_COLOR_KEY),
  setHeatmapColor: (heatmapColor) => {
    if (heatmapColor) localStorage.setItem(HEATMAP_COLOR_KEY, heatmapColor)
    else localStorage.removeItem(HEATMAP_COLOR_KEY)
    set({ heatmapColor })
  },
  refreshToken: 0,
  bumpRefreshToken: () => set((s) => ({ refreshToken: s.refreshToken + 1 })),
  activityDialogOpen: false,
  setActivityDialogOpen: (activityDialogOpen) => set({ activityDialogOpen }),
  settingsOpen: false,
  setSettingsOpen: (settingsOpen) => set({ settingsOpen }),
  reduceMotion: localStorage.getItem(REDUCE_MOTION_KEY) === 'true',
  setReduceMotion: (reduceMotion) => {
    localStorage.setItem(REDUCE_MOTION_KEY, String(reduceMotion))
    set({ reduceMotion })
  },
  fontId: localStorage.getItem(FONT_KEY) ?? DEFAULT_FONT,
  setFontId: (fontId) => {
    localStorage.setItem(FONT_KEY, fontId)
    set({ fontId })
  },
  timeFormat: (localStorage.getItem(TIME_FORMAT_KEY) as TimeFormat | null) ?? 'system',
  setTimeFormat: (timeFormat) => {
    localStorage.setItem(TIME_FORMAT_KEY, timeFormat)
    set({ timeFormat })
  },
  customThemeColors: initialCustomTheme.colors,
  setCustomThemeColor: (key, value) =>
    set((s) => {
      const customThemeColors = { ...s.customThemeColors, [key]: value }
      saveCustomTheme({ colors: customThemeColors, isDark: s.customThemeIsDark })
      return { customThemeColors }
    }),
  customThemeIsDark: initialCustomTheme.isDark,
  setCustomThemeIsDark: (customThemeIsDark) =>
    set((s) => {
      saveCustomTheme({ colors: s.customThemeColors, isDark: customThemeIsDark })
      return { customThemeIsDark }
    })
}))
