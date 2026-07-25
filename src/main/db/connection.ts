import { app } from 'electron'
import path from 'path'
import Database from 'better-sqlite3'
import { MIGRATIONS } from '@shared/sql'

let db: Database.Database | null = null

export function getDb(): Database.Database {
  if (db) return db

  const dbPath = path.join(app.getPath('userData'), 'activity-tracker.db')
  db = new Database(dbPath)
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')

  runMigrations(db)

  return db
}

function runMigrations(database: Database.Database): void {
  database.exec(
    `CREATE TABLE IF NOT EXISTS app_meta (key TEXT PRIMARY KEY, value TEXT);`
  )

  const row = database
    .prepare(`SELECT value FROM app_meta WHERE key = 'schema_version'`)
    .get() as { value: string } | undefined
  const currentVersion = row ? Number(row.value) : 0

  const pending = MIGRATIONS.filter((m) => m.version > currentVersion).sort(
    (a, b) => a.version - b.version
  )

  for (const migration of pending) {
    const apply = database.transaction(() => {
      database.exec(migration.sql)
      database
        .prepare(
          `INSERT INTO app_meta (key, value) VALUES ('schema_version', ?)
           ON CONFLICT(key) DO UPDATE SET value = excluded.value`
        )
        .run(String(migration.version))
    })
    apply()
  }
}
