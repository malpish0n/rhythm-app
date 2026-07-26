import { app, BrowserWindow, nativeImage, screen, Tray } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'

const TRAY_ICON_PATH = join(__dirname, '../../build/icon-round-dark.png')
const POPUP_WIDTH = 300
const POPUP_HEIGHT = 380

let tray: Tray | null = null
let popup: BrowserWindow | null = null

function createPopup(): BrowserWindow {
  const win = new BrowserWindow({
    width: POPUP_WIDTH,
    height: POPUP_HEIGHT,
    show: false,
    frame: false,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.cjs'),
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(`${process.env['ELECTRON_RENDERER_URL']}?tray=1`)
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'), { search: 'tray=1' })
  }

  win.on('blur', () => {
    win.hide()
  })

  return win
}

function togglePopup(): void {
  if (!popup) popup = createPopup()

  if (popup.isVisible()) {
    popup.hide()
    return
  }

  const trayBounds = tray!.getBounds()
  const display = screen.getDisplayNearestPoint({ x: trayBounds.x, y: trayBounds.y })
  const x = Math.round(trayBounds.x + trayBounds.width / 2 - POPUP_WIDTH / 2)
  const y = process.platform === 'darwin' ? trayBounds.y + trayBounds.height : trayBounds.y
  const clampedX = Math.min(Math.max(x, display.workArea.x), display.workArea.x + display.workArea.width - POPUP_WIDTH)

  popup.setPosition(clampedX, y)
  popup.show()
  popup.focus()
}

export function createTray(): void {
  if (process.platform !== 'darwin') return

  const icon = nativeImage.createFromPath(TRAY_ICON_PATH).resize({ width: 20, height: 20 })
  tray = new Tray(icon)
  tray.setToolTip(app.getName())
  tray.on('click', togglePopup)
}
