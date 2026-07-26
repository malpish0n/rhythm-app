import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface TooltipProps {
  label: string
  children: ReactNode
  side?: 'top' | 'bottom' | 'left' | 'right'
  className?: string
  style?: CSSProperties
}

const GAP = 8
const SHOW_DELAY = 300

function computePosition(rect: DOMRect, side: NonNullable<TooltipProps['side']>): CSSProperties {
  switch (side) {
    case 'bottom':
      return { top: rect.bottom + GAP, left: rect.left + rect.width / 2, transform: 'translateX(-50%)' }
    case 'left':
      return { top: rect.top + rect.height / 2, left: rect.left - GAP, transform: 'translate(-100%, -50%)' }
    case 'right':
      return { top: rect.top + rect.height / 2, left: rect.right + GAP, transform: 'translateY(-50%)' }
    case 'top':
    default:
      return { top: rect.top - GAP, left: rect.left + rect.width / 2, transform: 'translate(-50%, -100%)' }
  }
}

export function Tooltip({
  label,
  children,
  side = 'top',
  className,
  style
}: TooltipProps): JSX.Element {
  const wrapperRef = useRef<HTMLSpanElement>(null)
  const timeoutRef = useRef<number | null>(null)
  const [rect, setRect] = useState<DOMRect | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!rect) return
    const raf = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(raf)
  }, [rect])

  const show = (): void => {
    timeoutRef.current = window.setTimeout(() => {
      if (wrapperRef.current) setRect(wrapperRef.current.getBoundingClientRect())
    }, SHOW_DELAY)
  }

  const hide = (): void => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
    setVisible(false)
    setRect(null)
  }

  return (
    <span
      ref={wrapperRef}
      className={`inline-flex ${className ?? ''}`}
      style={style}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {rect &&
        createPortal(
          <span
            role="tooltip"
            className="pointer-events-none fixed z-[100] whitespace-nowrap rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-[11px] font-medium text-[var(--text)] shadow-elevation-md transition-opacity duration-100"
            style={{ ...computePosition(rect, side), opacity: visible ? 1 : 0 }}
          >
            {label}
          </span>,
          document.body
        )}
    </span>
  )
}
