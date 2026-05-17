---
name: skill-lifecycle-plan
description: Lifecycle sub-skill — produce implementation plan from design doc. Internal, invoked by skill-lifecycle-router.
disable-model-invocation: true
---

# Skill Lifecycle — Plan

## Overview

Convert a design document into a concrete implementation plan with independently executable steps. The plan doc drives the task stage.

**Core principle:** Design → implementation plan, decomposed into independently executable steps.

## Path Contract

This sub-skill is executed by the root router. It inherits:

- `ROUTER_SKILL_DIR`: absolute path to the root `skill-lifecycle-router` package directory.
- `TARGET_WORKSPACE`: absolute path to the workspace where lifecycle artifacts live.
- `TARGET_SKILL_DIR`: absolute path to the skill being created or modified, when applicable.

Do not resolve router-owned files from the current working directory. Do not use parent-relative docs paths for router-owned files or lifecycle artifacts.

## Entry Condition

Design doc must exist. Router checks this before forwarding. If missing, return to design stage.

## Process

1. Read the design doc from `TARGET_WORKSPACE/docs/specs/<skill-name>-design.md`
2. Map each design component to implementation tasks
3. Each task must be independently executable (one action, 2-5 minutes)
4. Include exact file paths, complete code, exact commands with expected output
5. Write the plan doc to `TARGET_WORKSPACE/docs/plans/<skill-name>-plan.md`
6. Run self-check before declaring completion

## Self-Check

- [ ] Plan file exists at `TARGET_WORKSPACE/docs/plans/<skill-name>-plan.md`
- [ ] Each step is independently verifiable — no forward references, no "similar to Task N"
- [ ] No "TBD" or "TODO" placeholders

## Output

Append the self-check declaration at the end of the plan doc:

```markdown
## Self-Check
- [x] Plan file exists
- [x] Each step independently verifiable
- [x] No "TBD" / "TODO" placeholders
```

## Reference

Draw methodology from `writing-plans` skill — task granularity, no placeholders, exact paths.
