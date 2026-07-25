import { toIsoDate } from './date'
import type { PlanRule } from '@shared/types'

function parseIsoDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function daysBetween(a: Date, b: Date): number {
  const dayMs = 24 * 60 * 60 * 1000
  return Math.round((b.getTime() - a.getTime()) / dayMs)
}

function startOfWeek(d: Date): Date {
  const result = new Date(d)
  result.setDate(result.getDate() - result.getDay())
  return result
}

/**
 * Computes which dates within [rangeStart, rangeEnd] a single plan rule
 * occupies. Pure function — no IPC/state — so it's trivially reusable for
 * any visible range (a month, a week, a day) and unit-testable in isolation.
 */
export function expandPlanRule(rule: PlanRule, rangeStart: string, rangeEnd: string): string[] {
  const skipped = new Set(rule.skippedDates)
  const start = parseIsoDate(rule.startDate)
  const end = rule.endDate ? parseIsoDate(rule.endDate) : null
  const viewStart = parseIsoDate(rangeStart)
  const viewEnd = parseIsoDate(rangeEnd)

  const occurrences: string[] = []

  if (rule.frequency === 'once') {
    if (rule.startDate >= rangeStart && rule.startDate <= rangeEnd && !skipped.has(rule.startDate)) {
      occurrences.push(rule.startDate)
    }
    return occurrences
  }

  const loopStart = start > viewStart ? start : viewStart
  const loopEnd = end && end < viewEnd ? end : viewEnd
  if (loopStart > loopEnd) return occurrences

  if (rule.frequency === 'daily') {
    const interval = Math.max(1, rule.interval)
    const cursor = new Date(loopStart)
    // Align cursor forward to the next date that's a valid multiple of
    // `interval` days since the rule's start date.
    const offset = daysBetween(start, cursor) % interval
    if (offset !== 0) cursor.setDate(cursor.getDate() + (interval - offset))

    while (cursor <= loopEnd) {
      const iso = toIsoDate(cursor)
      if (!skipped.has(iso)) occurrences.push(iso)
      cursor.setDate(cursor.getDate() + interval)
    }
    return occurrences
  }

  if (rule.frequency === 'weekly') {
    const interval = Math.max(1, rule.interval)
    const weekdays = new Set(rule.weekdays)
    const ruleWeekStart = startOfWeek(start)

    const cursor = new Date(loopStart)
    while (cursor <= loopEnd) {
      if (weekdays.has(cursor.getDay())) {
        const weeksSince = Math.floor(daysBetween(ruleWeekStart, startOfWeek(cursor)) / 7)
        if (weeksSince >= 0 && weeksSince % interval === 0) {
          const iso = toIsoDate(cursor)
          if (!skipped.has(iso)) occurrences.push(iso)
        }
      }
      cursor.setDate(cursor.getDate() + 1)
    }
    return occurrences
  }

  return occurrences
}

/**
 * Aggregates occurrences across every rule for a visible range into a
 * date -> rules map, which is what calendar views consume directly.
 */
export function getOccurrencesInRange(
  rules: PlanRule[],
  rangeStart: string,
  rangeEnd: string
): Map<string, PlanRule[]> {
  const map = new Map<string, PlanRule[]>()
  for (const rule of rules) {
    for (const date of expandPlanRule(rule, rangeStart, rangeEnd)) {
      const list = map.get(date) ?? []
      list.push(rule)
      map.set(date, list)
    }
  }
  return map
}
