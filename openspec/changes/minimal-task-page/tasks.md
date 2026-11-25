## 1. Data and pref

- [x] 1.1 `internal/sync/ops.go`: `task_facts` and `task_tabs` in the prefs row, a hide-list each; regenerate `web/src/generated/opSchema.ts` and the schema fixture with `UPDATE_OP_SCHEMA=1 go test ./internal/sync -run TestGeneratedOpSchema`
- [x] 1.2 `web/src/lib/taskPagePrefs.ts`: read, write and the Minimal preset; unknown ids ignored and kept, empty as nothing hidden (vitest `taskPagePrefs.test.ts`)

## 2. Task page and panel

- [x] 2.1 `TaskFacts`: hidden facts and the labels group are not drawn; a group with no visible fact drops its heading; the stacked card's **More properties** follows the same list
- [x] 2.2 `Facets`: hidden parts are not drawn, the Add menu offers only shown properties, and the rotation and location lines follow their facts
- [x] 2.3 `TaskPageView` and `TaskDetail`: the facts column, custom fields and subtasks blocks can each be hidden
- [x] 2.4 `ConversationTabs`: hidden tabs leave the bar, a hidden stored tab falls back to the first shown, all hidden renders nothing, `Shift`+`C` needs Comments

## 3. Settings

- [x] 3.1 The **Task page** card in Appearance → Task details: the **Show** preset and one switch per group and tab (on = shown), each one `user_prefs` op through ops

## 4. Docs and check

- [x] 4.1 `docs/task-panel.md` ("Show fewer properties") and `docs/settings-you.md`
- [x] 4.2 Changelog fragment `changelog.d/Added/minimal-task-page.md`
- [ ] 4.3 `npm test` and `npm run build` in `web/`, `make check`
