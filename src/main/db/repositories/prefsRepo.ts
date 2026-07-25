import { getDb } from '../connection'
import type { ThemePreference } from '@shared/types'

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
