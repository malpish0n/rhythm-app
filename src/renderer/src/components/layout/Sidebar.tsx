import { motion } from 'motion/react'
import { BarChart3, Calendar, LayoutGrid, Settings, Tags } from 'lucide-react'
import { CategoryFilterTabs } from './CategoryFilterTabs'
import { sliderSpring } from '@renderer/lib/motionPresets'
import logoMark from '@renderer/assets/logo-mark.png'
import type { Activity } from '@shared/types'
import type { ViewMode } from '@renderer/state/store'

const VIEW_MODES: { mode: ViewMode; label: string; icon: typeof Calendar }[] = [
  { mode: 'month', label: 'Month', icon: Calendar },
  { mode: 'heatmap', label: 'Heatmap', icon: LayoutGrid },
  { mode: 'summary', label: 'Summary', icon: BarChart3 }
]

interface SidebarProps {
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  activities: Activity[]
  categoryFilter: string
  onCategoryFilterChange: (id: string) => void
  onManageCategories: () => void
  onOpenSettings: () => void
}

export function Sidebar({
  viewMode,
  onViewModeChange,
  activities,
  categoryFilter,
  onCategoryFilterChange,
  onManageCategories,
  onOpenSettings
}: SidebarProps): JSX.Element {
  return (
    <aside
      className="glass-surface fixed inset-y-0 left-0 z-30 hidden w-60 flex-col overflow-y-auto lg:flex"
      style={{
        paddingTop: 'max(1.25rem, env(safe-area-inset-top))',
        paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))'
      }}
    >
      <div className="mt-8 flex items-center gap-2.5 px-5 pb-6">
        <img
          src={logoMark}
          alt="Rhythm"
          className="h-8 w-8 flex-shrink-0 rounded-lg object-cover shadow-elevation-sm"
        />
        <span
          className="text-base font-bold tracking-tight"
          style={{ fontFamily: "'Poppins', system-ui, sans-serif" }}
        >
          Rhythm
        </span>
      </div>

      <nav className="flex flex-col gap-0.5 px-3">
        {VIEW_MODES.map(({ mode, label, icon: Icon }) => {
          const isActive = viewMode === mode
          return (
            <button
              key={mode}
              onClick={() => onViewModeChange(mode)}
              className={
                isActive
                  ? 'relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-white'
                  : 'relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text)]'
              }
            >
              {isActive && (
                <motion.span
                  layoutId="activeViewMode"
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

      <div className="mt-6 px-3">
        <p className="mb-1.5 px-3 text-[10px] font-medium uppercase tracking-wide text-[var(--text-muted)]">
          Categories
        </p>
        <CategoryFilterTabs
          activities={activities}
          selected={categoryFilter}
          onSelect={onCategoryFilterChange}
        />
      </div>

      <div className="mt-auto flex flex-col gap-0.5 px-3 pt-6">
        <button
          onClick={onManageCategories}
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
        >
          <Tags size={15} />
          Manage categories
        </button>
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
        >
          <Settings size={15} />
          Settings
        </button>
      </div>
    </aside>
  )
}
