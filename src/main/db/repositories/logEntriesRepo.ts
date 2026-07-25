import { randomUUID } from 'crypto'
import { getDb } from '../connection'
import { SQL, toLogEntry, todayIso, computeStreak, type LogEntryRow } from '@shared/sql'
import type { ActivityTotals, DayAggregate, LogEntry, StreakResult, UpdateLogEntryInput } from '@shared/types'

export function listByRange(startDate: string, endDate: string, activityId?: string): LogEntry[] {
  const db = getDb()
  const rows = activityId
    ? (db.prepare(SQL.logEntries.listByRangeActivity).all(startDate, endDate, activityId) as LogEntryRow[])
    : (db.prepare(SQL.logEntries.listByRangeAll).all(startDate, endDate) as LogEntryRow[])
  return rows.map(toLogEntry)
}

export function aggregateByRange(
  startDate: string,
  endDate: string,
  activityId?: string
): DayAggregate[] {
  const db = getDb()
  const rows = activityId
    ? (db
        .prepare(SQL.logEntries.aggregateByRangeActivity)
        .all(startDate, endDate, activityId) as { date: string; activity_id: string; total: number }[])
    : (db
        .prepare(SQL.logEntries.aggregateByRangeAll)
        .all(startDate, endDate) as { date: string; activity_id: string; total: number }[])

  return rows.map((r) => ({ date: r.date, activityId: r.activity_id, total: r.total }))
}

export function quickAdd(activityId: string, date?: string, count = 1): LogEntry {
  const db = getDb()
  const id = randomUUID()
  const entryDate = date ?? todayIso()
  const createdAt = new Date().toISOString()

  try {
    db.prepare(SQL.logEntries.insert).run(id, activityId, entryDate, count, null, createdAt)
  } catch (err) {
    // A stray double-tap can race the UI's own "already logged today" check —
    // the unique (activity_id, date) index rejects the duplicate; return the
    // existing entry instead of surfacing an error for that harmless race.
    if (err instanceof Error && err.message.includes('UNIQUE constraint failed')) {
      const existing = db
        .prepare(SQL.logEntries.lastForActivityDate)
        .get(activityId, entryDate) as { id: string }
      return toLogEntry(db.prepare(SQL.logEntries.getById).get(existing.id) as LogEntryRow)
    }
    throw err
  }

  return toLogEntry(db.prepare(SQL.logEntries.getById).get(id) as LogEntryRow)
}

export function update(id: string, patch: UpdateLogEntryInput): LogEntry {
  const db = getDb()
  const existing = db.prepare(SQL.logEntries.getById).get(id) as LogEntryRow | undefined
  if (!existing) throw new Error(`Log entry not found: ${id}`)

  const note = patch.note !== undefined ? patch.note : existing.note
  const count = patch.count ?? existing.count

  db.prepare(SQL.logEntries.updateNoteCount).run(note, count, id)

  return toLogEntry({ ...existing, note, count })
}

export function undoLast(activityId: string, date: string): void {
  const db = getDb()
  const row = db.prepare(SQL.logEntries.lastForActivityDate).get(activityId, date) as
    | { id: string }
    | undefined
  if (row) {
    db.prepare(SQL.logEntries.delete).run(row.id)
  }
}

export function remove(id: string): void {
  const db = getDb()
  db.prepare(SQL.logEntries.delete).run(id)
}

export function totalsPerActivity(): ActivityTotals[] {
  const db = getDb()
  const rows = db.prepare(SQL.logEntries.totalsPerActivity).all() as {
    activity_id: string
    entries: number
    total: number
  }[]
  return rows.map((r) => ({ activityId: r.activity_id, entries: r.entries, total: r.total }))
}

export function streak(activityId?: string): StreakResult {
  const db = getDb()
  const rows = activityId
    ? (db.prepare(SQL.logEntries.distinctDatesActivity).all(activityId) as { date: string }[])
    : (db.prepare(SQL.logEntries.distinctDatesAll).all() as { date: string }[])

  return computeStreak(rows.map((r) => r.date))
}
