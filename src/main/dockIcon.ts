import { app, nativeImage } from 'electron'
import { join } from 'path'
import type { DockIconStyle } from '@shared/types'

const ICON_PATHS: Record<DockIconStyle, string> = {
  light: join(__dirname, '../../build/icon-round-light.png'),
  dark: join(__dirname, '../../build/icon-round-dark.png')
}

export function applyDockIcon(style: DockIconStyle): void {
  if (process.platform !== 'darwin' || !app.dock) return
  app.dock.setIcon(nativeImage.createFromPath(ICON_PATHS[style]))
}
