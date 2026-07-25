import { getDb } from '../connection'
import { SQL, toDayNote, type DayNoteRow } from '@shared/sql'
import type { DayNote } from '@shared/types'

export function listByRange(startDate: string, endDate: string): DayNote[] {
  const db = getDb()
  const rows = db.prepare(SQL.dayNotes.listByRange).all(startDate, endDate) as DayNoteRow[]
  return rows.map(toDayNote)
}

export function upsert(date: string, content: string): DayNote {
  const db = getDb()
  const updatedAt = new Date().toISOString()

  if (content.trim() === '') {
    db.prepare(SQL.dayNotes.delete).run(date)
    return { date, content: '', updatedAt }
  }

  db.prepare(SQL.dayNotes.upsert).run(date, content, updatedAt)
  return { date, content, updatedAt }
}

export function remove(date: string): void {
  const db = getDb()
  db.prepare(SQL.dayNotes.delete).run(date)
}
