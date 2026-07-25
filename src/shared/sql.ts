import migration001 from './migrations/001_init.sql?raw'
import migration002 from './migrations/002_add_increment.sql?raw'
import migration003 from './migrations/003_unique_activity_date.sql?raw'
import migration004 from './migrations/004_plan_rules.sql?raw'
import type { Activity, LogEntry, PlanRule, StreakResult } from './types'

export const MIGRATIONS: { version: number; sql: string }[] = [
  { version: 1, sql: migration001 },
  { version: 2, sql: migration002 },
  { version: 3, sql: migration003 },
  { version: 4, sql: migration004 }
]

export const SQL = {
  activities: {
    listActive:
      'SELECT * FROM activities WHERE archived = 0 ORDER BY sort_order ASC, created_at ASC',
    listAll: 'SELECT * FROM activities ORDER BY sort_order ASC, created_at ASC',
    maxSortOrder: 'SELECT COALESCE(MAX(sort_order), -1) AS maxOrder FROM activities',
    insert: `INSERT INTO activities (id, name, color, icon, default_increment, archived, sort_order, created_at)
             VALUES (?, ?, ?, ?, ?, 0, ?, ?)`,
    getById: 'SELECT * FROM activities WHERE id = ?',
    update:
      'UPDATE activities SET name = ?, color = ?, icon = ?, default_increment = ?, sort_order = ? WHERE id = ?',
    archive: 'UPDATE activities SET archived = 1 WHERE id = ?',
    delete: 'DELETE FROM activities WHERE id = ?',
    updateSortOrder: 'UPDATE activities SET sort_order = ? WHERE id = ?'
  },
  logEntries: {
    listByRangeAll: 'SELECT * FROM log_entries WHERE date BETWEEN ? AND ? ORDER BY date ASC',
    listByRangeActivity:
      'SELECT * FROM log_entries WHERE date BETWEEN ? AND ? AND activity_id = ? ORDER BY date ASC',
    aggregateByRangeAll: `SELECT date, activity_id, SUM(count) AS total FROM log_entries
       WHERE date BETWEEN ? AND ?
       GROUP BY date, activity_id`,
    aggregateByRangeActivity: `SELECT date, activity_id, SUM(count) AS total FROM log_entries
       WHERE date BETWEEN ? AND ? AND activity_id = ?
       GROUP BY date, activity_id`,
    insert: `INSERT INTO log_entries (id, activity_id, date, count, note, created_at)
             VALUES (?, ?, ?, ?, ?, ?)`,
    getById: 'SELECT * FROM log_entries WHERE id = ?',
    updateNoteCount: 'UPDATE log_entries SET note = ?, count = ? WHERE id = ?',
    lastForActivityDate: `SELECT id FROM log_entries WHERE activity_id = ? AND date = ?
       ORDER BY created_at DESC LIMIT 1`,
    delete: 'DELETE FROM log_entries WHERE id = ?',
    totalsPerActivity: `SELECT activity_id, COUNT(*) AS entries, SUM(count) AS total
       FROM log_entries GROUP BY activity_id`,
    distinctDatesAll: 'SELECT DISTINCT date FROM log_entries ORDER BY date ASC',
    distinctDatesActivity:
      'SELECT DISTINCT date FROM log_entries WHERE activity_id = ? ORDER BY date ASC'
  },
  planRules: {
    listAll: 'SELECT * FROM plan_rules ORDER BY created_at ASC',
    insert: `INSERT INTO plan_rules (id, activity_id, frequency, start_date, end_date, interval, weekdays, note, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    getById: 'SELECT * FROM plan_rules WHERE id = ?',
    update: `UPDATE plan_rules SET frequency = ?, start_date = ?, end_date = ?, interval = ?, weekdays = ?, note = ?
              WHERE id = ?`,
    delete: 'DELETE FROM plan_rules WHERE id = ?'
  },
  planExceptions: {
    listAll: 'SELECT * FROM plan_exceptions',
    insert: 'INSERT OR IGNORE INTO plan_exceptions (id, plan_rule_id, date) VALUES (?, ?, ?)',
    delete: 'DELETE FROM plan_exceptions WHERE plan_rule_id = ? AND date = ?'
  }
} as const

export interface ActivityRow {
  id: string
  name: string
  color: string
  icon: string | null
  default_increment: number
  archived: number
  sort_order: number
  created_at: string
}

export interface LogEntryRow {
  id: string
  activity_id: string
  date: string
  count: number
  note: string | null
  created_at: string
}

export function toActivity(row: ActivityRow): Activity {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    icon: row.icon,
    defaultIncrement: row.default_increment,
    archived: row.archived === 1,
    sortOrder: row.sort_order,
    createdAt: row.created_at
  }
}

export interface PlanRuleRow {
  id: string
  activity_id: string
  frequency: string
  start_date: string
  end_date: string | null
  interval: number
  weekdays: string | null
  note: string | null
  created_at: string
}

export interface PlanExceptionRow {
  id: string
  plan_rule_id: string
  date: string
}

export function toPlanRule(row: PlanRuleRow, skippedDates: string[]): PlanRule {
  return {
    id: row.id,
    activityId: row.activity_id,
    frequency: row.frequency as PlanRule['frequency'],
    startDate: row.start_date,
    endDate: row.end_date,
    interval: row.interval,
    weekdays: row.weekdays ? (JSON.parse(row.weekdays) as number[]) : [],
    note: row.note,
    createdAt: row.created_at,
    skippedDates
  }
}

export function toLogEntry(row: LogEntryRow): LogEntry {
  return {
    id: row.id,
    activityId: row.activity_id,
    date: row.date,
    count: row.count,
    note: row.note,
    createdAt: row.created_at
  }
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

export function computeStreak(sortedIsoDates: string[]): StreakResult {
  if (sortedIsoDates.length === 0) return { current: 0, longest: 0 }

  const dayMs = 24 * 60 * 60 * 1000
  const toUtcDays = (iso: string): number => {
    const [y, m, d] = iso.split('-').map(Number)
    return Date.UTC(y, m - 1, d) / dayMs
  }

  const dayNumbers = Array.from(new Set(sortedIsoDates.map(toUtcDays))).sort((a, b) => a - b)

  let longest = 1
  let run = 1
  for (let i = 1; i < dayNumbers.length; i++) {
    if (dayNumbers[i] === dayNumbers[i - 1] + 1) {
      run += 1
    } else {
      longest = Math.max(longest, run)
      run = 1
    }
  }
  longest = Math.max(longest, run)

  const todayDayNumber = Math.floor(Date.now() / dayMs)
  const lastLoggedDay = dayNumbers[dayNumbers.length - 1]

  let current = 0
  if (lastLoggedDay === todayDayNumber || lastLoggedDay === todayDayNumber - 1) {
    current = 1
    for (let i = dayNumbers.length - 1; i > 0; i--) {
      if (dayNumbers[i] === dayNumbers[i - 1] + 1) {
        current += 1
      } else {
        break
      }
    }
  }

  return { current, longest }
}
