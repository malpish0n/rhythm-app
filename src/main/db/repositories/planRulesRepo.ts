import { randomUUID } from 'crypto'
import { getDb } from '../connection'
import { SQL, toPlanRule, type PlanExceptionRow, type PlanRuleRow } from '@shared/sql'
import type { CreatePlanRuleInput, PlanRule, UpdatePlanRuleInput } from '@shared/types'

function loadExceptions(): Map<string, string[]> {
  const db = getDb()
  const rows = db.prepare(SQL.planExceptions.listAll).all() as PlanExceptionRow[]
  const map = new Map<string, string[]>()
  for (const row of rows) {
    const list = map.get(row.plan_rule_id) ?? []
    list.push(row.date)
    map.set(row.plan_rule_id, list)
  }
  return map
}

export function list(): PlanRule[] {
  const db = getDb()
  const rows = db.prepare(SQL.planRules.listAll).all() as PlanRuleRow[]
  const exceptionsByRule = loadExceptions()
  return rows.map((row) => toPlanRule(row, exceptionsByRule.get(row.id) ?? []))
}

export function create(input: CreatePlanRuleInput): PlanRule {
  const db = getDb()
  const id = randomUUID()
  const createdAt = new Date().toISOString()

  db.prepare(SQL.planRules.insert).run(
    id,
    input.activityId,
    input.frequency,
    input.startDate,
    input.endDate ?? null,
    input.interval ?? 1,
    input.weekdays ? JSON.stringify(input.weekdays) : null,
    input.note ?? null,
    createdAt
  )

  const row = db.prepare(SQL.planRules.getById).get(id) as PlanRuleRow
  return toPlanRule(row, [])
}

export function update(id: string, patch: UpdatePlanRuleInput): PlanRule {
  const db = getDb()
  const existing = db.prepare(SQL.planRules.getById).get(id) as PlanRuleRow | undefined
  if (!existing) throw new Error(`Plan rule not found: ${id}`)

  const next = {
    frequency: patch.frequency ?? existing.frequency,
    start_date: patch.startDate ?? existing.start_date,
    end_date: patch.endDate !== undefined ? patch.endDate : existing.end_date,
    interval: patch.interval ?? existing.interval,
    weekdays:
      patch.weekdays !== undefined
        ? JSON.stringify(patch.weekdays)
        : existing.weekdays,
    note: patch.note !== undefined ? patch.note : existing.note
  }

  db.prepare(SQL.planRules.update).run(
    next.frequency,
    next.start_date,
    next.end_date,
    next.interval,
    next.weekdays,
    next.note,
    id
  )

  const exceptionsByRule = loadExceptions()
  return toPlanRule({ ...existing, ...next }, exceptionsByRule.get(id) ?? [])
}

export function remove(id: string): void {
  const db = getDb()
  db.prepare(SQL.planRules.delete).run(id)
}

export function skipOccurrence(planRuleId: string, date: string): void {
  const db = getDb()
  db.prepare(SQL.planExceptions.insert).run(randomUUID(), planRuleId, date)
}

export function unskipOccurrence(planRuleId: string, date: string): void {
  const db = getDb()
  db.prepare(SQL.planExceptions.delete).run(planRuleId, date)
}
