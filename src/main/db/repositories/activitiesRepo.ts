import { randomUUID } from 'crypto'
import { getDb } from '../connection'
import { SQL, toActivity, type ActivityRow } from '@shared/sql'
import type { Activity, CreateActivityInput, UpdateActivityInput } from '@shared/types'

export function list(includeArchived = false): Activity[] {
  const db = getDb()
  const rows = db
    .prepare(includeArchived ? SQL.activities.listAll : SQL.activities.listActive)
    .all() as ActivityRow[]
  return rows.map(toActivity)
}

export function create(input: CreateActivityInput): Activity {
  const db = getDb()
  const id = randomUUID()
  const createdAt = new Date().toISOString()
  const maxOrder = db.prepare(SQL.activities.maxSortOrder).get() as { maxOrder: number }

  db.prepare(SQL.activities.insert).run(
    id,
    input.name,
    input.color,
    input.icon ?? null,
    input.defaultIncrement ?? 1,
    maxOrder.maxOrder + 1,
    createdAt
  )

  return toActivity(db.prepare(SQL.activities.getById).get(id) as ActivityRow)
}

export function update(id: string, patch: UpdateActivityInput): Activity {
  const db = getDb()
  const existing = db.prepare(SQL.activities.getById).get(id) as ActivityRow | undefined
  if (!existing) throw new Error(`Activity not found: ${id}`)

  const next: ActivityRow = {
    ...existing,
    name: patch.name ?? existing.name,
    color: patch.color ?? existing.color,
    icon: patch.icon !== undefined ? patch.icon : existing.icon,
    default_increment: patch.defaultIncrement ?? existing.default_increment,
    sort_order: patch.sortOrder ?? existing.sort_order
  }

  db.prepare(SQL.activities.update).run(
    next.name,
    next.color,
    next.icon,
    next.default_increment,
    next.sort_order,
    id
  )

  return toActivity(next)
}

export function archive(id: string): void {
  const db = getDb()
  db.prepare(SQL.activities.archive).run(id)
}

export function remove(id: string): void {
  const db = getDb()
  db.prepare(SQL.activities.delete).run(id)
}

export function reorder(orderedIds: string[]): void {
  const db = getDb()
  const apply = db.transaction((ids: string[]) => {
    ids.forEach((id, index) => {
      db.prepare(SQL.activities.updateSortOrder).run(index, id)
    })
  })
  apply(orderedIds)
}
