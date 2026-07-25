import type { ActivityApi } from '../shared/types'

declare global {
  interface Window {
    api: ActivityApi
  }
}
