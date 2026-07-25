export const CATEGORY_PALETTE = [
  '#22c55e', // green
  '#3b82f6', // blue
  '#f97316', // orange
  '#ec4899', // pink
  '#a855f7', // purple
  '#eab308', // yellow
  '#14b8a6', // teal
  '#ef4444', // red
  '#6366f1', // indigo
  '#84cc16' // lime
]

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '')
  const bigint = parseInt(clean, 16)
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255]
}

const INTENSITY_STEPS = 4

/**
 * Translucent overlay of the category color, scaled by count relative to
 * maxCount, so it reads correctly against either a light or dark surface
 * without needing to know the theme's base color.
 */
export function intensityRgba(count: number, maxCount: number, categoryHex: string): string {
  if (count <= 0) return 'transparent'
  const step = Math.min(
    INTENSITY_STEPS,
    Math.max(1, Math.ceil((count / Math.max(maxCount, 1)) * INTENSITY_STEPS))
  )
  const opacity = 0.22 + (step / INTENSITY_STEPS) * 0.78
  const [r, g, b] = hexToRgb(categoryHex)
  return `rgba(${r}, ${g}, ${b}, ${opacity.toFixed(2)})`
}
