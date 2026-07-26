import type { Transition } from 'motion/react'

export const fastSpring: Transition = { type: 'spring', stiffness: 500, damping: 35 }

export const sliderSpring: Transition = { type: 'spring', stiffness: 400, damping: 32 }

export const fade: Transition = { duration: 0.18, ease: 'easeOut' }

export const tapScale = {
  whileHover: { scale: 1.03 },
  whileTap: { scale: 0.97 },
  transition: fastSpring
}

export const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } }
}

export const staggerItem = {
  hidden: { opacity: 0, y: 12, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: fastSpring }
}

export const cardHover = {
  whileHover: { y: -2 },
  transition: fastSpring
}
