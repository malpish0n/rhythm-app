import { motion } from 'motion/react'
import type { LucideIcon } from 'lucide-react'
import { fastSpring } from '@renderer/lib/motionPresets'

interface ChipProps {
  color: string
  active: boolean
  icon?: LucideIcon
  label: string
  detail?: string
  size?: 'md' | 'lg'
  onClick?: () => void
}

export function Chip({ color, active, icon: Icon, label, detail, size = 'md', onClick }: ChipProps): JSX.Element {
  const sizeClass =
    size === 'lg' ? 'gap-2 px-4 py-2 text-sm' : 'gap-1.5 px-3 py-1.5 text-xs'
  const iconSize = size === 'lg' ? 14 : 12
  const isLgActive = size === 'lg' && active

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.95 }}
      transition={fastSpring}
      onClick={onClick}
      className={`flex items-center rounded-full border font-medium shadow-elevation-sm transition-colors active:shadow-none ${sizeClass}`}
      style={{
        borderColor: active ? color : 'var(--border)',
        backgroundImage: isLgActive
          ? `linear-gradient(180deg, color-mix(in srgb, ${color} 30%, var(--surface)), color-mix(in srgb, ${color} 16%, var(--surface)))`
          : undefined,
        backgroundColor: !isLgActive ? (active ? `${color}22` : 'var(--surface-2)') : undefined,
        boxShadow: isLgActive ? `0 2px 8px ${color}33` : undefined,
        color: active ? color : 'var(--text-muted)'
      }}
    >
      {Icon && <Icon size={iconSize} />}
      {label}
      {detail && <span className="tabular-nums">{detail}</span>}
    </motion.button>
  )
}
