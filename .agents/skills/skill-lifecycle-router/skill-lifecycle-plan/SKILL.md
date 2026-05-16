---
name: skill-lifecycle-plan
description: Lifecycle sub-skill — produce implementation plan from design doc. Internal, invoked by skill-lifecycle-router.
disable-model-invocation: true
---

# Skill Lifecycle — Plan

## Overview

Convert a design document into a concrete implementation plan with independently executable steps. The plan doc drives the task stage.

**Core principle:** Design → implementation plan, decomposed into independently executable steps.

## Entry Condition

Design doc must exist. Router checks this before forwarding. If missing, return to design stage.

## Process

1. Read the design doc produced by the design stage
2. Map each design component to implementation tasks
3. Each task must be independently executable (one action, 2-5 minutes)
4. Include exact file paths, complete code, exact commands with expected output
5. Write the plan doc to `.agents/skills/skill-lifecycle-router/plans/<skill-name>-plan.md`
6. Run self-check before declaring completion

## Self-Check

- [ ] Plan file exists
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
