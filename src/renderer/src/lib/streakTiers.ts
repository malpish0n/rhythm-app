export interface StreakTier {
  min: number
  size: number
  color: string
  glow: string
}

// Ordered highest-first so getStreakTier can return the first match.
export const STREAK_TIERS: StreakTier[] = [
  { min: 365, size: 34, color: '#fbbf24', glow: 'rgba(251, 191, 36, 0.55)' },
  { min: 100, size: 30, color: '#f43f5e', glow: 'rgba(244, 63, 94, 0.5)' },
  { min: 50, size: 26, color: '#fb7185', glow: 'rgba(251, 113, 133, 0.45)' },
  { min: 25, size: 22, color: '#fb923c', glow: 'rgba(251, 146, 60, 0.4)' },
  { min: 10, size: 19, color: '#f97316', glow: 'rgba(249, 115, 22, 0.35)' },
  { min: 1, size: 16, color: '#fdba74', glow: 'rgba(253, 186, 116, 0.25)' }
]

export function getStreakTier(current: number): StreakTier | null {
  return STREAK_TIERS.find((t) => current >= t.min) ?? null
}
