import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import {
  BarChart3,
  CalendarCheck,
  Calendar,
  House,
  Search,
  Settings,
  StickyNote,
  Tags
} from 'lucide-react'
import { getActivityIcon } from '@renderer/lib/icons'
import { fade } from '@renderer/lib/motionPresets'
import { useLogEntries } from '@renderer/hooks/useLogEntries'
import { useAppStore } from '@renderer/state/store'
import type { Activity, DayNote } from '@shared/types'

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
  activities: Activity[]
  onGoToToday: () => void
  onOpenSettings: () => void
  onManageCategories: () => void
}

interface Action {
  id: string
  label: string
  icon: JSX.Element
  run: () => void
}

export function CommandPalette({
  open,
  onClose,
  activities,
  onGoToToday,
  onOpenSettings,
  onManageCategories
}: CommandPaletteProps): JSX.Element {
  const { quickAdd } = useLogEntries()
  const setActiveView = useAppStore((s) => s.setActiveView)
  const setCalendarFormat = useAppStore((s) => s.setCalendarFormat)
  const setDayCursor = useAppStore((s) => s.setDayCursor)
  const [query, setQuery] = useState('')
  const [highlighted, setHighlighted] = useState(0)
  const [noteResults, setNoteResults] = useState<DayNote[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setQuery('')
      setHighlighted(0)
      setNoteResults([])
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  useEffect(() => {
    if (query.trim().length < 2) {
      setNoteResults([])
      return
    }
    const handle = setTimeout(() => {
      window.api.dayNotes.search(query.trim()).then(setNoteResults)
    }, 150)
    return () => clearTimeout(handle)
  }, [query])

  const actions = useMemo<Action[]>(() => {
    const logActions: Action[] = activities.map((activity) => {
      const Icon = getActivityIcon(activity.icon)
      return {
        id: `log-${activity.id}`,
        label: `Log ${activity.name}`,
        icon: Icon ? (
          <Icon size={14} style={{ color: activity.color }} />
        ) : (
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: activity.color }} />
        ),
        run: () => {
          quickAdd(activity.id, activity.defaultIncrement)
        }
      }
    })
    return [
      ...logActions,
      {
        id: 'go-today',
        label: 'Go to Today',
        icon: <CalendarCheck size={14} />,
        run: onGoToToday
      },
      {
        id: 'go-home',
        label: 'Go to Home',
        icon: <House size={14} />,
        run: () => setActiveView('home')
      },
      {
        id: 'go-calendar',
        label: 'Go to Calendar',
        icon: <Calendar size={14} />,
        run: () => setActiveView('calendar')
      },
      {
        id: 'go-stats',
        label: 'Go to Statistics',
        icon: <BarChart3 size={14} />,
        run: () => setActiveView('stats')
      },
      {
        id: 'manage-categories',
        label: 'Manage categories',
        icon: <Tags size={14} />,
        run: onManageCategories
      },
      {
        id: 'open-settings',
        label: 'Open Settings',
        icon: <Settings size={14} />,
        run: onOpenSettings
      }
    ]
  }, [activities, onGoToToday, onManageCategories, onOpenSettings, quickAdd, setActiveView])

  const noteActions = useMemo<Action[]>(
    () =>
      noteResults.map((note) => ({
        id: `note-${note.date}`,
        label: `${new Date(note.date + 'T00:00:00').toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })} — ${note.content.slice(0, 60)}`,
        icon: <StickyNote size={14} />,
        run: () => {
          setActiveView('calendar')
          setCalendarFormat('day')
          setDayCursor(note.date)
        }
      })),
    [noteResults, setActiveView, setCalendarFormat, setDayCursor]
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return actions
    return [...actions.filter((a) => a.label.toLowerCase().includes(q)), ...noteActions]
  }, [actions, noteActions, query])

  const runAndClose = (action: Action): void => {
    action.run()
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={fade}
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-[15vh]"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={fade}
            onClick={(e) => e.stopPropagation()}
            className="glass-surface flex w-full max-w-md flex-col overflow-hidden rounded-2xl shadow-elevation-lg"
          >
            <div className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-3">
              <Search size={15} className="text-[var(--text-muted)]" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setHighlighted(0)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    onClose()
                  } else if (e.key === 'ArrowDown') {
                    e.preventDefault()
                    setHighlighted((h) => Math.min(h + 1, filtered.length - 1))
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault()
                    setHighlighted((h) => Math.max(h - 1, 0))
                  } else if (e.key === 'Enter') {
                    e.preventDefault()
                    const action = filtered[highlighted]
                    if (action) runAndClose(action)
                  }
                }}
                placeholder="Type a command…"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--text-muted)]"
              />
            </div>
            <div className="max-h-72 overflow-y-auto p-2">
              {filtered.length === 0 && (
                <p className="py-4 text-center text-sm text-[var(--text-muted)]">No matches</p>
              )}
              {filtered.map((action, i) => {
                const isFirstNote =
                  noteActions.length > 0 && i === filtered.length - noteActions.length
                return (
                  <div key={action.id}>
                    {isFirstNote && (
                      <p className="mb-1 mt-2 px-3 text-[10px] font-medium uppercase tracking-wide text-[var(--text-muted)]">
                        Notes
                      </p>
                    )}
                    <button
                      onClick={() => runAndClose(action)}
                      onMouseEnter={() => setHighlighted(i)}
                      className={
                        i === highlighted
                          ? 'flex w-full items-center gap-2.5 rounded-lg bg-[var(--accent)] px-3 py-2 text-left text-sm font-medium text-white'
                          : 'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-[var(--text)]'
                      }
                    >
                      {action.icon}
                      <span className="truncate">{action.label}</span>
                    </button>
                  </div>
                )
              })}
            </div>
            <div className="border-t border-[var(--border)] px-4 py-2 text-[11px] text-[var(--text-muted)]">
              ↑↓ navigate · ↵ run · esc close
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
