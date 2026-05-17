---
name: skill-lifecycle-task
description: Lifecycle sub-skill — execute plan steps and produce skill artifacts. Internal, invoked by skill-lifecycle-router.
disable-model-invocation: true
---

# Skill Lifecycle — Task

## Overview

Execute the implementation plan step by step, producing the target skill's SKILL.md and related files. Each plan step maps to a concrete output.

**Core principle:** Execute the plan, produce the skill artifacts.

## Path Contract

This sub-skill is executed by the root router. It inherits:

- `ROUTER_SKILL_DIR`: absolute path to the root `skill-lifecycle-router` package directory.
- `TARGET_WORKSPACE`: absolute path to the workspace where lifecycle artifacts live.
- `TARGET_SKILL_DIR`: absolute path to the skill being created or modified, when applicable.

Do not resolve router-owned files from the current working directory. Do not use parent-relative docs paths for router-owned files or lifecycle artifacts.

## Entry Condition

Plan doc must exist. Router checks this before forwarding. If missing, return to plan stage.

## Process

1. Read the plan doc from `TARGET_WORKSPACE/docs/plans/<skill-name>-plan.md`
2. Execute each plan step in order
3. Produce artifacts under `TARGET_SKILL_DIR`: SKILL.md, zh-CN.md, scripts, templates as defined by the plan
4. Commit after each completed step (frequent commits)
5. Run self-check before declaring completion

## Self-Check

- [ ] Every plan step has corresponding output
- [ ] No skipped or partially completed steps
- [ ] All produced files exist under `TARGET_SKILL_DIR` at their specified paths

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
