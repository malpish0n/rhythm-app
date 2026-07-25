import { create } from 'zustand'
import type { Activity, PlanRule } from '@shared/types'

export type CategoryFilter = 'all' | string
export type ViewMode = 'month' | 'heatmap' | 'summary'

export interface MonthCursor {
  year: number
  month: number // 0-11
}

interface AppState {
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void
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
  refreshToken: number
  bumpRefreshToken: () => void
  activityDialogOpen: boolean
  setActivityDialogOpen: (open: boolean) => void
}

const now = new Date()

export const useAppStore = create<AppState>((set) => ({
  viewMode: 'month',
  setViewMode: (viewMode) => set({ viewMode }),
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
  themeId: 'olive-ember',
  setThemeId: (themeId) => set({ themeId }),
  refreshToken: 0,
  bumpRefreshToken: () => set((s) => ({ refreshToken: s.refreshToken + 1 })),
  activityDialogOpen: false,
  setActivityDialogOpen: (activityDialogOpen) => set({ activityDialogOpen })
}))
