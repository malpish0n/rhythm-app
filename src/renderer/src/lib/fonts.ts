export interface FontOption {
  id: string
  name: string
  stack: string
}

export const FONTS: FontOption[] = [
  {
    id: 'inter',
    name: 'Inter',
    stack: "'Inter Variable', 'Inter', system-ui, sans-serif"
  },
  {
    id: 'system',
    name: 'SF Pro (Apple)',
    stack:
      "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui, sans-serif"
  },
  {
    id: 'roboto',
    name: 'Roboto',
    stack: "'Roboto', system-ui, sans-serif"
  },
  {
    id: 'manrope',
    name: 'Manrope',
    stack: "'Manrope Variable', 'Manrope', system-ui, sans-serif"
  },
  {
    id: 'poppins',
    name: 'Poppins',
    stack: "'Poppins', system-ui, sans-serif"
  }
]

export const FONT_MAP: Record<string, FontOption> = Object.fromEntries(
  FONTS.map((f) => [f.id, f])
)

export const DEFAULT_FONT = 'inter'
