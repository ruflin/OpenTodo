# Design: hiding a task's properties

## D1. Two hide-lists in the prefs row

`user_prefs.task_facts` and `user_prefs.task_tabs` are comma-separated ids, like `calendars_hidden` and `sidebar_destinations`: unknown ids are ignored on read and kept in the row, and an empty, missing or unreadable value reads as nothing hidden. A hide-list, not a show-list, so a fact or a tab added in a later release appears without a migration or a rewritten pref. Both are settings, never content: not encrypted, no activity event.

Fact ids are the ones the page and the panel already carry (`data-fact`): `due`, `sector`, `when`, `deadline`, `reminders`, `repeat`, `priority`, `estimate`, `energy`, `assignee`, `blocked-by`, `blocks`, `location`, `labels`, `project`, `section`, `parent`, `origin`, plus the two blocks `fields` and `subtasks`. Tab ids are `comments`, `activity`, `history`, `time`.

## D2. Preset and switches

The settings card offers **Show: Everything / Minimal**. Minimal writes every fact id and every tab id in one op per field; Everything writes both back to `""`. Below it, one switch per group (on = shown) writes or clears that group's ids, so a partly hidden group reads as off and its switch hides the rest of it first. The switches and the preset always agree with the row, because both are derived from it.

## D3. One pref, three surfaces

The task page (`TaskFacts`, `TaskPageView`), the side panel (`Facets`, `TaskDetail`) and the phone's stacked facts card read `useTaskPagePrefs()`. A hidden fact is not drawn; a group whose facts are all hidden drops its heading; when schedule, details, labels and project are all hidden the page does not draw the facts column (the grid keeps its content column); with every tab hidden `ConversationTabs` renders nothing, and a stored device tab that is now hidden falls back to the first visible one. `Shift`+`C` does nothing while Comments is hidden.

A hidden fact can still be reached by a keyboard shortcut that opens its editor; the editor is then not drawn. That is deliberate: shortcuts edit data, and the switch is a display choice, so nothing needs to be forbidden — it is simply out of sight until shown again. No data path checks the pref.

## D4. No server behaviour

The server stores and serves the two fields like every other pref. No route, limit, audit event, encryption rule or MCP tool changes; hiding is a client rendering choice, and the values remain in REST, the CLI, MCP, search and the export.
