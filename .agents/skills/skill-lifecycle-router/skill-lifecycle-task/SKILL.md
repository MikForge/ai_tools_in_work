---
name: skill-lifecycle-task
description: Lifecycle sub-skill — execute plan steps and produce skill artifacts. Internal, invoked by skill-lifecycle-router.
disable-model-invocation: true
---

# Skill Lifecycle — Task

## Overview

Execute the implementation plan step by step, producing the target skill's SKILL.md and related files. Each plan step maps to a concrete output.

**Core principle:** Execute the plan, produce the skill artifacts.

## Entry Condition

Plan doc must exist. Router checks this before forwarding. If missing, return to plan stage.

## Process

1. Read the plan doc produced by the plan stage
2. Execute each plan step in order
3. Produce artifacts: SKILL.md, zh-CN.md, scripts, templates as defined by the plan
4. Commit after each completed step (frequent commits)
5. Run self-check before declaring completion

## Self-Check

- [ ] Every plan step has corresponding output
- [ ] No skipped or partially completed steps
- [ ] All produced files exist at their specified paths

## Output

Append the self-check declaration at the end of the last produced artifact:

```markdown
## Self-Check
- [x] All plan steps executed
- [x] All files produced at specified paths
- [x] No skipped steps
```

## Reference

Draw methodology from `executing-plans` skill — step-by-step execution, frequent commits.
