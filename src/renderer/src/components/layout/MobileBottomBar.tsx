import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Menu, Settings, Tags, X } from 'lucide-react'
import { CategoryFilterTabs } from './CategoryFilterTabs'
import { fade } from '@renderer/lib/motionPresets'
import type { Activity } from '@shared/types'

interface MobileBottomBarProps {
  activities: Activity[]
  categoryFilter: string
  onCategoryFilterChange: (id: string) => void
  onManageCategories: () => void
  onOpenSettings: () => void
}

export function MobileBottomBar({
  activities,
  categoryFilter,
  onCategoryFilterChange,
  onManageCategories,
  onOpenSettings
}: MobileBottomBarProps): JSX.Element {
  const [sheetOpen, setSheetOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setSheetOpen(true)}
        aria-label="Menu"
        className="glass-surface fixed bottom-4 left-4 z-30 flex h-12 w-12 items-center justify-center rounded-full shadow-elevation-md lg:hidden"
        style={{ bottom: 'max(1rem, calc(env(safe-area-inset-bottom) + 0.5rem))' }}
      >
        <Menu size={20} className="text-[var(--text)]" />
      </button>

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
                <button
                  onClick={() => setSheetOpen(false)}
                  className="rounded-md p-1 text-[var(--text-muted)] hover:text-[var(--text)]"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
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
