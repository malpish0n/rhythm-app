import { Capacitor } from '@capacitor/core'
import { createCapacitorApi } from './capacitorApi'

export function installPlatformApi(): void {
  if (Capacitor.isNativePlatform() && typeof window.api === 'undefined') {
    window.api = createCapacitorApi()
  }
}
