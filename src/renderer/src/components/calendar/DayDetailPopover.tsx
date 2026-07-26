import { AnimatePresence, motion } from 'motion/react'
import { X } from 'lucide-react'
import { DayAgenda } from './DayAgenda'
import { fade } from '@renderer/lib/motionPresets'
import { Tooltip } from '@renderer/components/ui/Tooltip'
import type { Activity } from '@shared/types'

interface DayDetailPopoverProps {
  date: string | null
  activities: Activity[]
  refreshToken: number
  onClose: () => void
}

export function DayDetailPopover({
  date,
  activities,
  refreshToken,
  onClose
}: DayDetailPopoverProps): JSX.Element {
  if (!date) return <></>

  const formatted = new Date(date + 'T00:00:00').toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={fade}
        className="fixed inset-0 z-40 flex items-center justify-center bg-black/40"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={fade}
          onClick={(e) => e.stopPropagation()}
          className="glass-surface w-full max-w-sm rounded-2xl p-4 sm:p-6 shadow-elevation-lg"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold">{formatted}</h2>
            <Tooltip label="Close" side="bottom">
              <button
                onClick={onClose}
                aria-label="Close"
                className="rounded-md p-1 text-[var(--text-muted)] hover:text-[var(--text)]"
              >
                <X size={16} />
              </button>
            </Tooltip>
          </div>

          <DayAgenda date={date} activities={activities} refreshToken={refreshToken} />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
