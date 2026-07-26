import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { BarChart3, Calendar, House, Menu, Search, Settings, Tags, X } from 'lucide-react'
import { CategoryFilterTabs } from './CategoryFilterTabs'
import { fade } from '@renderer/lib/motionPresets'
import { Tooltip } from '@renderer/components/ui/Tooltip'
import { useAppStore, type AppView } from '@renderer/state/store'
import type { Activity } from '@shared/types'

interface MobileBottomBarProps {
  activities: Activity[]
  categoryFilter: string
  onCategoryFilterChange: (id: string) => void
  onManageCategories: () => void
  onOpenSettings: () => void
}

const TABS: { view: AppView; label: string; icon: typeof House }[] = [
  { view: 'home', label: 'Home', icon: House },
  { view: 'calendar', label: 'Calendar', icon: Calendar },
  { view: 'stats', label: 'Stats', icon: BarChart3 }
]

export function MobileBottomBar({
  activities,
  categoryFilter,
  onCategoryFilterChange,
  onManageCategories,
  onOpenSettings
}: MobileBottomBarProps): JSX.Element {
  const [sheetOpen, setSheetOpen] = useState(false)
  const activeView = useAppStore((s) => s.activeView)
  const setActiveView = useAppStore((s) => s.setActiveView)
  const setCommandPaletteOpen = useAppStore((s) => s.setCommandPaletteOpen)

  return (
    <>
      <nav
        className="glass-surface fixed inset-x-0 bottom-0 z-30 flex items-stretch justify-around lg:hidden"
        style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
      >
        {TABS.map(({ view, label, icon: Icon }) => {
          const isActive = activeView === view
          return (
            <button
              key={view}
              onClick={() => setActiveView(view)}
              className="relative flex flex-1 flex-col items-center gap-0.5 py-2.5"
              style={{ color: isActive ? 'var(--accent)' : 'var(--text-muted)' }}
            >
              {isActive && (
                <motion.span
                  layoutId="mobileTab"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  className="absolute top-0 h-0.5 w-8 rounded-full bg-[var(--accent)]"
                />
              )}
              <Icon size={20} />
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          )
        })}
        <button
          onClick={() => setSheetOpen(true)}
          aria-label="More"
          className="flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[var(--text-muted)]"
        >
          <Menu size={20} />
          <span className="text-[10px] font-medium">More</span>
        </button>
      </nav>

      <AnimatePresence>
        {sheetOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={fade}
            className="fixed inset-0 z-40 flex items-end bg-black/40 lg:hidden"
            onClick={() => setSheetOpen(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={fade}
              onClick={(e) => e.stopPropagation()}
              className="glass-surface max-h-[75vh] w-full overflow-y-auto rounded-t-2xl p-4 shadow-elevation-lg"
              style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
            >
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold">Menu</p>
                <Tooltip label="Close">
                  <button
                    onClick={() => setSheetOpen(false)}
                    className="rounded-md p-1 text-[var(--text-muted)] hover:text-[var(--text)]"
                    aria-label="Close"
                  >
                    <X size={16} />
                  </button>
                </Tooltip>
              </div>

              <p className="mb-1.5 px-1 text-[10px] font-medium uppercase tracking-wide text-[var(--text-muted)]">
                Categories
              </p>
              <CategoryFilterTabs
                activities={activities}
                selected={categoryFilter}
                onSelect={(id) => {
                  onCategoryFilterChange(id)
                  setSheetOpen(false)
                }}
              />

              <div className="mt-4 flex flex-col gap-0.5 border-t border-[var(--border)] pt-3">
                <button
                  onClick={() => {
                    setSheetOpen(false)
                    setCommandPaletteOpen(true)
                  }}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
                >
                  <Search size={15} />
                  Search & commands
                </button>
                <button
                  onClick={() => {
                    onManageCategories()
                    setSheetOpen(false)
                  }}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
                >
                  <Tags size={15} />
                  Manage categories
                </button>
                <button
                  onClick={() => {
                    onOpenSettings()
                    setSheetOpen(false)
                  }}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
                >
                  <Settings size={15} />
                  Settings
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
