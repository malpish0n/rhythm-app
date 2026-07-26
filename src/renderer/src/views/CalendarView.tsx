import { useAppStore } from '@renderer/state/store'
import { ContentHeader } from '@renderer/components/layout/ContentHeader'
import { MonthCalendar } from '@renderer/components/calendar/MonthCalendar'
import { WeekView } from '@renderer/components/calendar/WeekView'
import { DayView } from '@renderer/components/calendar/DayView'
import { addDays, todayIso, weekRange } from '@renderer/lib/date'

export function CalendarView(): JSX.Element {
  const activities = useAppStore((s) => s.activities)
  const categoryFilter = useAppStore((s) => s.categoryFilter)
  const refreshToken = useAppStore((s) => s.refreshToken)
  const calendarFormat = useAppStore((s) => s.calendarFormat)
  const setCalendarFormat = useAppStore((s) => s.setCalendarFormat)
  const monthCursor = useAppStore((s) => s.monthCursor)
  const setMonthCursor = useAppStore((s) => s.setMonthCursor)
  const dayCursor = useAppStore((s) => s.dayCursor)
  const setDayCursor = useAppStore((s) => s.setDayCursor)
  const weekCursor = useAppStore((s) => s.weekCursor)
  const setWeekCursor = useAppStore((s) => s.setWeekCursor)

  const goPrevMonth = (): void => {
    let { year: y, month: m } = monthCursor
    m -= 1
    if (m < 0) {
      m = 11
      y -= 1
    }
    setMonthCursor({ year: y, month: m })
  }

  const goNextMonth = (): void => {
    const now = new Date()
    if (monthCursor.year === now.getFullYear() && monthCursor.month === now.getMonth()) return
    let { year: y, month: m } = monthCursor
    m += 1
    if (m > 11) {
      m = 0
      y += 1
    }
    setMonthCursor({ year: y, month: m })
  }

  const goPrevDay = (): void => {
    setDayCursor(addDays(dayCursor, -1))
  }

  const goNextDay = (): void => {
    if (dayCursor === todayIso()) return
    setDayCursor(addDays(dayCursor, 1))
  }

  const goPrevWeek = (): void => {
    setWeekCursor(addDays(weekCursor, -7))
  }

  const goNextWeek = (): void => {
    if (weekRange(weekCursor).start === weekRange(todayIso()).start) return
    setWeekCursor(addDays(weekCursor, 7))
  }

  return (
    <div className="flex flex-col gap-6">
      <ContentHeader
        calendarFormat={calendarFormat}
        onCalendarFormatChange={setCalendarFormat}
        monthCursor={monthCursor}
        onPrevMonth={goPrevMonth}
        onNextMonth={goNextMonth}
        dayCursor={dayCursor}
        onPrevDay={goPrevDay}
        onNextDay={goNextDay}
        weekCursor={weekCursor}
        onPrevWeek={goPrevWeek}
        onNextWeek={goNextWeek}
      />

      {calendarFormat === 'day' ? (
        <DayView date={dayCursor} activities={activities} refreshToken={refreshToken} />
      ) : calendarFormat === 'week' ? (
        <WeekView
          weekCursor={weekCursor}
          activities={activities}
          categoryFilter={categoryFilter}
          refreshToken={refreshToken}
        />
      ) : (
        <MonthCalendar
          year={monthCursor.year}
          month={monthCursor.month}
          activities={activities}
          categoryFilter={categoryFilter}
          refreshToken={refreshToken}
        />
      )}
    </div>
  )
}
