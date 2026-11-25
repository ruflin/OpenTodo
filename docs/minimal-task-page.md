---
title: A smaller task page
summary: Hide the facts and tabs you do not use, so a task is just its title, notes and attachments.
audience: user
section: Guides
specs: [appearance-preferences]
screens: []
order: 12
---
# A smaller task page

<picture><source srcset="images/task-detail-dark.webp" media="(prefers-color-scheme: dark)"><img src="images/task-detail-light.webp" alt="A task's page with its facts hidden: the title, the notes and the attachments, and no side column or tabs."></picture>

A task page shows its properties beside the notes and four tabs below them. If you use tasks as to-dos with a note and attachments, most of that is in the way: empty facts read as actions ("Set a deadline", "Add a place") and the tabs are always there.

**Settings → Appearance → Task details** has a **Task page** card. Its **Show** choice is **Everything** (the default) or **Minimal**; **Everything** shows all again.

## What Minimal hides

**Minimal** hides every fact, the custom fields and the subtasks, and the Comments, Activity, History and Time tabs. A task keeps its checkbox, title, notes, attachments and menu.

## Turn groups off

Below the preset, a switch per group turns just that group off, on the page and in the side panel:

- **Schedule**: Do, start, deadline, reminder, repeat and time sector.
- **Details**: priority, estimate, energy, assignee, blockers and location.
- **Labels** and **Project**: the labels, the project, its section, the parent task and the origin.
- **Custom fields** and **Subtasks**: the two blocks below the notes.
- **Comments**, **Activity**, **History** and **Time**: the tabs.

With every tab hidden the bar is gone. With Comments hidden, <kbd>Shift</kbd>+<kbd>C</kbd> does nothing.

## What it changes

On a phone the same switches decide the facts card and **More properties**.

Hiding is a display choice on your account, synced to every device and kept offline. It changes no task: the API, the CLI, MCP, search, the export and the task's history keep every value, and a fact or tab a later release adds shows until you hide it.

Turning everything back on takes one step: choose **Everything**. A group's switch turns off only what that group showed.
