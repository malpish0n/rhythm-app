import { getDb } from '../connection'
import type { DockIconStyle, NotificationPrefs, ThemePreference } from '@shared/types'

export function getTheme(): ThemePreference {
  const db = getDb()
  const row = db.prepare(`SELECT value FROM app_meta WHERE key = 'theme'`).get() as
    | { value: string }
    | undefined
  return (row?.value as ThemePreference) ?? 'system'
}

export function setTheme(theme: ThemePreference): void {
  const db = getDb()
  db.prepare(
    `INSERT INTO app_meta (key, value) VALUES ('theme', ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`
  ).run(theme)
}

export function getDockIconStyle(): DockIconStyle {
  const db = getDb()
  const row = db.prepare(`SELECT value FROM app_meta WHERE key = 'dockIconStyle'`).get() as
    | { value: string }
    | undefined
  return row?.value === 'dark' ? 'dark' : 'light'
}

export function setDockIconStyle(style: DockIconStyle): void {
  const db = getDb()
  db.prepare(
    `INSERT INTO app_meta (key, value) VALUES ('dockIconStyle', ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`
  ).run(style)
}

export function getNotificationPrefs(): NotificationPrefs {
  const db = getDb()
  const row = db.prepare(`SELECT value FROM app_meta WHERE key = 'notificationPrefs'`).get() as
    | { value: string }
    | undefined
  if (!row) return { enabled: false, time: '20:00' }
  try {
    return JSON.parse(row.value) as NotificationPrefs
  } catch {
    return { enabled: false, time: '20:00' }
  }
}

export function setNotificationPrefs(prefs: NotificationPrefs): void {
  const db = getDb()
  db.prepare(
    `INSERT INTO app_meta (key, value) VALUES ('notificationPrefs', ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`
  ).run(JSON.stringify(prefs))
}
