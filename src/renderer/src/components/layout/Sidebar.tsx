import { motion } from 'motion/react'
import { BarChart3, Calendar, House, Search, Settings, Tags } from 'lucide-react'
import { CategoryFilterTabs } from './CategoryFilterTabs'
import { useAppStore, type AppView } from '@renderer/state/store'
import { sliderSpring } from '@renderer/lib/motionPresets'
import iconLight from '@renderer/assets/icon-round-light.png'
import iconDark from '@renderer/assets/icon-round-dark.png'
import type { Activity } from '@shared/types'

interface SidebarProps {
  activities: Activity[]
  categoryFilter: string
  onCategoryFilterChange: (id: string) => void
  onManageCategories: () => void
  onOpenSettings: () => void
}

const NAV_ITEMS: { view: AppView; label: string; icon: typeof House }[] = [
  { view: 'home', label: 'Home', icon: House },
  { view: 'calendar', label: 'Calendar', icon: Calendar },
  { view: 'stats', label: 'Statistics', icon: BarChart3 }
]

export function Sidebar({
  activities,
  categoryFilter,
  onCategoryFilterChange,
  onManageCategories,
  onOpenSettings
}: SidebarProps): JSX.Element {
  const dockIconStyle = useAppStore((s) => s.dockIconStyle)
  const activeView = useAppStore((s) => s.activeView)
  const setActiveView = useAppStore((s) => s.setActiveView)
  const setCommandPaletteOpen = useAppStore((s) => s.setCommandPaletteOpen)
  const logoMark = dockIconStyle === 'dark' ? iconDark : iconLight

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
          className="h-8 w-8 flex-shrink-0 object-cover"
        />
        <span
          className="text-base font-bold tracking-tight"
          style={{ fontFamily: "'Poppins', system-ui, sans-serif" }}
        >
          Rhythm
        </span>
      </div>

      <div className="px-3 pb-4">
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="flex w-full items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1.5 text-xs text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
        >
          <Search size={13} />
          <span className="flex-1 text-left">Search & commands…</span>
          <span className="rounded border border-[var(--border)] bg-[var(--surface)] px-1.5 py-0.5 text-[10px] font-medium">
            ⌘K
          </span>
        </button>
      </div>

      <div className="flex flex-col gap-0.5 px-3 pb-4">
        {NAV_ITEMS.map(({ view, label, icon: Icon }) => {
          const isActive = activeView === view
          return (
            <button
              key={view}
              onClick={() => setActiveView(view)}
              className="relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
              style={{ color: isActive ? 'var(--accent)' : 'var(--text-muted)' }}
            >
              {isActive && (
                <motion.span
                  layoutId="sidebarNav"
                  transition={sliderSpring}
                  className="absolute inset-0 rounded-lg bg-[var(--surface-2)]"
                />
              )}
              <Icon size={15} className="relative" />
              <span className="relative">{label}</span>
            </button>
          )
        })}
      </div>

      <div className="px-3">
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
