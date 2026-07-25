import { useCallback } from 'react'
import { useAppStore } from '@renderer/state/store'
import { todayIso } from '@renderer/lib/date'
import type { LogEntry, UpdateLogEntryInput } from '@shared/types'

export function useLogEntries(): {
  quickAdd: (activityId: string, count?: number, date?: string) => Promise<LogEntry>
  updateEntry: (id: string, patch: UpdateLogEntryInput) => Promise<void>
  undoLast: (activityId: string, date?: string) => Promise<void>
} {
  const bumpRefreshToken = useAppStore((s) => s.bumpRefreshToken)

  const quickAdd = useCallback(
    async (activityId: string, count?: number, date?: string) => {
      const entry = await window.api.logEntries.quickAdd(activityId, date, count)
      bumpRefreshToken()
      return entry
    },
    [bumpRefreshToken]
  )

  const updateEntry = useCallback(
    async (id: string, patch: UpdateLogEntryInput) => {
      await window.api.logEntries.update(id, patch)
      bumpRefreshToken()
    },
    [bumpRefreshToken]
  )

  const undoLast = useCallback(
    async (activityId: string, date?: string) => {
      await window.api.logEntries.undoLast(activityId, date ?? todayIso())
      bumpRefreshToken()
    },
    [bumpRefreshToken]
  )

  return { quickAdd, updateEntry, undoLast }
}
