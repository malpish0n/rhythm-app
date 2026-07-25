import { motion } from 'motion/react'
import { Plus } from 'lucide-react'
import { fastSpring } from '@renderer/lib/motionPresets'

interface QuickAddFabProps {
  onClick: () => void
}

export function QuickAddFab({ onClick }: QuickAddFabProps): JSX.Element {
  return (
    <motion.button
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
      transition={fastSpring}
      onClick={onClick}
      aria-label="Add category"
      className="fixed right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-elevation-lg transition-shadow hover:shadow-elevation-lg bottom-[max(2rem,calc(env(safe-area-inset-bottom)+5.5rem))] sm:right-8 lg:bottom-8"
      style={{
        backgroundImage:
          'linear-gradient(180deg, color-mix(in srgb, var(--accent) 92%, white), var(--accent))'
      }}
    >
      <Plus size={22} />
    </motion.button>
  )
}
