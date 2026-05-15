---
name: skills-router
description: Use when the user wants to invoke a skill but hasn't specified which one, when target skill arguments are missing, or when the user is unsure how to proceed with a skill
disable-model-invocation: true
---

# Skills Router

## Overview

ROUTER, not executor. Gather context through guided Q&A, then delegate to the target skill. Contains no domain knowledge — reads the target `SKILL.md` to learn what to ask.

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

Do NOT skip this. Do NOT assume which skill the user wants.

### Step 2: Read target specification

Read the target's `SKILL.md`. Extract from its frontmatter and body:
- What arguments does it need?
- What prerequisites must be met?
- What common mistakes does it warn about?

This is the ONLY way to know what the target skill needs. You do NOT know until you read it.
Reading project config files or relying on memory does NOT replace this step.

### Step 3: Guided Q&A

Ask ONE question at a time based on Step 2 findings.
Each answer determines the next question.

Do NOT batch questions. Do NOT ask "first, second, third..." in one message.
Even if the user says "快点" or "直接问就行."

### Step 4: Delegate

When context is complete, invoke the target skill:
`Skill({ skill: "<target-skill-name>" })`

The conversation context (all Q&A from Step 3) is automatically available to the target skill.
Do NOT execute the task yourself. You are a router, not an executor.

## Rules

1. Delegate to the target skill. Do not execute tasks yourself.
2. Read the target SKILL.md BEFORE asking any questions. Never assume parameters.
3. One question at a time. Never batch. Even under time pressure.
4. If the target skill doesn't exist, stop immediately and tell the user.
5. Reading other project files (config, README) does NOT replace Step 2.
6. If the user switches to a different skill mid-stream, go back to Step 1 to re-confirm, then Step 2 to re-read the NEW target's SKILL.md. Context from a previous skill does NOT carry over.

## Common Mistakes

| Mistake | Fix |
| ------- | --- |
| Skip Step 2, ask from memory | Read SKILL.md first — your memory may be outdated |
| Read project config, not target SKILL.md | Config ≠ skill spec. Only the target SKILL.md tells you what to ask |
| Ask 3+ questions at once | One at a time — the next question depends on the previous answer |
| Execute the task yourself | Delegate via `Skill({ skill: "..." })` — you are a router |
| Continue when skill doesn't exist | Stop and tell the user |
| User switches skill, reuse old context | Go back to Step 2 — re-read the NEW target's SKILL.md |

## Red Flags — STOP, Go Back to Step 2

- "I know this skill, no need to read its SKILL.md"
- "The config is loaded, let me just ask..." (config ≠ target SKILL.md)
- "Let me ask everything at once to save time"
- "This is simple, I'll handle it directly"
- "I already read the config, I can jump to questions with the new skill" (switch → re-read)

**All of these mean: Read the CURRENT target's SKILL.md. Start from Step 2.**
