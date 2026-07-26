import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { sliderSpring } from '@renderer/lib/motionPresets'
import type { NotificationPrefs } from '@shared/types'

const DEFAULT_PREFS: NotificationPrefs = { enabled: false, time: '20:00' }

export function NotificationsTab(): JSX.Element {
  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_PREFS)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    window.api.app.getNotificationPrefs().then((p) => {
      setPrefs(p)
      setLoaded(true)
    })
  }, [])

  const update = (patch: Partial<NotificationPrefs>): void => {
    const next = { ...prefs, ...patch }
    setPrefs(next)
    window.api.app.setNotificationPrefs(next)
  }

  if (!loaded) return <div className="p-4 text-sm text-[var(--text-muted)]">Loading…</div>

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-4 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-4">
        <div>
          <p className="text-sm font-medium">Remind me to log</p>
          <p className="mt-0.5 text-xs text-[var(--text-muted)]">
            Get a reminder if you haven't logged anything by this time.
          </p>
        </div>
        <button
          role="switch"
          aria-checked={prefs.enabled}
          onClick={() => update({ enabled: !prefs.enabled })}
          className="relative h-6 w-11 flex-shrink-0 rounded-full transition-colors"
          style={{ backgroundColor: prefs.enabled ? 'var(--accent)' : 'var(--border)' }}
        >
          <motion.span
            layout
            transition={sliderSpring}
            className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-elevation-sm"
            style={{ left: prefs.enabled ? '22px' : '2px' }}
          />
        </button>
      </div>

      {prefs.enabled && (
        <div className="flex items-center justify-between gap-4 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-4">
          <p className="text-sm font-medium">Reminder time</p>
          <input
            type="time"
            value={prefs.time}
            onChange={(e) => update({ time: e.target.value })}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]"
          />
        </div>
      )}
    </div>
  )
}
