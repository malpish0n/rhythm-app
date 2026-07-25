import { motion } from 'motion/react'
import { useAppStore } from '@renderer/state/store'
import { sliderSpring } from '@renderer/lib/motionPresets'

export function GeneralTab(): JSX.Element {
  const reduceMotion = useAppStore((s) => s.reduceMotion)
  const setReduceMotion = useAppStore((s) => s.setReduceMotion)

  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-4">
      <div>
        <p className="text-sm font-medium">Reduce motion</p>
        <p className="mt-0.5 text-xs text-[var(--text-muted)]">
          Turn off animations throughout the app, regardless of your system setting.
        </p>
      </div>
      <button
        role="switch"
        aria-checked={reduceMotion}
        onClick={() => setReduceMotion(!reduceMotion)}
        className="relative h-6 w-11 flex-shrink-0 rounded-full transition-colors"
        style={{ backgroundColor: reduceMotion ? 'var(--accent)' : 'var(--border)' }}
      >
        <motion.span
          layout
          transition={sliderSpring}
          className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-elevation-sm"
          style={{ left: reduceMotion ? '22px' : '2px' }}
        />
      </button>
    </div>
  )
}
