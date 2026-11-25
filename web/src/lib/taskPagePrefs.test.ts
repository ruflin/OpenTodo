// Task page display preferences (OpenSpec change minimal-task-page): the two
// synced hide-lists, their unknown-value handling and the writes that keep them
// canonical. The page and panel components read the same functions.
// @vitest-environment happy-dom
import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import { db } from './db'
import { resetDeviceId } from './ops'
import { ALL_FACTS, FACT_GROUPS, groupHidden, isMinimalTaskPage, readHiddenFacts, readHiddenTabs, TASK_TABS, writeFactGroup, writeMinimalTaskPage, writeTab } from './taskPagePrefs'

beforeEach(async () => {
  await db.delete()
  await db.open()
  resetDeviceId()
})

describe('readHiddenFacts and readHiddenTabs', () => {
  it('read nothing hidden from an empty row, an empty string or garbage, without writing', async () => {
    expect([...readHiddenFacts(null)]).toEqual([])
    expect([...readHiddenFacts({} as never)]).toEqual([])
    expect([...readHiddenFacts({ task_facts: '' } as never)]).toEqual([])
    expect([...readHiddenFacts({ task_facts: 7 } as never)]).toEqual([])
    expect([...readHiddenTabs({ task_tabs: ' , ,' } as never)]).toEqual([])
    expect(await db.outbox.count()).toBe(0)
  })

  it('keep known ids and drop unknown ones from a newer client', () => {
    expect([...readHiddenFacts({ task_facts: 'deadline, bogus, comments, subtasks' } as never)]).toEqual(['deadline', 'subtasks'])
    expect([...readHiddenTabs({ task_tabs: 'time, bogus, comments' } as never)]).toEqual(['comments', 'time'])
  })
})

describe('the writes', () => {
  it('hide and show a whole group as one op, in the canonical order', async () => {
    await writeFactGroup({}, 'schedule', true)
    let ops = await db.outbox.toArray()
    expect(ops.map((o) => [o.entity, o.entityId, o.field, o.value])).toEqual([
      ['user_prefs', 'me', 'task_facts', FACT_GROUPS.schedule.join(',')],
    ])

    await writeFactGroup({ task_facts: ALL_FACTS.join(',') } as never, 'schedule', false)
    ops = await db.outbox.toArray()
    expect(ops.at(-1)!.value).toBe(ALL_FACTS.filter((id) => !(FACT_GROUPS.schedule as readonly string[]).includes(id)).join(','))
  })

  it('hide and show one tab without touching the others', async () => {
    await writeTab({ task_tabs: 'activity' } as never, 'comments', true)
    const ops = await db.outbox.toArray()
    expect(ops.at(-1)!.value).toBe('comments,activity')
    expect(ops.at(-1)!.field).toBe('task_tabs')
  })

  it('the Minimal preset hides every fact and tab in one op per field, and shows them all again', async () => {
    await writeMinimalTaskPage(true)
    const ops = await db.outbox.toArray()
    expect(ops.map((o) => [o.field, o.value])).toEqual([
      ['task_facts', ALL_FACTS.join(',')],
      ['task_tabs', TASK_TABS.join(',')],
    ])
    expect(isMinimalTaskPage({ task_facts: ALL_FACTS.join(','), task_tabs: TASK_TABS.join(',') } as never)).toBe(true)

    await writeMinimalTaskPage(false)
    const back = await db.outbox.toArray()
    expect(back.slice(-2).map((o) => o.value)).toEqual(['', ''])
  })
})

describe('groupHidden', () => {
  it('is true only when every fact of the group is hidden', () => {
    const [first, ...rest] = FACT_GROUPS.details
    expect(groupHidden({ task_facts: first } as never, 'details')).toBe(false)
    expect(groupHidden({ task_facts: [first, ...rest].join(',') } as never, 'details')).toBe(true)
  })
})
