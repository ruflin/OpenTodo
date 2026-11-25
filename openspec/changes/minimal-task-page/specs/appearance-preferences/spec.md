## ADDED Requirements

### Requirement: Hiding task page properties
The account SHALL have two settings, `task_facts` and `task_tabs`, each a comma-separated hide-list in the synced `user_prefs` row. An unknown id SHALL be ignored on read and kept in the stored value, and an empty, missing or unreadable value SHALL read as nothing hidden.

Settings → Appearance → Task details SHALL offer a **Task page** card with a **Show** choice, **Everything** or **Minimal**, and one switch for each group of facts (schedule, details, labels, project, custom fields, subtasks) and for each tab (comments, activity, history, time). **Minimal** SHALL hide every fact and every tab; **Everything** SHALL hide none. A switch SHALL show or hide its group's ids in one `user_prefs` write, offline included; on means shown.

The task page and the side panel SHALL NOT draw a hidden fact, a hidden fact group's heading when none of its facts is shown, a hidden custom-field or subtask block, or a hidden tab; with every fact of schedule, details, labels and project hidden they SHALL NOT draw the facts column, and with every tab hidden they SHALL NOT draw the tab bar. A device's stored tab that is hidden SHALL fall back to the first shown tab, and `Shift`+`C` SHALL need Comments. The phone's stacked facts card and **More properties** SHALL follow the same facts.

Hiding SHALL change no data: REST, the CLI, MCP, search, the export and the task's history SHALL keep every value.

#### Scenario: Minimal task page
- **WHEN** a person chooses **Minimal** and opens a task
- **THEN** the task shows its checkbox, title, notes and attachments, without the facts column, the subtasks, the custom fields or the tab bar

#### Scenario: One group hidden
- **WHEN** the person turns **Schedule** off and opens a task with a due date, a deadline and a repeat rule
- **THEN** the Schedule heading and its facts are gone, while Details, Labels and Project show as before

#### Scenario: A hidden tab
- **WHEN** **Comments** is off and the device's remembered tab is Comments
- **THEN** the bar shows Activity, History and Time, starting on Activity, and `Shift`+`C` does nothing

#### Scenario: Unknown ids from a newer client
- **WHEN** the stored `task_facts` is `deadline, from-the-future` and this client knows no `from-the-future`
- **THEN** only Deadline is hidden, and the row is not rewritten

#### Scenario: Nothing leaves the data
- **WHEN** a task's priority and deadline are hidden and a script reads the task over REST
- **THEN** both values are still there, and the export and the task's history still hold them
