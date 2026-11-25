// @vitest-environment happy-dom
// Joining via a project invite link waits for sync and switches workspace before
// opening the project, and TaskListView does not declare a project gone while
// sync is running or while the project sits in another workspace.
import 'fake-indexeddb/auto'
import { useSyncExternalStore } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { api } from '../lib/api'
import { db } from '../lib/db'
import { createProject, resetDeviceId } from '../lib/ops'
import type { ProjectInvitePreview, SyncState, User, Workspace, WorkspaceEntry } from '../lib/types'
import { readWorkspaceState, storeWorkspaces, switchTo } from '../lib/workspaces'
import { click, mockFetch, noPublicLinks, render, waitFor } from '../ui/test-utils'
import { ProjectInviteScreen } from './ProjectInviteScreen'
import { TaskListView } from './TaskListView'

const syncMock = vi.hoisted(() => {
  let state: SyncState = 'idle'
  const listeners = new Set<() => void>()
  let impl: () => Promise<void> = async () => {}
  return {
    getState: () => state,
    setState(next: SyncState) {
      state = next
      listeners.forEach((fn) => fn())
    },
    subscribe(fn: () => void) {
      listeners.add(fn)
      return () => { listeners.delete(fn) }
    },
    setImpl(fn: () => Promise<void>) { impl = fn },
    syncNow: () => impl(),
    reset() {
      state = 'idle'
      impl = async () => {}
    },
  }
})

vi.mock('../lib/sync', async (orig) => {
  const actual = await orig<typeof import('../lib/sync')>()
  return {
    ...actual,
    syncNow: () => syncMock.syncNow(),
    useSyncStatus: () => {
      const state = useSyncExternalStore(syncMock.subscribe, syncMock.getState)
      return { state, pending: 0, lastSyncedAt: null, error: null, live: false, rejected: null }
    },
  }
})

const user: User = { id: 'u2', email: 'bob@example.com', name: 'Bob', role: 'member', createdAt: 0 }
const preview: ProjectInvitePreview = {
  inviterName: 'Alice', projectName: 'Holiday', role: 'editor', email: null,
  expiresAt: Date.UTC(2026, 11, 1), canCreateAccount: false, alreadyMember: false,
}
const wsEntry = (id: string, extra: Partial<Workspace> = {}): WorkspaceEntry =>
  ({ id, name: id, icon: '', color: '', default: false, role: 'owner', ownerId: 'u2', members: [{ userId: 'u2', name: 'Bob', role: 'owner' }], groups: [], ...extra })

beforeEach(async () => {
  await db.delete()
  await db.open()
  resetDeviceId()
  syncMock.reset()
  mockFetch(noPublicLinks)
  history.replaceState(null, '', '/invite/p/otp_test')
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('ProjectInviteScreen join waits for sync and workspace', () => {
  it('waits for syncNow and switches to the joined project workspace before navigating', async () => {
    await storeWorkspaces([wsEntry('w-personal', { default: true, name: 'Personal' }), wsEntry('w-work', { name: 'Work' })])
    await switchTo('w-work')
    vi.spyOn(api, 'previewProjectInvite').mockResolvedValue(preview)
    vi.spyOn(api, 'acceptProjectInvite').mockResolvedValue({ projectId: 'p-holiday', role: 'editor' })

    let finishSync!: () => void
    syncMock.setImpl(() => new Promise<void>((resolve) => {
      finishSync = async () => {
        await db.projects.put({
          id: 'p-holiday', name: 'Holiday', color: '#3b82f6', icon: null, parent_id: null,
          workspace_id: null, position: 1000, archived: false, deleted_at: null, created_at: 0, _clock: {},
        })
        resolve()
      }
    }))

    const r = await render(<ProjectInviteScreen token="otp_test" user={user} status={null} onAuthenticated={() => {}} onLogout={() => {}} />)
    await waitFor(() => r.container.textContent!.includes('Join project'))
    await click([...r.container.querySelectorAll('button')].find((b) => b.textContent === 'Join project')!)

    await waitFor(() => r.container.textContent!.includes('Joining…'))
    expect(location.pathname).toBe('/invite/p/otp_test')

    finishSync()
    await waitFor(() => location.pathname === '/project/p-holiday')
    expect((await readWorkspaceState()).current).toBe('w-personal')
    await r.unmount()
  })
})

describe('TaskListView project availability checks', () => {
  it('waits while sync is running instead of showing missing-project, then renders once synced', async () => {
    await createProject({ name: 'Existing' })
    syncMock.setState('syncing')
    const r = await render(<TaskListView userId={user.id} userRole={user.role} route={{ view: 'project', id: 'p-new' }} />)
    await waitFor(() => !!r.container.querySelector('[data-list-loading]'), 'loading state while sync is running')
    expect(r.container.textContent).not.toContain('This project no longer exists.')

    await db.projects.put({
      id: 'p-new', name: 'Holiday', color: '#3b82f6', icon: null, parent_id: null,
      workspace_id: null, position: 2000, archived: false, deleted_at: null, created_at: 0, _clock: {},
    })
    syncMock.setState('idle')
    await waitFor(() => r.container.textContent!.includes('Holiday'))
    await r.unmount()
  })

  it('does not show missing-project while the project exists in another workspace', async () => {
    await storeWorkspaces([wsEntry('w-personal', { default: true, name: 'Personal' }), wsEntry('w-work', { name: 'Work' })])
    await switchTo('w-work')
    await createProject({ name: 'Work project' })
    await db.projects.put({
      id: 'p-personal', name: 'Holiday', color: '#3b82f6', icon: null, parent_id: null,
      workspace_id: null, position: 2000, archived: false, deleted_at: null, created_at: 0, _clock: {},
    })

    const r = await render(<TaskListView userId={user.id} userRole={user.role} route={{ view: 'project', id: 'p-personal' }} />)
    await waitFor(() => !!r.container.querySelector('[data-list-loading]'), 'loading state while project is in another workspace')
    expect(r.container.textContent).not.toContain('This project no longer exists.')
    await r.unmount()
  })

  it('shows missing-project when sync is idle and the project is not in any workspace', async () => {
    await createProject({ name: 'Existing' })
    const r = await render(<TaskListView userId={user.id} userRole={user.role} route={{ view: 'project', id: 'p-gone' }} />)
    await waitFor(() => r.container.textContent!.includes('This project no longer exists.'))
    await r.unmount()
  })
})
