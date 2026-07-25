import { useEffect, useState } from 'react'
import { AnimatePresence, motion, Reorder } from 'motion/react'
import { X, Plus } from 'lucide-react'
import { useActivities } from '@renderer/hooks/useActivities'
import { ActivityForm } from './ActivityForm'
import { ActivityListItem } from './ActivityListItem'
import { fade, fastSpring } from '@renderer/lib/motionPresets'
import type { Activity } from '@shared/types'

interface ActivityManagerDialogProps {
  open: boolean
  startNew?: boolean
  onClose: () => void
}

export function ActivityManagerDialog({
  open,
  startNew,
  onClose
}: ActivityManagerDialogProps): JSX.Element {
  const {
    activities,
    createActivity,
    updateActivity,
    archiveActivity,
    deleteActivity,
    reorderActivities
  } = useActivities()
  const [editing, setEditing] = useState<Activity | 'new' | null>(null)

  useEffect(() => {
    if (open) {
      setEditing(startNew ? 'new' : null)
    }
  }, [open, startNew])

  return (
    <AnimatePresence>
      {open && (
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
            className="glass-surface w-full max-w-md rounded-2xl p-4 sm:p-6 shadow-elevation-lg"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold">Categories</h2>
              <button
                onClick={onClose}
                className="rounded-md p-1 text-[var(--text-muted)] hover:text-[var(--text)]"
              >
                <X size={16} />
              </button>
            </div>

            {editing ? (
              <ActivityForm
                initial={editing === 'new' ? undefined : editing}
                existingCount={activities.length}
                onCancel={() => setEditing(null)}
                onSubmit={async ({ name, color, icon, defaultIncrement }) => {
                  if (editing === 'new') {
                    await createActivity({ name, color, icon, defaultIncrement })
                  } else {
                    await updateActivity(editing.id, { name, color, icon, defaultIncrement })
                  }
                  setEditing(null)
                }}
              />
            ) : (
              <>
                <Reorder.Group
                  axis="y"
                  values={activities}
                  onReorder={(reordered) => reorderActivities(reordered.map((a) => a.id))}
                  className="flex max-h-72 flex-col gap-2 overflow-y-auto"
                >
                  {activities.map((activity) => (
                    <ActivityListItem
                      key={activity.id}
                      activity={activity}
                      onEdit={() => setEditing(activity)}
                      onArchive={() => archiveActivity(activity.id)}
                      onDelete={() => deleteActivity(activity.id)}
                    />
                  ))}
                </Reorder.Group>
                {activities.length === 0 && (
                  <p className="py-4 text-center text-sm text-[var(--text-muted)]">
                    No categories yet — add your first one below.
                  </p>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={fastSpring}
                  onClick={() => setEditing('new')}
                  className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-[var(--border)] py-2 text-sm text-[var(--text-muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--text)]"
                >
                  <Plus size={14} /> Add category
                </motion.button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
