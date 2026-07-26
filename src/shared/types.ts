export interface Activity {
  id: string
  name: string
  color: string
  icon: string | null
  defaultIncrement: number
  unit: string | null
  weeklyTarget: number | null
  archived: boolean
  sortOrder: number
  createdAt: string
}

export interface LogEntry {
  id: string
  activityId: string
  date: string // 'YYYY-MM-DD'
  count: number
  note: string | null
  createdAt: string
  time: string | null // 'HH:MM' 24h, null for untimed/legacy entries
  endTime: string | null // 'HH:MM' 24h, null when the entry has no duration
}

export interface DayAggregate {
  date: string
  activityId: string
  total: number
}

export interface DayNote {
  date: string // 'YYYY-MM-DD'
  content: string
  updatedAt: string
}

export interface ActivityTotals {
  activityId: string
  entries: number
  total: number
}

export interface StreakResult {
  current: number
  longest: number
}

export type ThemePreference = 'system' | string
export type DockIconStyle = 'light' | 'dark'

export interface NotificationPrefs {
  enabled: boolean
  time: string // 'HH:MM' 24h, reminder time
}

export interface CreateActivityInput {
  name: string
  color: string
  icon?: string | null
  defaultIncrement?: number
  unit?: string | null
  weeklyTarget?: number | null
}

export interface UpdateActivityInput {
  name?: string
  color?: string
  icon?: string | null
  defaultIncrement?: number
  unit?: string | null
  weeklyTarget?: number | null
  sortOrder?: number
}

export interface UpdateLogEntryInput {
  note?: string | null
  count?: number
  time?: string | null
  endTime?: string | null
}

export type PlanFrequency = 'once' | 'daily' | 'weekly' | 'monthly'

export interface PlanRule {
  id: string
  activityId: string
  frequency: PlanFrequency
  startDate: string // 'YYYY-MM-DD'
  endDate: string | null
  interval: number
  weekdays: number[] // 0-6 (Sun-Sat), only meaningful for 'weekly'
  startTime: string | null // 'HH:MM' 24h, null for all-day
  endTime: string | null // 'HH:MM' 24h, null for all-day
  note: string | null
  createdAt: string
  skippedDates: string[]
}

export interface CreatePlanRuleInput {
  activityId: string
  frequency: PlanFrequency
  startDate: string
  endDate?: string | null
  interval?: number
  weekdays?: number[]
  startTime?: string | null
  endTime?: string | null
  note?: string | null
}

export interface UpdatePlanRuleInput {
  frequency?: PlanFrequency
  startDate?: string
  endDate?: string | null
  interval?: number
  weekdays?: number[]
  startTime?: string | null
  endTime?: string | null
  note?: string | null
}

export interface ActivityApi {
  activities: {
    list(includeArchived?: boolean): Promise<Activity[]>
    create(input: CreateActivityInput): Promise<Activity>
    update(id: string, patch: UpdateActivityInput): Promise<Activity>
    archive(id: string): Promise<void>
    unarchive(id: string): Promise<void>
    delete(id: string): Promise<void>
    reorder(orderedIds: string[]): Promise<void>
  }
  logEntries: {
    listByRange(startDate: string, endDate: string, activityId?: string): Promise<LogEntry[]>
    aggregateByRange(
      startDate: string,
      endDate: string,
      activityId?: string
    ): Promise<DayAggregate[]>
    quickAdd(activityId: string, date?: string, count?: number): Promise<LogEntry>
    update(id: string, patch: UpdateLogEntryInput): Promise<LogEntry>
    undoLast(activityId: string, date: string): Promise<void>
    delete(id: string): Promise<void>
  }
  stats: {
    totalsPerActivity(): Promise<ActivityTotals[]>
    streak(activityId?: string): Promise<StreakResult>
  }
  plans: {
    list(): Promise<PlanRule[]>
    create(input: CreatePlanRuleInput): Promise<PlanRule>
    update(id: string, patch: UpdatePlanRuleInput): Promise<PlanRule>
    delete(id: string): Promise<void>
    skipOccurrence(planRuleId: string, date: string): Promise<void>
    unskipOccurrence(planRuleId: string, date: string): Promise<void>
  }
  dayNotes: {
    listByRange(startDate: string, endDate: string): Promise<DayNote[]>
    search(query: string): Promise<DayNote[]>
    upsert(date: string, content: string): Promise<DayNote>
    delete(date: string): Promise<void>
  }
  app: {
    getTheme(): Promise<ThemePreference>
    setTheme(theme: ThemePreference): Promise<void>
    getDockIconStyle(): Promise<DockIconStyle>
    setDockIconStyle(style: DockIconStyle): Promise<void>
    getNotificationPrefs(): Promise<NotificationPrefs>
    setNotificationPrefs(prefs: NotificationPrefs): Promise<void>
  }
}
