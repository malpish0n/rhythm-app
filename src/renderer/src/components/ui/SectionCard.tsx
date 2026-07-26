import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import type { LucideIcon } from 'lucide-react'
import { cardHover } from '@renderer/lib/motionPresets'

interface SectionCardProps {
  title?: string
  icon?: LucideIcon
  action?: ReactNode
  hoverLift?: boolean
  className?: string
  children: ReactNode
}

export function SectionCard({
  title,
  icon: Icon,
  action,
  hoverLift,
  className,
  children
}: SectionCardProps): JSX.Element {
  const Wrapper = hoverLift ? motion.div : 'div'

  return (
    <Wrapper
      {...(hoverLift ? cardHover : {})}
      className={`rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-elevation-sm sm:p-5 ${
        hoverLift ? 'transition-shadow hover:shadow-elevation-md' : ''
      } ${className ?? ''}`}
    >
      {(title || action) && (
        <div className="mb-3 flex items-center justify-between gap-2">
          {title && (
            <p className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-muted)]">
              {Icon && <Icon size={13} />}
              {title}
            </p>
          )}
          {action}
        </div>
      )}
      {children}
    </Wrapper>
  )
}
