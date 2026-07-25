import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronDown, NotebookPen } from 'lucide-react'
import { fade } from '@renderer/lib/motionPresets'
import { useAppStore } from '@renderer/state/store'

interface DayNoteSectionProps {
  date: string
}

export function DayNoteSection({ date }: DayNoteSectionProps): JSX.Element {
  const bumpRefreshToken = useAppStore((s) => s.bumpRefreshToken)
  const [content, setContent] = useState('')
  const [draft, setDraft] = useState('')
  const [expanded, setExpanded] = useState(false)

  // Kept in sync every render so the unmount/date-change cleanup below (which
  // closes over stale state otherwise) always flushes the latest draft —
  // e.g. when the user closes the day popover while the textarea is still
  // focused, no native blur event fires and the edit would silently be lost.
  const latest = useRef({ date, draft, content })
  useEffect(() => {
    latest.current = { date, draft, content }
  })

  useEffect(() => {
    window.api.dayNotes.listByRange(date, date).then((rows) => {
      const value = rows[0]?.content ?? ''
      setContent(value)
      setDraft(value)
    })
    setExpanded(false)

    return () => {
      const { date: d, draft: dr, content: c } = latest.current
      const trimmed = dr.trim()
      if (trimmed !== c.trim()) {
        window.api.dayNotes.upsert(d, trimmed).then(() => bumpRefreshToken())
      }
    }
  }, [date, bumpRefreshToken])

  const save = async (): Promise<void> => {
    const trimmed = draft.trim()
    if (trimmed === content.trim()) return
    await window.api.dayNotes.upsert(date, trimmed)
    setContent(trimmed)
    bumpRefreshToken()
  }

  return (
    <div className="mb-3 rounded-lg border border-[var(--border)] bg-[var(--surface-2)]">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left"
      >
        <NotebookPen size={13} className="flex-shrink-0 text-[var(--text-muted)]" />
        <span className="flex-1 truncate text-sm">
          {content ? (
            content
          ) : (
            <span className="text-[var(--text-muted)]">Day notes</span>
          )}
        </span>
        <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.15 }}>
          <ChevronDown size={14} className="text-[var(--text-muted)]" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={fade}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={save}
                placeholder="Write something about this day…"
                rows={4}
                className="w-full resize-none rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
