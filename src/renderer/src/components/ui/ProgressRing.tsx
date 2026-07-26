import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { sliderSpring } from '@renderer/lib/motionPresets'

interface ProgressRingProps {
  progress: number // 0..1
  size?: number
  strokeWidth?: number
  color: string
  children?: ReactNode
}

export function ProgressRing({
  progress,
  size = 44,
  strokeWidth = 4,
  color,
  children
}: ProgressRingProps): JSX.Element {
  const clamped = Math.max(0, Math.min(1, progress))
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--surface-2)"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - clamped) }}
          transition={sliderSpring}
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">{children}</div>
      )}
    </div>
  )
}
