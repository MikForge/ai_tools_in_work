---
name: skills-router
description: Use when the user wants to invoke a skill but hasn't specified which one, when target skill arguments are missing, or when the user is unsure how to proceed with a skill
disable-model-invocation: true
---

# Skills Router

## Overview

ROUTER, not executor. Gather context through guided Q&A, then delegate to the target skill. Contains no domain knowledge — reads the target `SKILL.md`, or a verified-fresh `references/<target-skill>/context.md`, to learn what to ask.

## When to Use

- User wants to use a skill but hasn't specified which one
- Target skill requires arguments the user hasn't provided
- User says "I want to do X" but is unsure how to proceed
- Multiple skills might apply and need narrowing

Do NOT use when:

- User already provided complete context and target skill name
- User invoked a specific skill via `/skill-name`

## Workflow

### Step 1: Identify target skill

List available skills with their descriptions. Ask the user which one to invoke.
If the user already named one ("I want to use X"), confirm it.

**After confirmation, verify the target skill exists:** check whether
`.agents/skills/<target-skill>/SKILL.md` exists. If it does not, stop
immediately and tell the user the target skill does not exist. Do NOT continue
to Step 2.

Do NOT skip this. Do NOT assume which skill the user wants.

### Step 2: Read target specification

**First, run the staleness checker:**

```bash
bash .agents/skills/01-skills-router/scripts/check-reference-staleness.sh
```

**Then interpret the output using the decision table below.**

The script may output per-skill status lines or a summary message. Match the
output for your target skill to the corresponding action.

| Script output for target skill | Action |
| --- | --- |
| `FRESH <skill> ...` | Use the existing `references/<target-skill>/context.md`. Extract required inputs, prerequisites, routing prompts, common mistakes, and previous feedback. |
| `STALE <skill> ...` | Read the target `SKILL.md` directly. The context file is outdated and needs refresh. |
| `MISSING_CONTEXT <skill> ...` | Read the target `SKILL.md` directly. No context file exists yet — needs creation. |
| `MISSING_TARGET <skill> ...` | Stop immediately and tell the user. The target skill directory no longer exists. Do NOT create router context for a missing target. |
| `INVALID <skill> ...` or `INVALID_CONTEXT <skill> ...` | Read the target `SKILL.md` directly. The context file or freshness row is malformed and needs repair. |
| `No router freshness rows found.` | The freshness table contains no entries at all — the target skill has never been routed before. Read the target `SKILL.md` directly. |
| Script fails to execute (missing file, no permissions, crash) | Read the target `SKILL.md` directly. Skip context caching for this routing session; report the script failure so the user can investigate. In this case, proceed to Step 3 using only `SKILL.md`. |

**When the action is "read the target SKILL.md directly" (all rows except FRESH and MISSING_TARGET):**

Creating or refreshing the context file is an **immediate Step 2 action**, not a
later TODO — unless the script itself failed to execute. Before asking the first
routing question, create or update `references/<target-skill>/context.md`
(creating parent directories if needed). Keep it router-only:

- required user inputs and missing arguments
- prerequisites or gates the router must confirm
- one-question-at-a-time routing prompts or decision points
- common mistakes and feedback from previous routing

After creating or updating context.md, update or add the target skill row in
`references/freshness.md` with the target skill directory's latest mtime and
current sync time. Re-run the staleness checker. If it reports `FRESH`, use the
refreshed context. If it still reports a problem, continue this routing from the
target `SKILL.md` and leave the reference marked for repair.

The target skill directory remains authoritative. Router context files are
derived caches and feedback records; they are usable only after freshness
validation.

Keep freshness metadata out of `context.md`; all freshness records belong in
`references/freshness.md`.

Reading project config files or relying on memory does NOT replace this step.

### Step 3: Guided Q&A

Based on Step 2 findings, collect any missing parameters from the user.

Ask ONE question at a time. Each answer determines the next question.

**Exception — skip Q&A:** If the user has already provided all required
parameters in the conversation so far (target skill name, file paths, role
titles — everything the target skill needs), proceed directly to Step 4.

Do NOT batch questions. Do NOT ask "first, second, third..." in one message.
Even if the user says "快点" or "直接问就行."

**Interruption — abandoning or switching mid-stream:**

- **Abandoning** ("算了", "不搞了", "cancel"): stop immediately. Leave
  partially-generated files as-is; the next routing of the same skill will
  refresh them.
- **Switching to a different skill**: go back to Step 1 to re-confirm the new
  target, then Step 2 to read the new target's `SKILL.md`. Context from a
  previous skill does NOT carry over.

### Step 4: Delegate

When context is complete, load the target skill using the skill-loading
mechanism of your runtime:

- **DeepSeek TUI:** `load_skill({ name: "<target-skill-name>" })`
- **Claude Code:** `Skill({ skill: "<target-skill-name>" })`

The conversation context (all Q&A from Step 3) is automatically available to
the target skill.

Do NOT execute the task yourself. You are a router, not an executor.

## Rules

1. Delegate to the target skill. Do not execute tasks yourself.
2. Before asking questions, read the target SKILL.md or a verified-fresh
   `context.md`. Never assume parameters.
3. One question at a time, unless the user already provided all required
   parameters in prior conversation. Never batch. Even under time pressure.
4. If the target skill doesn't exist, stop immediately and tell the user.
5. Reading other project files (config, README) does NOT replace Step 2.
6. If the user switches to a different skill mid-stream, go back to Step 1 to
   re-confirm, then Step 2 to re-read the NEW target's `SKILL.md`. Context from
   a previous skill does NOT carry over.
7. If the staleness-checker script fails to execute, fall back to reading
   `SKILL.md` directly and skip context caching.

## Common Mistakes

| Mistake | Fix |
| ------- | --- |
| Skip Step 2, ask from memory | Read SKILL.md or a fresh context file first — your memory may be outdated |
| Put freshness metadata in context.md | Keep `context.md` context-only; update `references/freshness.md` instead |
| Use a stale context file | Run the staleness check; stale context must be refreshed from target SKILL.md |
| Treat `needs refresh` as a later TODO | Refresh the context and freshness row during Step 2 before asking the first question |
| Treat `MISSING_TARGET` as refreshable | Stop and tell the user the target skill does not exist |
| Read project config, not target spec | Config ≠ skill spec. Only target SKILL.md or a fresh context file tells you what to ask |
| Ask 3+ questions at once | One at a time — the next question depends on the previous answer |
| Execute the task yourself | Delegate via `load_skill({ name: "..." })` or `Skill({ skill: "..." })` — you are a router |
| Continue when skill doesn't exist | Stop and tell the user |
| User switches skill, reuse old context | Go back to Step 2 — re-read the NEW target's SKILL.md |

## Red Flags — STOP, Go Back to Step 2

- "I know this skill, no need to read its SKILL.md"
- "The context file exists, no need to check whether it is stale"
- "I'll put last_synced_mtime in context.md so it is easier"
- "The config is loaded, let me just ask..." (config ≠ target SKILL.md)
- "Let me ask everything at once to save time"
- "This is simple, I'll handle it directly"
- "I already read the config, I can jump to questions with the new skill" (switch → re-read)

**All of these mean: Validate the CURRENT target context or read the target SKILL.md. Start from Step 2.**