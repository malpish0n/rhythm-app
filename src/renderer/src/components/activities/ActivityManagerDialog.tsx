import { useEffect, useState } from 'react'
import { AnimatePresence, motion, Reorder } from 'motion/react'
import { X, Plus, ChevronDown, ArchiveRestore, Trash2 } from 'lucide-react'
import { useActivities } from '@renderer/hooks/useActivities'
import { getActivityIcon } from '@renderer/lib/icons'
import { ActivityForm } from './ActivityForm'
import { ActivityListItem } from './ActivityListItem'
import { fade, fastSpring } from '@renderer/lib/motionPresets'
import { Tooltip } from '@renderer/components/ui/Tooltip'
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
    archivedActivities,
    createActivity,
    updateActivity,
    archiveActivity,
    unarchiveActivity,
    deleteActivity,
    reorderActivities
  } = useActivities()
  const [editing, setEditing] = useState<Activity | 'new' | null>(null)
  const [archivedOpen, setArchivedOpen] = useState(false)

  useEffect(() => {
    if (open) {
      setEditing(startNew ? 'new' : null)
      setArchivedOpen(false)
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

            {editing ? (
              <ActivityForm
                initial={editing === 'new' ? undefined : editing}
                existingCount={activities.length}
                onCancel={() => setEditing(null)}
                onSubmit={async ({ name, color, icon, defaultIncrement, unit, weeklyTarget }) => {
                  if (editing === 'new') {
                    await createActivity({ name, color, icon, defaultIncrement, unit, weeklyTarget })
                  } else {
                    await updateActivity(editing.id, {
                      name,
                      color,
                      icon,
                      defaultIncrement,
                      unit,
                      weeklyTarget
                    })
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

                {archivedActivities.length > 0 && (
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => setArchivedOpen((v) => !v)}
                      className="flex w-full items-center gap-1.5 rounded-md px-1 py-1 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text)]"
                    >
                      <motion.span animate={{ rotate: archivedOpen ? 0 : -90 }} transition={fastSpring}>
                        <ChevronDown size={12} />
                      </motion.span>
                      Archived ({archivedActivities.length})
                    </button>
                    <AnimatePresence initial={false}>
                      {archivedOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={fade}
                          className="overflow-hidden"
                        >
                          <div className="mt-2 flex flex-col gap-2">
                            {archivedActivities.map((activity) => {
                              const Icon = getActivityIcon(activity.icon)
                              return (
                                <div
                                  key={activity.id}
                                  className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 opacity-70"
                                >
                                  <span
                                    className="h-3 w-3 flex-shrink-0 rounded-full"
                                    style={{ backgroundColor: activity.color }}
                                  />
                                  {Icon && (
                                    <Icon size={14} className="flex-shrink-0 text-[var(--text-muted)]" />
                                  )}
                                  <span className="flex-1 text-sm font-medium">{activity.name}</span>
                                  <Tooltip label="Restore">
                                    <button
                                      onClick={() => unarchiveActivity(activity.id)}
                                      className="rounded-md p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface)] hover:text-[var(--text)]"
                                      aria-label="Restore"
                                    >
                                      <ArchiveRestore size={14} />
                                    </button>
                                  </Tooltip>
                                  <Tooltip label="Delete permanently">
                                    <button
                                      onClick={() => deleteActivity(activity.id)}
                                      className="rounded-md p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface)] hover:text-red-500"
                                      aria-label="Delete permanently"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </Tooltip>
                                </div>
                              )
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
