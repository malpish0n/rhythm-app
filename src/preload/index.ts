import { contextBridge, ipcRenderer } from 'electron'
import { CHANNELS } from '../main/ipc/channels'
import type {
  ActivityApi,
  CreateActivityInput,
  CreatePlanRuleInput,
  DockIconStyle,
  ThemePreference,
  UpdateActivityInput,
  UpdateLogEntryInput,
  UpdatePlanRuleInput
} from '@shared/types'

const api: ActivityApi = {
  activities: {
    list: (includeArchived) => ipcRenderer.invoke(CHANNELS.activities.list, includeArchived),
    create: (input: CreateActivityInput) => ipcRenderer.invoke(CHANNELS.activities.create, input),
    update: (id, patch: UpdateActivityInput) =>
      ipcRenderer.invoke(CHANNELS.activities.update, id, patch),
    archive: (id) => ipcRenderer.invoke(CHANNELS.activities.archive, id),
    delete: (id) => ipcRenderer.invoke(CHANNELS.activities.delete, id),
    reorder: (orderedIds) => ipcRenderer.invoke(CHANNELS.activities.reorder, orderedIds)
  },
  logEntries: {
    listByRange: (startDate, endDate, activityId) =>
      ipcRenderer.invoke(CHANNELS.logEntries.listByRange, startDate, endDate, activityId),
    aggregateByRange: (startDate, endDate, activityId) =>
      ipcRenderer.invoke(CHANNELS.logEntries.aggregateByRange, startDate, endDate, activityId),
    quickAdd: (activityId, date, count) =>
      ipcRenderer.invoke(CHANNELS.logEntries.quickAdd, activityId, date, count),
    update: (id, patch: UpdateLogEntryInput) =>
      ipcRenderer.invoke(CHANNELS.logEntries.update, id, patch),
    undoLast: (activityId, date) =>
      ipcRenderer.invoke(CHANNELS.logEntries.undoLast, activityId, date),
    delete: (id) => ipcRenderer.invoke(CHANNELS.logEntries.delete, id)
  },
  stats: {
    totalsPerActivity: () => ipcRenderer.invoke(CHANNELS.stats.totalsPerActivity),
    streak: (activityId) => ipcRenderer.invoke(CHANNELS.stats.streak, activityId)
  },
  plans: {
    list: () => ipcRenderer.invoke(CHANNELS.plans.list),
    create: (input: CreatePlanRuleInput) => ipcRenderer.invoke(CHANNELS.plans.create, input),
    update: (id, patch: UpdatePlanRuleInput) =>
      ipcRenderer.invoke(CHANNELS.plans.update, id, patch),
    delete: (id) => ipcRenderer.invoke(CHANNELS.plans.delete, id),
    skipOccurrence: (planRuleId, date) =>
      ipcRenderer.invoke(CHANNELS.plans.skipOccurrence, planRuleId, date),
    unskipOccurrence: (planRuleId, date) =>
      ipcRenderer.invoke(CHANNELS.plans.unskipOccurrence, planRuleId, date)
  },
  app: {
    getTheme: () => ipcRenderer.invoke(CHANNELS.app.getTheme),
    setTheme: (theme: ThemePreference) => ipcRenderer.invoke(CHANNELS.app.setTheme, theme),
    getDockIconStyle: () => ipcRenderer.invoke(CHANNELS.app.getDockIconStyle),
    setDockIconStyle: (style: DockIconStyle) =>
      ipcRenderer.invoke(CHANNELS.app.setDockIconStyle, style)
  }
}

contextBridge.exposeInMainWorld('api', api)
