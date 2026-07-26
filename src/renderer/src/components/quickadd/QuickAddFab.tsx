import { motion } from 'motion/react'
import { Plus } from 'lucide-react'
import { fastSpring } from '@renderer/lib/motionPresets'
import { Tooltip } from '@renderer/components/ui/Tooltip'

interface QuickAddFabProps {
  onClick: () => void
}

export function QuickAddFab({ onClick }: QuickAddFabProps): JSX.Element {
  return (
    <Tooltip
      label="Add category"
      side="left"
      className="fixed right-4 z-50 bottom-[max(2rem,calc(env(safe-area-inset-bottom)+5.5rem))] sm:right-8 lg:bottom-8"
    >
      <motion.button
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        transition={fastSpring}
        onClick={onClick}
        aria-label="Add category"
        className="accent-gradient flex h-14 w-14 items-center justify-center rounded-full text-white shadow-elevation-lg transition-shadow hover:shadow-elevation-lg"
      >
        <Plus size={22} />
      </motion.button>
    </Tooltip>
  )
}
