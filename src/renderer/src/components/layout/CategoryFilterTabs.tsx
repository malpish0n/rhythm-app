import { motion } from 'motion/react'
import { sliderSpring } from '@renderer/lib/motionPresets'
import type { Activity } from '@shared/types'

interface CategoryFilterTabsProps {
  activities: Activity[]
  selected: string
  onSelect: (id: string) => void
}

export function CategoryFilterTabs({
  activities,
  selected,
  onSelect
}: CategoryFilterTabsProps): JSX.Element {
  const tabs = [{ id: 'all', name: 'All', color: 'var(--text-muted)' }, ...activities]

  return (
    <div className="flex flex-col gap-0.5">
      {tabs.map((tab) => {
        const isActive = tab.id === selected
        return (
          <button
            key={tab.id}
            onClick={() => onSelect(tab.id)}
            className={
              isActive
                ? 'relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white'
                : 'relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text)]'
            }
          >
            {isActive && (
              <motion.span
                layoutId="activeCategoryTab"
                transition={sliderSpring}
                className="absolute inset-0 rounded-lg shadow-elevation-sm"
                style={{ backgroundColor: 'color' in tab ? tab.color : 'var(--accent)' }}
              />
            )}
            <span className="relative flex min-w-0 items-center gap-2">
              {tab.id !== 'all' && (
                <span
                  className="h-2 w-2 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: isActive ? 'white' : tab.color }}
                />
              )}
              <span className="truncate">{tab.name}</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
