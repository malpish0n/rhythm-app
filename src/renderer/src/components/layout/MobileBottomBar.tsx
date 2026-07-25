import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { BarChart3, Calendar, LayoutGrid, MoreHorizontal, Settings, X } from 'lucide-react'
import { CategoryFilterTabs } from './CategoryFilterTabs'
import { ThemePicker } from './ThemePicker'
import { fade, sliderSpring } from '@renderer/lib/motionPresets'
import type { Activity } from '@shared/types'
import type { ViewMode } from '@renderer/state/store'

const VIEW_MODES: { mode: ViewMode; label: string; icon: typeof Calendar }[] = [
  { mode: 'month', label: 'Month', icon: Calendar },
  { mode: 'heatmap', label: 'Heatmap', icon: LayoutGrid },
  { mode: 'summary', label: 'Summary', icon: BarChart3 }
]

interface MobileBottomBarProps {
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  activities: Activity[]
  categoryFilter: string
  onCategoryFilterChange: (id: string) => void
  onManageCategories: () => void
}

export function MobileBottomBar({
  viewMode,
  onViewModeChange,
  activities,
  categoryFilter,
  onCategoryFilterChange,
  onManageCategories
}: MobileBottomBarProps): JSX.Element {
  const [sheetOpen, setSheetOpen] = useState(false)

  return (
    <>
      <nav
        className="glass-surface fixed inset-x-0 bottom-0 z-30 flex items-center justify-around px-2 pt-2 lg:hidden"
        style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
      >
        {VIEW_MODES.map(({ mode, label, icon: Icon }) => {
          const isActive = viewMode === mode
          return (
            <button
              key={mode}
              onClick={() => onViewModeChange(mode)}
              className="relative flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1.5 text-[10px] font-medium transition-colors"
              style={{ color: isActive ? 'var(--accent)' : 'var(--text-muted)' }}
            >
              {isActive && (
                <motion.span
                  layoutId="activeMobileViewMode"
                  transition={sliderSpring}
                  className="absolute inset-x-3 top-0 h-0.5 rounded-full bg-[var(--accent)]"
                />
              )}
              <Icon size={19} />
              {label}
            </button>
          )
        })}
        <button
          onClick={() => setSheetOpen(true)}
          className="flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1.5 text-[10px] font-medium text-[var(--text-muted)]"
        >
          <MoreHorizontal size={19} />
          More
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
                <p className="text-sm font-semibold">More</p>
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
                  <Settings size={15} />
                  Manage categories
                </button>
                <ThemePicker variant="row" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
