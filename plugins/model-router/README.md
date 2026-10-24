# Model Router

Picks a model for each prompt by task type, with Haiku labelling the prompt first.

| Label | Model | For |
| --- | --- | --- |
| simple | haiku | renaming files, simple classification, short summaries |
| general | sonnet | ordinary code changes, writing documents |
| complex | opus | design work, analysis across connected files |

- A manual `/model` choice wins: routing pauses until `/route on`.
- `/route on`, `/route off`, `/route status` (or `/route`). On/off is remembered across sessions.
- The status line shows the pick, the reason, and the model that actually answered (`실제: ...`).
- A short follow-up (under 15 characters, like "계속해") keeps the previous pick.
- If the picked model's request fails before anything streams, it is sent again on the session's own model.
- Subagents are not routed.

Costs: each new prompt adds one small Haiku call for the label, and switching models between prompts means the new model does not reuse the previous model's prompt cache. Whether this saves money depends on your work; compare before relying on it.

Install: `/plugin install model-router --marketplace nefirim96/claude-code-mods-kit` (Claude Code 2.1.308 or later).

Run it without installing: `claude --plugin-dir <this folder>`. Tests: `claude plugin test <this folder>`.
