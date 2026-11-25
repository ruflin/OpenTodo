// What the task page and the side panel show (OpenSpec change minimal-task-page,
// design D1, D2): two synced hide-lists in the user_prefs row, `task_facts` and
// `task_tabs`. A hide-list, so a fact or a tab added later shows without a
// migration. Empty, unknown or unreadable values read as nothing hidden and are
// kept as stored. Hiding changes no data: REST, the CLI, MCP, the export and the
// task's history keep every value.
import { useMemo } from 'react'
import { useUserPrefsRow } from './localData'
import { mutate } from './ops'
import type { UserPrefs } from './types'
import { USER_PREFS_ID } from './userPrefs'

/**
 * The facts, by the group the settings switch hides. The ids are the ones the
 * task page and the panel render (`data-fact`), so a value hidden here is hidden
 * everywhere the fact is shown.
 */
export const FACT_GROUPS = {
  schedule: ['due', 'sector', 'when', 'deadline', 'reminders', 'repeat'],
  details: ['priority', 'estimate', 'energy', 'assignee', 'blocked-by', 'blocks', 'location'],
  labels: ['labels'],
  project: ['project', 'section', 'parent', 'origin'],
  fields: ['fields'],
  subtasks: ['subtasks'],
} as const

export type FactGroup = keyof typeof FACT_GROUPS
export type FactId = (typeof FACT_GROUPS)[FactGroup][number]

/** Every group, in settings order. */
export const FACT_GROUP_IDS: readonly FactGroup[] = ['schedule', 'details', 'labels', 'project', 'fields', 'subtasks']

/** Every fact id the pref can hide. */
export const ALL_FACTS: readonly FactId[] = FACT_GROUP_IDS.flatMap((g) => FACT_GROUPS[g])

/** The tabs the task page and the panel can hide, in their order. */
export const TASK_TABS = ['comments', 'activity', 'history', 'time'] as const
export type TaskTabId = (typeof TASK_TABS)[number]

function readHideList(value: unknown, allowed: readonly string[]): Set<string> {
  const wanted = new Set(typeof value === 'string' ? value.split(',').map((s) => s.trim()).filter(Boolean) : [])
  return new Set(allowed.filter((id) => wanted.has(id)))
}

function writeHideList(value: Iterable<string>, allowed: readonly string[]): string {
  const wanted = new Set(value)
  return allowed.filter((id) => wanted.has(id)).join(',')
}

/** The hidden facts of a stored row; unknown ids and other values read as nothing hidden. */
export function readHiddenFacts(row: Partial<UserPrefs> | null | undefined): Set<FactId> {
  return readHideList(row?.task_facts, ALL_FACTS) as Set<FactId>
}

/** The hidden tabs of a stored row; unknown ids and other values read as nothing hidden. */
export function readHiddenTabs(row: Partial<UserPrefs> | null | undefined): Set<TaskTabId> {
  return readHideList(row?.task_tabs, TASK_TABS) as Set<TaskTabId>
}

/** Every fact and tab hidden: the Minimal task page (design D2). */
export function isMinimalTaskPage(row: Partial<UserPrefs> | null | undefined): boolean {
  return readHiddenFacts(row).size === ALL_FACTS.length && readHiddenTabs(row).size === TASK_TABS.length
}

/** Whether the group is entirely hidden; a partly hidden group reads as shown, so its switch turns it all off next. */
export function groupHidden(row: Partial<UserPrefs> | null | undefined, group: FactGroup): boolean {
  const hidden = readHiddenFacts(row)
  return FACT_GROUPS[group].every((id) => hidden.has(id))
}

/** Hides or shows one group of facts, rewriting `task_facts` from the row the settings page holds. */
export function writeFactGroup(row: Partial<UserPrefs> | null | undefined, group: FactGroup, hidden: boolean): Promise<void> {
  const next = readHiddenFacts(row)
  for (const id of FACT_GROUPS[group]) {
    if (hidden) next.add(id)
    else next.delete(id)
  }
  return mutate('user_prefs', USER_PREFS_ID, { task_facts: writeHideList(next, ALL_FACTS) })
}

/** Hides or shows one tab. */
export function writeTab(row: Partial<UserPrefs> | null | undefined, tab: TaskTabId, hidden: boolean): Promise<void> {
  const next = readHiddenTabs(row)
  if (hidden) next.add(tab)
  else next.delete(tab)
  return mutate('user_prefs', USER_PREFS_ID, { task_tabs: writeHideList(next, TASK_TABS) })
}

/** The Minimal preset: every fact and every tab hidden; `false` shows everything again. */
export function writeMinimalTaskPage(minimal: boolean): Promise<void> {
  return mutate('user_prefs', USER_PREFS_ID, {
    task_facts: minimal ? ALL_FACTS.join(',') : '',
    task_tabs: minimal ? TASK_TABS.join(',') : '',
  })
}

export interface TaskPagePrefs {
  hiddenFacts: ReadonlySet<FactId>
  hiddenTabs: ReadonlySet<TaskTabId>
  /** Schedule, Details and Where are all hidden, so the page can drop its facts column entirely (design D3). */
  factsEmpty: boolean
  tabsEmpty: boolean
}

const NOTHING_HIDDEN: TaskPagePrefs = {
  hiddenFacts: new Set(),
  hiddenTabs: new Set(),
  factsEmpty: false,
  tabsEmpty: false,
}

/** The groups the facts column draws (custom fields and subtasks are blocks of their own). */
const COLUMN_GROUPS: readonly FactGroup[] = ['schedule', 'details', 'labels', 'project']

/** The live pref for the task page, the panel and the settings switches; nothing hidden while loading. */
export function useTaskPagePrefs(): TaskPagePrefs {
  const row = useUserPrefsRow()
  return useMemo(() => {
    if (row === undefined) return NOTHING_HIDDEN
    const hiddenFacts = readHiddenFacts(row)
    const hiddenTabs = readHiddenTabs(row)
    const column = COLUMN_GROUPS.flatMap((g) => FACT_GROUPS[g])
    return {
      hiddenFacts,
      hiddenTabs,
      factsEmpty: column.every((id) => hiddenFacts.has(id)),
      tabsEmpty: TASK_TABS.every((id) => hiddenTabs.has(id)),
    }
  }, [row])
}
