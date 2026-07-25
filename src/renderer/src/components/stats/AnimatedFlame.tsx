import { AnimatePresence, motion } from 'motion/react'
import { Flame } from 'lucide-react'
import { getStreakTier } from '@renderer/lib/streakTiers'

interface AnimatedFlameProps {
  current: number
}

export function AnimatedFlame({ current }: AnimatedFlameProps): JSX.Element | null {
  const tier = getStreakTier(current)
  if (!tier) return null

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={tier.min}
        initial={{ scale: 0.4, opacity: 0, rotate: -8 }}
        animate={{
          scale: [1, 1.09, 1],
          opacity: 1,
          rotate: [0, -3, 3, 0]
        }}
        exit={{ scale: 0.4, opacity: 0 }}
        transition={{
          scale: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' },
          rotate: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' },
          opacity: { duration: 0.25 }
        }}
        className="inline-flex flex-shrink-0"
        style={{ color: tier.color, filter: `drop-shadow(0 0 6px ${tier.glow})` }}
      >
        <Flame size={tier.size} fill={tier.color} strokeWidth={1.5} />
      </motion.span>
    </AnimatePresence>
  )
}
