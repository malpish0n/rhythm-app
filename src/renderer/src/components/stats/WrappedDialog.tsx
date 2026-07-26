import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronLeft, ChevronRight, Flame, Sparkles, Trophy, X } from 'lucide-react'
import { CalendarDays, CalendarHeart } from 'lucide-react'
import { yearRange, MONTH_NAMES_FULL } from '@renderer/lib/date'
import { computeWrappedStats } from '@renderer/lib/wrapped'
import { getActivityIcon } from '@renderer/lib/icons'
import { ProgressRing } from '@renderer/components/ui/ProgressRing'
import { fade } from '@renderer/lib/motionPresets'
import type { Activity, DayAggregate, LogEntry } from '@shared/types'

const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

interface WrappedDialogProps {
  open: boolean
  year: number
  activities: Activity[]
  onClose: () => void
}

interface Card {
  icon: JSX.Element
  title: string
  value: string
  subtitle?: string
  background: string
}

export function WrappedDialog({ open, year, activities, onClose }: WrappedDialogProps): JSX.Element {
  const [entries, setEntries] = useState<LogEntry[]>([])
  const [aggregates, setAggregates] = useState<DayAggregate[]>([])
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (!open) return
    setIndex(0)
    const { start, end } = yearRange(year)
    Promise.all([
      window.api.logEntries.listByRange(start, end),
      window.api.logEntries.aggregateByRange(start, end)
    ]).then(([e, a]) => {
      setEntries(e)
      setAggregates(a)
    })
  }, [open, year])

  const stats = useMemo(() => computeWrappedStats(entries, aggregates, activities), [
    entries,
    aggregates,
    activities
  ])

  const cards = useMemo<Card[]>(() => {
    if (stats.totalLogs === 0) {
      return [
        {
          icon: <Sparkles size={28} />,
          title: `Nothing logged in ${year} yet`,
          value: '—',
          background: 'color-mix(in srgb, var(--accent) 20%, var(--surface))'
        }
      ]
    }

    const topColor = stats.topActivity?.activity.color ?? 'var(--accent)'
    const list: Card[] = [
      {
        icon: <Sparkles size={28} />,
        title: 'Total logs',
        value: String(stats.totalLogs),
        subtitle: `${stats.totalCount} total occurrences`,
        background: 'color-mix(in srgb, var(--accent) 22%, var(--surface))'
      }
    ]

    if (stats.topActivity) {
      const Icon = getActivityIcon(stats.topActivity.activity.icon)
      list.push({
        icon: Icon ? <Icon size={28} /> : <Trophy size={28} />,
        title: 'Top activity',
        value: stats.topActivity.activity.name,
        subtitle: `${stats.topActivity.total} logged`,
        background: `color-mix(in srgb, ${topColor} 22%, var(--surface))`
      })
    }

    list.push(
      {
        icon: <Flame size={28} />,
        title: 'Longest streak',
        value: `${stats.longestStreak} ${stats.longestStreak === 1 ? 'day' : 'days'}`,
        background: 'color-mix(in srgb, var(--accent) 22%, var(--surface))'
      },
      {
        icon: <CalendarHeart size={28} />,
        title: 'Busiest month',
        value: stats.busiestMonth ? MONTH_NAMES_FULL[stats.busiestMonth.month] : '—',
        subtitle: stats.busiestMonth ? `${stats.busiestMonth.total} logged` : undefined,
        background: 'color-mix(in srgb, var(--accent) 22%, var(--surface))'
      },
      {
        icon: <CalendarDays size={28} />,
        title: 'Busiest day of the week',
        value: WEEKDAY_NAMES[stats.busiestWeekday],
        background: 'color-mix(in srgb, var(--accent) 22%, var(--surface))'
      }
    )

    list.push({
      icon: <Sparkles size={28} />,
      title: 'Active days',
      value: `${stats.activeDays}`,
      subtitle: `out of 365 days in ${year}`,
      background: 'color-mix(in srgb, var(--accent) 22%, var(--surface))'
    })

    return list
  }, [stats, year])

  const card = cards[index]
  const isActiveDaysCard = card?.title === 'Active days'

  useEffect(() => {
    const handler = (e: KeyboardEvent): void => {
      if (!open) return
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight') setIndex((i) => Math.min(i + 1, cards.length - 1))
      else if (e.key === 'ArrowLeft') setIndex((i) => Math.max(i - 1, 0))
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose, cards.length])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={fade}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={fade}
            onClick={(e) => e.stopPropagation()}
            className="relative flex w-full max-w-md flex-col overflow-hidden rounded-2xl shadow-elevation-lg"
          >
            <div className="absolute left-0 right-0 top-0 z-10 flex gap-1 p-3">
              {cards.map((_, i) => (
                <div
                  key={i}
                  className="h-1 flex-1 overflow-hidden rounded-full bg-white/20"
                >
                  <div
                    className="h-full rounded-full bg-white transition-all"
                    style={{ width: i <= index ? '100%' : '0%' }}
                  />
                </div>
              ))}
            </div>

            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute right-3 top-8 z-10 rounded-md p-1 text-white/80 hover:text-white"
            >
              <X size={18} />
            </button>

            <div className="relative h-96">
              <AnimatePresence mode="wait">
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 24, scale: 0.98 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -24, scale: 0.98 }}
                  transition={fade}
                  className="flex h-full flex-col items-center justify-center gap-4 px-8 text-center text-[var(--text)]"
                  style={{ backgroundImage: `linear-gradient(160deg, ${card.background}, var(--surface))` }}
                >
                  <div className="text-[var(--accent)]">{card.icon}</div>
                  <p className="text-sm text-[var(--text-muted)]">{card.title}</p>
                  <p className="text-3xl font-bold">{card.value}</p>
                  {card.subtitle && <p className="text-sm text-[var(--text-muted)]">{card.subtitle}</p>}
                  {isActiveDaysCard && (
                    <ProgressRing progress={stats.activeDays / 365} color="var(--accent)" size={56} />
                  )}
                </motion.div>
              </AnimatePresence>

              {index > 0 && (
                <button
                  onClick={() => setIndex((i) => Math.max(i - 1, 0))}
                  aria-label="Previous"
                  className="group absolute inset-y-0 left-0 flex w-1/3 items-center justify-start bg-gradient-to-r from-black/30 to-transparent pl-4 opacity-0 transition-opacity hover:opacity-100"
                >
                  <ChevronLeft size={26} className="text-white drop-shadow" />
                </button>
              )}
              {index < cards.length - 1 && (
                <button
                  onClick={() => setIndex((i) => Math.min(i + 1, cards.length - 1))}
                  aria-label="Next"
                  className="group absolute inset-y-0 right-0 flex w-1/3 items-center justify-end bg-gradient-to-l from-black/30 to-transparent pr-4 opacity-0 transition-opacity hover:opacity-100"
                >
                  <ChevronRight size={26} className="text-white drop-shadow" />
                </button>
              )}
            </div>

            <div className="flex items-center justify-center bg-[var(--surface)] px-4 py-2.5">
              <span className="text-xs text-[var(--text-muted)]">
                {index + 1} / {cards.length}
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
