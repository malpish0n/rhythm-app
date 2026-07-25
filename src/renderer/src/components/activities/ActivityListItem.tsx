import { Reorder, useDragControls } from 'motion/react'
import { Archive, GripVertical, Pencil, Trash2 } from 'lucide-react'
import { getActivityIcon } from '@renderer/lib/icons'
import type { Activity } from '@shared/types'

interface ActivityListItemProps {
  activity: Activity
  onEdit: () => void
  onArchive: () => void
  onDelete: () => void
}

export function ActivityListItem({
  activity,
  onEdit,
  onArchive,
  onDelete
}: ActivityListItemProps): JSX.Element {
  const dragControls = useDragControls()
  const Icon = getActivityIcon(activity.icon)

  return (
    <Reorder.Item
      value={activity}
      dragListener={false}
      dragControls={dragControls}
      className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2"
    >
      <button
        onPointerDown={(e) => dragControls.start(e)}
        className="cursor-grab touch-none text-[var(--text-muted)] active:cursor-grabbing"
        aria-label="Drag to reorder"
      >
        <GripVertical size={14} />
      </button>
      <span
        className="h-3 w-3 flex-shrink-0 rounded-full"
        style={{ backgroundColor: activity.color }}
      />
      {Icon && <Icon size={14} className="flex-shrink-0 text-[var(--text-muted)]" />}
      <span className="flex-1 text-sm font-medium">{activity.name}</span>
      <button
        onClick={onEdit}
        className="rounded-md p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface)] hover:text-[var(--text)]"
        aria-label="Edit"
      >
        <Pencil size={14} />
      </button>
      <button
        onClick={onArchive}
        className="rounded-md p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface)] hover:text-[var(--text)]"
        aria-label="Archive"
      >
        <Archive size={14} />
      </button>
      <button
        onClick={onDelete}
        className="rounded-md p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface)] hover:text-red-500"
        aria-label="Delete"
      >
        <Trash2 size={14} />
      </button>
    </Reorder.Item>
  )
}
