import { ipcMain } from 'electron'
import { CHANNELS } from './channels'
import * as activitiesRepo from '../db/repositories/activitiesRepo'
import * as logEntriesRepo from '../db/repositories/logEntriesRepo'
import * as planRulesRepo from '../db/repositories/planRulesRepo'
import * as prefsRepo from '../db/repositories/prefsRepo'
import { applyDockIcon } from '../dockIcon'
import type {
  CreateActivityInput,
  CreatePlanRuleInput,
  DockIconStyle,
  ThemePreference,
  UpdateActivityInput,
  UpdateLogEntryInput,
  UpdatePlanRuleInput
} from '@shared/types'

export function registerIpcHandlers(): void {
  ipcMain.handle(CHANNELS.activities.list, (_e, includeArchived?: boolean) =>
    activitiesRepo.list(includeArchived)
  )
  ipcMain.handle(CHANNELS.activities.create, (_e, input: CreateActivityInput) =>
    activitiesRepo.create(input)
  )
  ipcMain.handle(CHANNELS.activities.update, (_e, id: string, patch: UpdateActivityInput) =>
    activitiesRepo.update(id, patch)
  )
  ipcMain.handle(CHANNELS.activities.archive, (_e, id: string) => activitiesRepo.archive(id))
  ipcMain.handle(CHANNELS.activities.delete, (_e, id: string) => activitiesRepo.remove(id))
  ipcMain.handle(CHANNELS.activities.reorder, (_e, orderedIds: string[]) =>
    activitiesRepo.reorder(orderedIds)
  )

  ipcMain.handle(
    CHANNELS.logEntries.listByRange,
    (_e, startDate: string, endDate: string, activityId?: string) =>
      logEntriesRepo.listByRange(startDate, endDate, activityId)
  )
  ipcMain.handle(
    CHANNELS.logEntries.aggregateByRange,
    (_e, startDate: string, endDate: string, activityId?: string) =>
      logEntriesRepo.aggregateByRange(startDate, endDate, activityId)
  )
  ipcMain.handle(
    CHANNELS.logEntries.quickAdd,
    (_e, activityId: string, date?: string, count?: number) =>
      logEntriesRepo.quickAdd(activityId, date, count)
  )
  ipcMain.handle(CHANNELS.logEntries.update, (_e, id: string, patch: UpdateLogEntryInput) =>
    logEntriesRepo.update(id, patch)
  )
  ipcMain.handle(CHANNELS.logEntries.undoLast, (_e, activityId: string, date: string) =>
    logEntriesRepo.undoLast(activityId, date)
  )
  ipcMain.handle(CHANNELS.logEntries.delete, (_e, id: string) => logEntriesRepo.remove(id))

  ipcMain.handle(CHANNELS.stats.totalsPerActivity, () => logEntriesRepo.totalsPerActivity())
  ipcMain.handle(CHANNELS.stats.streak, (_e, activityId?: string) =>
    logEntriesRepo.streak(activityId)
  )

  ipcMain.handle(CHANNELS.plans.list, () => planRulesRepo.list())
  ipcMain.handle(CHANNELS.plans.create, (_e, input: CreatePlanRuleInput) =>
    planRulesRepo.create(input)
  )
  ipcMain.handle(CHANNELS.plans.update, (_e, id: string, patch: UpdatePlanRuleInput) =>
    planRulesRepo.update(id, patch)
  )
  ipcMain.handle(CHANNELS.plans.delete, (_e, id: string) => planRulesRepo.remove(id))
  ipcMain.handle(CHANNELS.plans.skipOccurrence, (_e, planRuleId: string, date: string) =>
    planRulesRepo.skipOccurrence(planRuleId, date)
  )
  ipcMain.handle(CHANNELS.plans.unskipOccurrence, (_e, planRuleId: string, date: string) =>
    planRulesRepo.unskipOccurrence(planRuleId, date)
  )

  ipcMain.handle(CHANNELS.app.getTheme, () => prefsRepo.getTheme())
  ipcMain.handle(CHANNELS.app.setTheme, (_e, theme: ThemePreference) => prefsRepo.setTheme(theme))
  ipcMain.handle(CHANNELS.app.getDockIconStyle, () => prefsRepo.getDockIconStyle())
  ipcMain.handle(CHANNELS.app.setDockIconStyle, (_e, style: DockIconStyle) => {
    prefsRepo.setDockIconStyle(style)
    applyDockIcon(style)
  })
}
