import { SQLiteConnection, CapacitorSQLite, type SQLiteDBConnection } from '@capacitor-community/sqlite'
import {
  SQL,
  MIGRATIONS,
  toActivity,
  toLogEntry,
  toPlanRule,
  toDayNote,
  todayIso,
  computeStreak
} from '@shared/sql'
import type {
  Activity,
  ActivityApi,
  CreateActivityInput,
  CreatePlanRuleInput,
  DayAggregate,
  DockIconStyle,
  LogEntry,
  PlanRule,
  ThemePreference,
  UpdateActivityInput,
  UpdateLogEntryInput,
  UpdatePlanRuleInput
} from '@shared/types'

const DB_NAME = 'activity_tracker'

let dbPromise: Promise<SQLiteDBConnection> | null = null

async function getDb(): Promise<SQLiteDBConnection> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const sqlite = new SQLiteConnection(CapacitorSQLite)
      const db = await sqlite.createConnection(DB_NAME, false, 'no-encryption', 2, false)
      await db.open()
      await runMigrations(db)
      return db
    })()
  }
  return dbPromise
}

async function runMigrations(db: SQLiteDBConnection): Promise<void> {
  await db.execute(`CREATE TABLE IF NOT EXISTS app_meta (key TEXT PRIMARY KEY, value TEXT);`)

  const res = await db.query(`SELECT value FROM app_meta WHERE key = 'schema_version'`)
  const currentVersion = res.values?.[0]?.value ? Number(res.values[0].value) : 0

  const pending = MIGRATIONS.filter((m) => m.version > currentVersion).sort(
    (a, b) => a.version - b.version
  )

  for (const migration of pending) {
    await db.execute(migration.sql)
    await db.run(
      `INSERT INTO app_meta (key, value) VALUES ('schema_version', ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
      [String(migration.version)]
    )
  }
}

function newId(): string {
  return crypto.randomUUID()
}

export function createCapacitorApi(): ActivityApi {
  return {
    activities: {
      async list(includeArchived = false) {
        const db = await getDb()
        const res = await db.query(includeArchived ? SQL.activities.listAll : SQL.activities.listActive)
        return (res.values ?? []).map(toActivity)
      },
      async create(input: CreateActivityInput): Promise<Activity> {
        const db = await getDb()
        const id = newId()
        const createdAt = new Date().toISOString()
        const maxRes = await db.query(SQL.activities.maxSortOrder)
        const maxOrder = maxRes.values?.[0]?.maxOrder ?? -1

        await db.run(SQL.activities.insert, [
          id,
          input.name,
          input.color,
          input.icon ?? null,
          input.defaultIncrement ?? 1,
          maxOrder + 1,
          createdAt
        ])

        const res = await db.query(SQL.activities.getById, [id])
        return toActivity(res.values![0])
      },
      async update(id: string, patch: UpdateActivityInput): Promise<Activity> {
        const db = await getDb()
        const existingRes = await db.query(SQL.activities.getById, [id])
        const existing = existingRes.values?.[0]
        if (!existing) throw new Error(`Activity not found: ${id}`)

        const next = {
          name: patch.name ?? existing.name,
          color: patch.color ?? existing.color,
          icon: patch.icon !== undefined ? patch.icon : existing.icon,
          default_increment: patch.defaultIncrement ?? existing.default_increment,
          sort_order: patch.sortOrder ?? existing.sort_order
        }

        await db.run(SQL.activities.update, [
          next.name,
          next.color,
          next.icon,
          next.default_increment,
          next.sort_order,
          id
        ])

        return toActivity({ ...existing, ...next })
      },
      async archive(id: string): Promise<void> {
        const db = await getDb()
        await db.run(SQL.activities.archive, [id])
      },
      async delete(id: string): Promise<void> {
        const db = await getDb()
        await db.run(SQL.activities.delete, [id])
      },
      async reorder(orderedIds: string[]): Promise<void> {
        const db = await getDb()
        for (let i = 0; i < orderedIds.length; i++) {
          await db.run(SQL.activities.updateSortOrder, [i, orderedIds[i]])
        }
      }
    },
    logEntries: {
      async listByRange(startDate, endDate, activityId): Promise<LogEntry[]> {
        const db = await getDb()
        const res = activityId
          ? await db.query(SQL.logEntries.listByRangeActivity, [startDate, endDate, activityId])
          : await db.query(SQL.logEntries.listByRangeAll, [startDate, endDate])
        return (res.values ?? []).map(toLogEntry)
      },
      async aggregateByRange(startDate, endDate, activityId): Promise<DayAggregate[]> {
        const db = await getDb()
        const res = activityId
          ? await db.query(SQL.logEntries.aggregateByRangeActivity, [startDate, endDate, activityId])
          : await db.query(SQL.logEntries.aggregateByRangeAll, [startDate, endDate])
        return (res.values ?? []).map((r) => ({
          date: r.date,
          activityId: r.activity_id,
          total: r.total
        }))
      },
      async quickAdd(activityId, date, count = 1): Promise<LogEntry> {
        const db = await getDb()
        const id = newId()
        const entryDate = date ?? todayIso()
        const now = new Date()
        const createdAt = now.toISOString()
        const time = now.toTimeString().slice(0, 5)

        try {
          await db.run(SQL.logEntries.insert, [
            id,
            activityId,
            entryDate,
            count,
            null,
            createdAt,
            time
          ])
        } catch (err) {
          // Same race guard as the Electron repo: a stray double-tap can race
          // the UI's own "already logged today" check — the unique
          // (activity_id, date) index rejects the duplicate; return the
          // existing entry instead of surfacing an error.
          const message = err instanceof Error ? err.message : String(err)
          if (message.includes('UNIQUE constraint failed')) {
            const existingRes = await db.query(SQL.logEntries.lastForActivityDate, [
              activityId,
              entryDate
            ])
            return toLogEntry(existingRes.values![0])
          }
          throw err
        }

        const res = await db.query(SQL.logEntries.getById, [id])
        return toLogEntry(res.values![0])
      },
      async update(id: string, patch: UpdateLogEntryInput): Promise<LogEntry> {
        const db = await getDb()
        const existingRes = await db.query(SQL.logEntries.getById, [id])
        const existing = existingRes.values?.[0]
        if (!existing) throw new Error(`Log entry not found: ${id}`)

        const note = patch.note !== undefined ? patch.note : existing.note
        const count = patch.count ?? existing.count
        const time = patch.time !== undefined ? patch.time : existing.time
        const endTime = patch.endTime !== undefined ? patch.endTime : existing.end_time

        await db.run(SQL.logEntries.updateNoteCount, [note, count, time, endTime, id])

        return toLogEntry({ ...existing, note, count, time, end_time: endTime })
      },
      async undoLast(activityId: string, date: string): Promise<void> {
        const db = await getDb()
        const res = await db.query(SQL.logEntries.lastForActivityDate, [activityId, date])
        const row = res.values?.[0]
        if (row) {
          await db.run(SQL.logEntries.delete, [row.id])
        }
      },
      async delete(id: string): Promise<void> {
        const db = await getDb()
        await db.run(SQL.logEntries.delete, [id])
      }
    },
    stats: {
      async totalsPerActivity() {
        const db = await getDb()
        const res = await db.query(SQL.logEntries.totalsPerActivity)
        return (res.values ?? []).map((r) => ({
          activityId: r.activity_id,
          entries: r.entries,
          total: r.total
        }))
      },
      async streak(activityId) {
        const db = await getDb()
        const res = activityId
          ? await db.query(SQL.logEntries.distinctDatesActivity, [activityId])
          : await db.query(SQL.logEntries.distinctDatesAll)
        return computeStreak((res.values ?? []).map((r) => r.date))
      }
    },
    plans: {
      async list(): Promise<PlanRule[]> {
        const db = await getDb()
        const rulesRes = await db.query(SQL.planRules.listAll)
        const exceptionsRes = await db.query(SQL.planExceptions.listAll)
        const exceptionsByRule = new Map<string, string[]>()
        for (const row of exceptionsRes.values ?? []) {
          const list = exceptionsByRule.get(row.plan_rule_id) ?? []
          list.push(row.date)
          exceptionsByRule.set(row.plan_rule_id, list)
        }
        return (rulesRes.values ?? []).map((row) =>
          toPlanRule(row, exceptionsByRule.get(row.id) ?? [])
        )
      },
      async create(input: CreatePlanRuleInput): Promise<PlanRule> {
        const db = await getDb()
        const id = newId()
        const createdAt = new Date().toISOString()

        await db.run(SQL.planRules.insert, [
          id,
          input.activityId,
          input.frequency,
          input.startDate,
          input.endDate ?? null,
          input.interval ?? 1,
          input.weekdays ? JSON.stringify(input.weekdays) : null,
          input.startTime ?? null,
          input.endTime ?? null,
          input.note ?? null,
          createdAt
        ])

        const res = await db.query(SQL.planRules.getById, [id])
        return toPlanRule(res.values![0], [])
      },
      async update(id: string, patch: UpdatePlanRuleInput): Promise<PlanRule> {
        const db = await getDb()
        const existingRes = await db.query(SQL.planRules.getById, [id])
        const existing = existingRes.values?.[0]
        if (!existing) throw new Error(`Plan rule not found: ${id}`)

        const next = {
          frequency: patch.frequency ?? existing.frequency,
          start_date: patch.startDate ?? existing.start_date,
          end_date: patch.endDate !== undefined ? patch.endDate : existing.end_date,
          interval: patch.interval ?? existing.interval,
          weekdays:
            patch.weekdays !== undefined ? JSON.stringify(patch.weekdays) : existing.weekdays,
          start_time: patch.startTime !== undefined ? patch.startTime : existing.start_time,
          end_time: patch.endTime !== undefined ? patch.endTime : existing.end_time,
          note: patch.note !== undefined ? patch.note : existing.note
        }

        await db.run(SQL.planRules.update, [
          next.frequency,
          next.start_date,
          next.end_date,
          next.interval,
          next.weekdays,
          next.start_time,
          next.end_time,
          next.note,
          id
        ])

        const exceptionsRes = await db.query(SQL.planExceptions.listAll)
        const skippedDates = (exceptionsRes.values ?? [])
          .filter((r) => r.plan_rule_id === id)
          .map((r) => r.date)

        return toPlanRule({ ...existing, ...next }, skippedDates)
      },
      async delete(id: string): Promise<void> {
        const db = await getDb()
        await db.run(SQL.planRules.delete, [id])
      },
      async skipOccurrence(planRuleId: string, date: string): Promise<void> {
        const db = await getDb()
        await db.run(SQL.planExceptions.insert, [newId(), planRuleId, date])
      },
      async unskipOccurrence(planRuleId: string, date: string): Promise<void> {
        const db = await getDb()
        await db.run(SQL.planExceptions.delete, [planRuleId, date])
      }
    },
    dayNotes: {
      async listByRange(startDate: string, endDate: string) {
        const db = await getDb()
        const res = await db.query(SQL.dayNotes.listByRange, [startDate, endDate])
        return (res.values ?? []).map(toDayNote)
      },
      async upsert(date: string, content: string) {
        const db = await getDb()
        const updatedAt = new Date().toISOString()
        if (content.trim() === '') {
          await db.run(SQL.dayNotes.delete, [date])
          return { date, content: '', updatedAt }
        }
        await db.run(SQL.dayNotes.upsert, [date, content, updatedAt])
        return { date, content, updatedAt }
      },
      async delete(date: string): Promise<void> {
        const db = await getDb()
        await db.run(SQL.dayNotes.delete, [date])
      }
    },
    app: {
      async getTheme(): Promise<ThemePreference> {
        const db = await getDb()
        const res = await db.query(`SELECT value FROM app_meta WHERE key = 'theme'`)
        return res.values?.[0]?.value ?? 'system'
      },
      async setTheme(theme: ThemePreference): Promise<void> {
        const db = await getDb()
        await db.run(
          `INSERT INTO app_meta (key, value) VALUES ('theme', ?)
           ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
          [theme]
        )
      },
      async getDockIconStyle(): Promise<DockIconStyle> {
        const db = await getDb()
        const res = await db.query(`SELECT value FROM app_meta WHERE key = 'dockIconStyle'`)
        return res.values?.[0]?.value === 'dark' ? 'dark' : 'light'
      },
      async setDockIconStyle(style: DockIconStyle): Promise<void> {
        const db = await getDb()
        await db.run(
          `INSERT INTO app_meta (key, value) VALUES ('dockIconStyle', ?)
           ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
          [style]
        )
      }
    }
  }
}
