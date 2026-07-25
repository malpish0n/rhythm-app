import { getDb } from '../connection'
import type { DockIconStyle, ThemePreference } from '@shared/types'

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
