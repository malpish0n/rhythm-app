export type TimeFormat = 'system' | '12h' | '24h'

function systemPrefers12h(): boolean {
  return new Intl.DateTimeFormat(undefined, { hour: 'numeric' }).resolvedOptions().hour12 ?? true
}

function use12h(fmt: TimeFormat): boolean {
  return fmt === 'system' ? systemPrefers12h() : fmt === '12h'
}

/** Formats an hour-row label for the hour grid, e.g. "9 AM" or "09:00". */
export function formatHourLabel(hour: number, fmt: TimeFormat): string {
  if (!use12h(fmt)) return `${String(hour).padStart(2, '0')}:00`
  const period = hour < 12 ? 'AM' : 'PM'
  const h12 = hour % 12 === 0 ? 12 : hour % 12
  return `${h12} ${period}`
}

/** Formats a stored 'HH:MM' (24h) entry time for display, e.g. "9:05 AM" or "09:05". */
export function formatEntryTime(time: string, fmt: TimeFormat): string {
  const [h, m] = time.split(':').map(Number)
  if (!use12h(fmt)) return time
  const period = h < 12 ? 'AM' : 'PM'
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${h12}:${String(m).padStart(2, '0')} ${period}`
}
