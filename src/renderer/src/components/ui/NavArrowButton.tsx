import { motion } from 'motion/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { fastSpring } from '@renderer/lib/motionPresets'
import { Tooltip } from './Tooltip'

export const navButtonClass =
  'flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text)] disabled:opacity-30 disabled:hover:bg-transparent'

interface NavArrowButtonProps {
  direction: 'prev' | 'next'
  label: string
  onClick: () => void
  disabled?: boolean
  tooltipSide?: 'top' | 'bottom' | 'left' | 'right'
  size?: number
}

export function NavArrowButton({
  direction,
  label,
  onClick,
  disabled,
  tooltipSide = 'top',
  size = 17
}: NavArrowButtonProps): JSX.Element {
  const Icon = direction === 'prev' ? ChevronLeft : ChevronRight
  return (
    <Tooltip label={label} side={tooltipSide}>
      <motion.button
        whileTap={{ scale: 0.9 }}
        transition={fastSpring}
        onClick={onClick}
        disabled={disabled}
        className={navButtonClass}
        aria-label={label}
      >
        <Icon size={size} />
      </motion.button>
    </Tooltip>
  )
}
