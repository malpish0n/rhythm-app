import { Calendar, CalendarDays, CalendarRange } from 'lucide-react'
import { SegmentedControl, type SegmentedOption } from '@renderer/components/ui/SegmentedControl'
import type { CalendarFormat } from '@renderer/state/store'

const OPTIONS: SegmentedOption<CalendarFormat>[] = [
  { value: 'day', icon: CalendarDays, tooltip: 'Day' },
  { value: 'week', icon: CalendarRange, tooltip: 'Week' },
  { value: 'month', icon: Calendar, tooltip: 'Month' }
]

interface CalendarFormatSwitcherProps {
  format: CalendarFormat
  onChange: (format: CalendarFormat) => void
}

export function CalendarFormatSwitcher({
  format,
  onChange
}: CalendarFormatSwitcherProps): JSX.Element {
  return (
    <SegmentedControl
      options={OPTIONS}
      value={format}
      onChange={onChange}
      layoutId="activeCalendarFormat"
      aria-label="Calendar format"
    />
  )
}
