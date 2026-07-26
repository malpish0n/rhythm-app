import { motion } from 'motion/react'
import type { LucideIcon } from 'lucide-react'
import { sliderSpring } from '@renderer/lib/motionPresets'
import { Tooltip } from './Tooltip'

export interface SegmentedOption<T extends string> {
  value: T
  label?: string
  icon?: LucideIcon
  tooltip?: string
}

interface SegmentedControlProps<T extends string> {
  options: SegmentedOption<T>[]
  value: T
  onChange: (value: T) => void
  layoutId: string
  size?: 'sm' | 'md'
  className?: string
  fullWidth?: boolean
  capitalizeLabels?: boolean
  'aria-label'?: string
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  layoutId,
  size = 'md',
  className,
  fullWidth,
  capitalizeLabels,
  'aria-label': ariaLabel
}: SegmentedControlProps<T>): JSX.Element {
  const isIconOnly = options.every((o) => o.icon && !o.label)
  const widthClass = fullWidth ? 'flex-1' : ''
  const capsClass = capitalizeLabels ? 'capitalize' : ''
  const segmentClass =
    size === 'sm'
      ? isIconOnly
        ? 'flex h-7 w-7 items-center justify-center rounded-md transition-colors'
        : `rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${widthClass} ${capsClass}`
      : isIconOnly
        ? 'flex h-8 w-8 items-center justify-center rounded-md transition-colors'
        : `rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${widthClass} ${capsClass}`

  return (
    <div
      className={`flex gap-1 rounded-lg border border-[var(--border)] p-1 ${className ?? 'bg-[var(--surface-2)]'}`}
      role="group"
      aria-label={ariaLabel}
    >
      {options.map((option) => {
        const isActive = option.value === value
        const Icon = option.icon
        const button = (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`relative ${segmentClass}`}
            style={{ color: isActive ? 'white' : 'var(--text-muted)' }}
            aria-label={option.label ?? option.tooltip}
            aria-pressed={isActive}
          >
            {isActive && (
              <motion.span
                layoutId={layoutId}
                transition={sliderSpring}
                className="absolute inset-0 rounded-md bg-[var(--accent)]"
              />
            )}
            {Icon && <Icon size={14} className="relative" />}
            {option.label && <span className="relative">{option.label}</span>}
          </button>
        )
        return option.tooltip ? (
          <Tooltip key={option.value} label={option.tooltip}>
            {button}
          </Tooltip>
        ) : (
          button
        )
      })}
    </div>
  )
}
