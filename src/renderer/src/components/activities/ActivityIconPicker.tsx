import { X } from 'lucide-react'
import { ICON_MAP, ICON_NAMES } from '@renderer/lib/icons'
import { Tooltip } from '@renderer/components/ui/Tooltip'

interface ActivityIconPickerProps {
  value: string | null
  onChange: (icon: string | null) => void
}

export function ActivityIconPicker({ value, onChange }: ActivityIconPickerProps): JSX.Element {
  return (
    <div className="flex flex-wrap gap-2">
      <Tooltip label="No icon">
        <button
          type="button"
          onClick={() => onChange(null)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--text-muted)] transition-transform hover:scale-110"
          style={{
            boxShadow:
              value === null ? `0 0 0 2px var(--surface), 0 0 0 4px var(--accent)` : undefined
          }}
          aria-label="No icon"
        >
          <X size={14} />
        </button>
      </Tooltip>
      {ICON_NAMES.map((name) => {
        const Icon = ICON_MAP[name]
        const selected = value === name
        return (
          <Tooltip key={name} label={name}>
            <button
              type="button"
              onClick={() => onChange(name)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text)] transition-transform hover:scale-110"
              style={{
                boxShadow: selected ? `0 0 0 2px var(--surface), 0 0 0 4px var(--accent)` : undefined
              }}
              aria-label={`Icon: ${name}`}
            >
              <Icon size={14} />
            </button>
          </Tooltip>
        )
      })}
    </div>
  )
}
