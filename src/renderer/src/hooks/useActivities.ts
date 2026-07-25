import { useCallback, useEffect } from 'react'
import { useAppStore } from '@renderer/state/store'
import type { CreateActivityInput, UpdateActivityInput } from '@shared/types'

export function useActivities(): {
  activities: ReturnType<typeof useAppStore.getState>['activities']
  reload: () => Promise<void>
  createActivity: (input: CreateActivityInput) => Promise<void>
  updateActivity: (id: string, patch: UpdateActivityInput) => Promise<void>
  archiveActivity: (id: string) => Promise<void>
  deleteActivity: (id: string) => Promise<void>
  reorderActivities: (orderedIds: string[]) => Promise<void>
} {
  const activities = useAppStore((s) => s.activities)
  const setActivities = useAppStore((s) => s.setActivities)

  const reload = useCallback(async () => {
    const list = await window.api.activities.list(false)
    setActivities(list)
  }, [setActivities])

  useEffect(() => {
    reload()
  }, [reload])

  const createActivity = useCallback(
    async (input: CreateActivityInput) => {
      await window.api.activities.create(input)
      await reload()
    },
    [reload]
  )

  const updateActivity = useCallback(
    async (id: string, patch: UpdateActivityInput) => {
      await window.api.activities.update(id, patch)
      await reload()
    },
    [reload]
  )

  const archiveActivity = useCallback(
    async (id: string) => {
      await window.api.activities.archive(id)
      await reload()
    },
    [reload]
  )

  const deleteActivity = useCallback(
    async (id: string) => {
      await window.api.activities.delete(id)
      await reload()
    },
    [reload]
  )

  const reorderActivities = useCallback(
    async (orderedIds: string[]) => {
      setActivities(
        orderedIds
          .map((id) => activities.find((a) => a.id === id))
          .filter((a): a is NonNullable<typeof a> => a !== undefined)
      )
      await window.api.activities.reorder(orderedIds)
      await reload()
    },
    [activities, reload, setActivities]
  )

  return {
    activities,
    reload,
    createActivity,
    updateActivity,
    archiveActivity,
    deleteActivity,
    reorderActivities
  }
}
