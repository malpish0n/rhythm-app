export interface ThemeColors {
  bg: string
  surface: string
  surface2: string
  border: string
  text: string
  textMuted: string
  accent: string
}

export interface ThemeDef {
  id: string
  name: string
  isDark: boolean
  colors: ThemeColors
}

export const THEMES: ThemeDef[] = [
  {
    id: 'rhythm-dark',
    name: 'Rhythm Dark',
    isDark: true,
    colors: {
      bg: '#080a12',
      surface: '#1a2036',
      surface2: '#252d4b',
      border: '#2a3352',
      text: '#f5f7fa',
      textMuted: '#757f9a',
      accent: '#ff7a5a'
    }
  },
  {
    id: 'rhythm-light',
    name: 'Rhythm Light',
    isDark: false,
    colors: {
      bg: '#f8fafc',
      surface: '#ffffff',
      surface2: '#f1f5f9',
      border: '#e2e8f0',
      text: '#1a2036',
      textMuted: '#64748b',
      accent: '#ff7a5a'
    }
  },
  {
    id: 'amber-earth',
    name: 'Amber Earth',
    isDark: true,
    colors: {
      bg: '#352208',
      surface: '#4c391c',
      surface2: '#685634',
      border: '#755e3c',
      text: '#e1bb80',
      textMuted: '#9f8758',
      accent: '#b28634'
    }
  },
  {
    id: 'abyss',
    name: 'Abyss',
    isDark: true,
    colors: {
      bg: '#0d0630',
      surface: '#12193e',
      surface2: '#18314f',
      border: '#2a4165',
      text: '#e6f9af',
      textMuted: '#abd3b1',
      accent: '#346db2'
    }
  },
  {
    id: 'cotton-candy',
    name: 'Cotton Candy',
    isDark: false,
    colors: {
      bg: '#f6c0d0',
      surface: '#e5b4c9',
      surface2: '#d0a5c0',
      border: '#ac8ea7',
      text: '#1e3231',
      textMuted: '#394953',
      accent: '#d369ac'
    }
  },
  {
    id: 'ultraviolet',
    name: 'Ultraviolet',
    isDark: true,
    colors: {
      bg: '#0f1020',
      surface: '#1d143c',
      surface2: '#2f195f',
      border: '#543991',
      text: '#efc3f5',
      textMuted: '#f6b0fc',
      accent: '#f43dff'
    }
  },
  {
    id: 'stone-lilac',
    name: 'Stone Lilac',
    isDark: false,
    colors: {
      bg: '#d7d6d6',
      surface: '#ccc6d0',
      surface2: '#beb2c8',
      border: '#a39eaa',
      text: '#36413e',
      textMuted: '#4f5454',
      accent: '#a369d3'
    }
  },
  {
    id: 'garnet',
    name: 'Garnet',
    isDark: true,
    colors: {
      bg: '#250902',
      surface: '#2e0707',
      surface2: '#38040e',
      border: '#500911',
      text: '#ad2831',
      textMuted: '#90171e',
      accent: '#d60f36'
    }
  },
  {
    id: 'cobalt-night',
    name: 'Cobalt Night',
    isDark: true,
    colors: {
      bg: '#1b264f',
      surface: '#24283d',
      surface2: '#302b27',
      border: '#2b3a61',
      text: '#f5f3f5',
      textMuted: '#8e9bc3',
      accent: '#4c6ef5'
    }
  },
  {
    id: 'rosewater',
    name: 'Rosewater',
    isDark: false,
    colors: {
      bg: '#fae8eb',
      surface: '#f8dbdc',
      surface2: '#f6caca',
      border: '#ecc6c8',
      text: '#0a014f',
      textMuted: '#8968a0',
      accent: '#e35959'
    }
  },
  {
    id: 'berry-cream',
    name: 'Berry Cream',
    isDark: false,
    colors: {
      bg: '#fdf0d5',
      surface: '#e4e5d4',
      surface2: '#c6d8d3',
      border: '#dd8f8a',
      text: '#331832',
      textMuted: '#9e1c4d',
      accent: '#f0544f'
    }
  },
  {
    id: 'azure-depths',
    name: 'Azure Depths',
    isDark: true,
    colors: {
      bg: '#061a40',
      surface: '#03264b',
      surface2: '#003559',
      border: '#024682',
      text: '#b9d6f2',
      textMuted: '#4192c3',
      accent: '#0089e6'
    }
  },
  {
    id: 'lavender-mist',
    name: 'Lavender Mist',
    isDark: false,
    colors: {
      bg: '#fde2ff',
      surface: '#f4d9f3',
      surface2: '#e8cee4',
      border: '#dfc4e6',
      text: '#5d576b',
      textMuted: '#7974cb',
      accent: '#443dff'
    }
  },
  {
    id: 'wild-sage',
    name: 'Wild Sage',
    isDark: false,
    colors: {
      bg: '#ede5a6',
      surface: '#d2dda7',
      surface2: '#b2d3a8',
      border: '#7dc496',
      text: '#592941',
      textMuted: '#4f645a',
      accent: '#52b788'
    }
  },
  {
    id: 'lemon-zest',
    name: 'Lemon Zest',
    isDark: false,
    colors: {
      bg: '#fafdf6',
      surface: '#f5f7d3',
      surface2: '#eeefa8',
      border: '#ece778',
      text: '#2d2a32',
      textMuted: '#9f9c2d',
      accent: '#b8860b'
    }
  },
  {
    id: 'mauve-dusk',
    name: 'Mauve Dusk',
    isDark: true,
    colors: {
      bg: '#3d2c2e',
      surface: '#3f3a40',
      surface2: '#424c55',
      border: '#695f5f',
      text: '#f5edf0',
      textMuted: '#ded8e3',
      accent: '#8a69d3'
    }
  },
  {
    id: 'olive-ember',
    name: 'Olive Ember',
    isDark: true,
    colors: {
      bg: '#3f3f37',
      surface: '#444134',
      surface2: '#494331',
      border: '#9b4c27',
      text: '#d6d6b1',
      textMuted: '#a3a188',
      accent: '#de541e'
    }
  },
  {
    id: 'pine-depths',
    name: 'Pine Depths',
    isDark: true,
    colors: {
      bg: '#1f2421',
      surface: '#204341',
      surface2: '#216869',
      border: '#378771',
      text: '#dce1de',
      textMuted: '#b2cfb6',
      accent: '#49a078'
    }
  },
  {
    id: 'deep-space',
    name: 'Deep Space',
    isDark: true,
    colors: {
      bg: '#080a12',
      surface: '#1a2036',
      surface2: '#333b52',
      border: '#515972',
      text: '#f5f7fa',
      textMuted: '#757f9a',
      accent: '#22d3ee'
    }
  }
]

export const THEME_MAP: Record<string, ThemeDef> = Object.fromEntries(
  THEMES.map((t) => [t.id, t])
)

export const DEFAULT_DARK_THEME = 'deep-space'
export const DEFAULT_LIGHT_THEME = 'berry-cream'

export function resolveActiveAccent(themeId: string, customAccent: string): string {
  if (themeId === 'custom') return customAccent
  return THEME_MAP[themeId]?.colors.accent ?? THEME_MAP[DEFAULT_DARK_THEME].colors.accent
}
