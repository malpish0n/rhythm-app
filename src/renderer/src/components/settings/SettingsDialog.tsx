import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Bell, Info, Palette, SlidersHorizontal, X } from 'lucide-react'
import { AppearanceTab } from './AppearanceTab'
import { GeneralTab } from './GeneralTab'
import { NotificationsTab } from './NotificationsTab'
import { AboutTab } from './AboutTab'
import { fade, sliderSpring } from '@renderer/lib/motionPresets'

type SettingsTab = 'appearance' | 'general' | 'notifications' | 'about'

const TABS: { id: SettingsTab; label: string; icon: typeof Palette }[] = [
  { id: 'general', label: 'General', icon: SlidersHorizontal },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'about', label: 'About', icon: Info }
]

interface SettingsDialogProps {
  open: boolean
  onClose: () => void
}

export function SettingsDialog({ open, onClose }: SettingsDialogProps): JSX.Element {
  const [tab, setTab] = useState<SettingsTab>('appearance')

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={fade}
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={fade}
            onClick={(e) => e.stopPropagation()}
            className="glass-surface flex h-[32rem] w-full max-w-2xl flex-col overflow-hidden rounded-2xl shadow-elevation-lg"
          >
            <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-3.5">
              <h2 className="text-sm font-semibold">Settings</h2>
              <button
                onClick={onClose}
                className="rounded-md p-1 text-[var(--text-muted)] hover:text-[var(--text)]"
                aria-label="Close settings"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex min-h-0 flex-1">
              <nav className="flex w-40 flex-shrink-0 flex-col gap-0.5 border-r border-[var(--border)] p-3">
                {TABS.map(({ id, label, icon: Icon }) => {
                  const isActive = tab === id
                  return (
                    <button
                      key={id}
                      onClick={() => setTab(id)}
                      className={
                        isActive
                          ? 'relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-white'
                          : 'relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text)]'
                      }
                    >
                      {isActive && (
                        <motion.span
                          layoutId="activeSettingsTab"
                          transition={sliderSpring}
                          className="absolute inset-0 rounded-lg bg-[var(--accent)] shadow-elevation-sm"
                        />
                      )}
                      <Icon size={15} className="relative" />
                      <span className="relative">{label}</span>
                    </button>
                  )
                })}
              </nav>

              <div className="flex-1 overflow-y-auto p-5">
                {tab === 'appearance' && <AppearanceTab />}
                {tab === 'general' && <GeneralTab />}
                {tab === 'notifications' && <NotificationsTab />}
                {tab === 'about' && <AboutTab />}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
