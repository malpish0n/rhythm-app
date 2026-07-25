import { CATEGORY_PALETTE } from '@renderer/lib/color'

interface ActivityColorPickerProps {
  value: string
  onChange: (color: string) => void
}

export function ActivityColorPicker({ value, onChange }: ActivityColorPickerProps): JSX.Element {
  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORY_PALETTE.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onChange(color)}
          className="h-7 w-7 rounded-full ring-offset-2 ring-offset-[var(--surface)] transition-transform hover:scale-110"
          style={{
            backgroundColor: color,
            boxShadow: value === color ? `0 0 0 2px var(--surface), 0 0 0 4px ${color}` : undefined
          }}
          aria-label={`Choose color ${color}`}
        />
      ))}
    </div>
  )
}
