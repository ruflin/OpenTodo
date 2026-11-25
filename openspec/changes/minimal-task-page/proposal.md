# Hide the task properties you do not use

## Why

The task page and the side panel always show Schedule, Details, Labels and Project, plus the Comments, Activity, History and Time tabs, the custom fields and the subtasks. A person who treats tasks as to-dos with a note and attachments has no way to remove the rest: the empty facts read as actions ("Set a deadline", "Add a place") and the tabs stay, so every task is wider and busier than the thing it is.

The existing switches hide neighbouring surfaces (Habits, Energy, Time sectors, the Formatting button), but nothing hides a property of the task itself.

## What Changes

- Two additive `user_prefs` fields, `task_facts` and `task_tabs`, both **hide-lists**: comma-separated ids, unknown ids ignored and kept, empty or unreadable as nothing hidden. A fact or tab a later release adds therefore shows until it is hidden.
- **Settings → Appearance → Task details** gains a **Task page** card: a **Show** preset (**Everything** / **Minimal**) and one switch per group (schedule, details, labels, project, custom fields, subtasks) and per tab (comments, activity, history, time).
- The task page and the side panel read the same pref: hidden facts are not drawn, a hidden group drops its heading, hidden tabs leave the bar, and with every fact hidden the facts column is not drawn at all. The phone's stacked card and **More properties** follow the same lists.
- A hidden fact's editor is not drawn; adding it again is the settings switch (or **Everything**). Hiding changes no data: REST, the CLI, MCP, the export, search and the task's history keep every value, and the ops are ordinary `user_prefs` writes, offline-safe and last-writer-wins per field.

No new route, error code, op entity, dependency or mandatory environment variable.

## Out of scope

- Hiding properties on the list rows (the row layout and Display options already do that).
- Per-project or per-view choices: the pref is per account, like the other Appearance choices.
- Hiding the title, the checkbox, the notes, the attachments or the task's menu: they are what a task is.
- Hiding the same fields from REST, the CLI, MCP or the export.

ROADMAP.md: none (an interface refinement).

## Capabilities

### Modified Capabilities

- `appearance-preferences`: the task page's facts and tabs can be hidden per account, from a Minimal preset to one group at a time, without changing any data.
