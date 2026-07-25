import { useState } from 'react'
import { motion } from 'motion/react'
import { CATEGORY_PALETTE } from '@renderer/lib/color'
import { ActivityColorPicker } from './ActivityColorPicker'
import { ActivityIconPicker } from './ActivityIconPicker'
import { fastSpring } from '@renderer/lib/motionPresets'
import type { Activity } from '@shared/types'

interface ActivityFormProps {
  initial?: Activity
  existingCount: number
  onSubmit: (input: {
    name: string
    color: string
    icon: string | null
    defaultIncrement: number
  }) => void
  onCancel: () => void
}

export function ActivityForm({
  initial,
  existingCount,
  onSubmit,
  onCancel
}: ActivityFormProps): JSX.Element {
  const [name, setName] = useState(initial?.name ?? '')
  const [color, setColor] = useState(
    initial?.color ?? CATEGORY_PALETTE[existingCount % CATEGORY_PALETTE.length]
  )
  const [icon, setIcon] = useState<string | null>(initial?.icon ?? null)
  const defaultIncrement = initial?.defaultIncrement ?? 1

  const canSubmit = name.trim().length > 0

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (!canSubmit) return
        onSubmit({ name: name.trim(), color, icon, defaultIncrement })
      }}
      className="flex flex-col gap-4"
    >
      <div>
        <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">
          Name
        </label>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Coding, Gym, Reading"
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">
          Color
        </label>
        <ActivityColorPicker value={color} onChange={setColor} />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">
          Icon
        </label>
        <ActivityIconPicker value={icon} onChange={setIcon} />
      </div>

      <div className="mt-2 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-3 py-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text)]"
        >
          Cancel
        </button>
        <motion.button
          whileHover={{ scale: canSubmit ? 1.03 : 1 }}
          whileTap={{ scale: canSubmit ? 0.97 : 1 }}
          transition={fastSpring}
          type="submit"
          disabled={!canSubmit}
          className="rounded-lg px-4 py-1.5 text-sm font-medium text-white shadow-elevation-sm transition-shadow hover:shadow-elevation-md disabled:opacity-40 disabled:shadow-none active:shadow-none"
          style={{
            backgroundImage:
              'linear-gradient(180deg, color-mix(in srgb, var(--accent) 92%, white), var(--accent))'
          }}
        >
          {initial ? 'Save' : 'Create'}
        </motion.button>
      </div>
    </form>
  )
}
