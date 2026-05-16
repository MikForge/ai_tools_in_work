---
name: skill-lifecycle-design
description: Lifecycle sub-skill — produce design doc for a skill. Internal, invoked by skill-lifecycle-router.
disable-model-invocation: true
---

# Skill Lifecycle — Design

## Overview

Produce a design document that defines what to build, its boundaries, and scope. The design doc is the authoritative reference for all downstream stages (plan, task, test, review).

**Core principle:** Determine whether to build, define boundaries and scope, then produce the design document.

## Process

1. Read relevant specifications or references to understand the problem domain and existing patterns
2. Clarify the problem: what problem does this skill solve? What happens without it?
3. Define scope: what is IN and what is OUT. List non-goals explicitly.
4. Design the approach: architecture, components, data flow, error handling
5. Write the design doc to `.agents/skills/skill-lifecycle-router/specs/<skill-name>-design.md`
6. Run self-check before declaring completion

## Self-Check

Before declaring done, verify:
- [ ] Design document exists at the specified path
- [ ] No "TBD" or "TODO" placeholders
- [ ] No contradictory assertions (saying X in one section, not-X in another)

## Output

Append the self-check declaration at the end of the design doc:

```markdown
## Self-Check
- [x] Design document exists
- [x] No "TBD" / "TODO" placeholders
- [x] No contradictory assertions
```

## Reference

Draw methodology from `brainstorming` and `writing-skills` skills — but produce output in this lifecycle's format, not their format.
