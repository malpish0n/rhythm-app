import { Notification } from 'electron'
import { getDb } from './db/connection'
import * as prefsRepo from './db/repositories/prefsRepo'

let intervalHandle: NodeJS.Timeout | null = null
let firedForDate: string | null = null

function todayIso(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function currentHm(): string {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function hasLoggedToday(today: string): boolean {
  const db = getDb()
  const row = db.prepare(`SELECT 1 FROM log_entries WHERE date = ? LIMIT 1`).get(today)
  return row !== undefined
}

function tick(): void {
  const prefs = prefsRepo.getNotificationPrefs()
  if (!prefs.enabled) return

  const today = todayIso()
  if (firedForDate === today) return
  if (currentHm() !== prefs.time) return
  if (hasLoggedToday(today)) return

  new Notification({
    title: 'Rhythm',
    body: "You haven't logged anything today"
  }).show()
  firedForDate = today
}

export function startNotificationScheduler(): void {
  if (intervalHandle) return
  intervalHandle = setInterval(tick, 60_000)
}
