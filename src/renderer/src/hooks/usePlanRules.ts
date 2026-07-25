import { useCallback, useEffect } from 'react'
import { useAppStore } from '@renderer/state/store'
import type { CreatePlanRuleInput, PlanRule, UpdatePlanRuleInput } from '@shared/types'

export function usePlanRules(): {
  planRules: PlanRule[]
  reload: () => Promise<void>
  createPlan: (input: CreatePlanRuleInput) => Promise<PlanRule>
  updatePlan: (id: string, patch: UpdatePlanRuleInput) => Promise<void>
  deletePlan: (id: string) => Promise<void>
  skipOccurrence: (planRuleId: string, date: string) => Promise<void>
  moveOccurrence: (rule: PlanRule, fromDate: string, toDate: string) => Promise<void>
} {
  const planRules = useAppStore((s) => s.planRules)
  const setPlanRules = useAppStore((s) => s.setPlanRules)

  const reload = useCallback(async () => {
    const list = await window.api.plans.list()
    setPlanRules(list)
  }, [setPlanRules])

  useEffect(() => {
    reload()
  }, [reload])

  const createPlan = useCallback(
    async (input: CreatePlanRuleInput) => {
      const created = await window.api.plans.create(input)
      await reload()
      return created
    },
    [reload]
  )

  const updatePlan = useCallback(
    async (id: string, patch: UpdatePlanRuleInput) => {
      await window.api.plans.update(id, patch)
      await reload()
    },
    [reload]
  )

  const deletePlan = useCallback(
    async (id: string) => {
      await window.api.plans.delete(id)
      await reload()
    },
    [reload]
  )

  const skipOccurrence = useCallback(
    async (planRuleId: string, date: string) => {
      await window.api.plans.skipOccurrence(planRuleId, date)
      await reload()
    },
    [reload]
  )

  const moveOccurrence = useCallback(
    async (rule: PlanRule, fromDate: string, toDate: string) => {
      await window.api.plans.skipOccurrence(rule.id, fromDate)
      await window.api.plans.create({ activityId: rule.activityId, frequency: 'once', startDate: toDate })
      await reload()
    },
    [reload]
  )

  return { planRules, reload, createPlan, updatePlan, deletePlan, skipOccurrence, moveOccurrence }
}
