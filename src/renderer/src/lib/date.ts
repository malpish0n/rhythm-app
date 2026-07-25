export function toIsoDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function todayIso(): string {
  return toIsoDate(new Date())
}

export interface DayCellData {
  date: string
  inYear: boolean
}

export interface MonthLabel {
  label: string
  weekIndex: number
}

export interface YearMatrix {
  weeks: DayCellData[][]
  monthLabels: MonthLabel[]
}

const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec'
]

/**
 * Builds a GitHub-style week/day matrix for a given year: columns are weeks
 * (Sun-start), rows are days 0-6. Leading/trailing cells outside the year are
 * included (inYear: false) so weeks stay aligned.
 */
export function buildYearMatrix(year: number): YearMatrix {
  const jan1 = new Date(year, 0, 1)
  const dec31 = new Date(year, 11, 31)

  const start = new Date(jan1)
  start.setDate(start.getDate() - start.getDay())

  const end = new Date(dec31)
  end.setDate(end.getDate() + (6 - end.getDay()))

  const weeks: DayCellData[][] = []
  const monthLabels: MonthLabel[] = []
  let lastMonth = -1

  const cursor = new Date(start)
  let weekIndex = 0
  while (cursor <= end) {
    const week: DayCellData[] = []
    for (let dow = 0; dow < 7; dow++) {
      const inYear = cursor.getFullYear() === year
      if (inYear && cursor.getMonth() !== lastMonth && cursor.getDate() <= 7) {
        monthLabels.push({ label: MONTH_NAMES[cursor.getMonth()], weekIndex })
        lastMonth = cursor.getMonth()
      }
      week.push({ date: toIsoDate(cursor), inYear })
      cursor.setDate(cursor.getDate() + 1)
    }
    weeks.push(week)
    weekIndex++
  }

  return { weeks, monthLabels }
}

export function yearRange(year: number): { start: string; end: string } {
  return { start: `${year}-01-01`, end: `${year}-12-31` }
}

export const MONTH_NAMES_FULL = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
]

export interface MonthDayCellData {
  date: string
  inMonth: boolean
}

export interface MonthMatrix {
  weeks: MonthDayCellData[][]
}

/**
 * Builds a traditional Sun-start month grid (like a normal calendar app):
 * rows are weeks, columns are days 0-6. Leading/trailing days from adjacent
 * months are included (inMonth: false) so every week stays a full 7 columns.
 */
export function buildMonthMatrix(year: number, month: number): MonthMatrix {
  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)

  const start = new Date(first)
  start.setDate(start.getDate() - start.getDay())

  const end = new Date(last)
  end.setDate(end.getDate() + (6 - end.getDay()))

  const weeks: MonthDayCellData[][] = []
  const cursor = new Date(start)
  while (cursor <= end) {
    const week: MonthDayCellData[] = []
    for (let dow = 0; dow < 7; dow++) {
      week.push({ date: toIsoDate(cursor), inMonth: cursor.getMonth() === month })
      cursor.setDate(cursor.getDate() + 1)
    }
    weeks.push(week)
  }

  return { weeks }
}

export function monthRange(year: number, month: number): { start: string; end: string } {
  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)
  return { start: toIsoDate(first), end: toIsoDate(last) }
}

export function addDays(dateIso: string, n: number): string {
  const d = new Date(dateIso + 'T00:00:00')
  d.setDate(d.getDate() + n)
  return toIsoDate(d)
}

export interface WeekRange {
  start: string
  end: string
  days: string[]
}

/**
 * Sun-start week (7 days) containing the given date.
 */
export function weekRange(dateIso: string): WeekRange {
  const d = new Date(dateIso + 'T00:00:00')
  const start = new Date(d)
  start.setDate(start.getDate() - start.getDay())

  const days: string[] = []
  const cursor = new Date(start)
  for (let i = 0; i < 7; i++) {
    days.push(toIsoDate(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }

  return { start: days[0], end: days[6], days }
}
