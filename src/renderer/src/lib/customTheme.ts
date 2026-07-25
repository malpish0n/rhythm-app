import type { ThemeColors } from './themes'

export const DEFAULT_CUSTOM_COLORS: ThemeColors = {
  bg: '#080a12',
  surface: '#1a2036',
  surface2: '#333b52',
  border: '#515972',
  text: '#f5f7fa',
  textMuted: '#757f9a',
  accent: '#22d3ee'
}

export interface CustomTheme {
  colors: ThemeColors
  isDark: boolean
}

const KEY = 'rhythm:customTheme'

export function loadCustomTheme(): CustomTheme {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { colors: DEFAULT_CUSTOM_COLORS, isDark: true }
    const parsed = JSON.parse(raw) as Partial<CustomTheme>
    return {
      colors: { ...DEFAULT_CUSTOM_COLORS, ...parsed.colors },
      isDark: parsed.isDark ?? true
    }
  } catch {
    return { colors: DEFAULT_CUSTOM_COLORS, isDark: true }
  }
}

export function saveCustomTheme(theme: CustomTheme): void {
  localStorage.setItem(KEY, JSON.stringify(theme))
}
