---
name: skill-lifecycle-review
description: Lifecycle sub-skill — structured artifact review with mode consistency check. Internal, invoked by skill-lifecycle-router.
disable-model-invocation: true
---

# Skill Lifecycle — Review

## Overview

Structured review of lifecycle artifacts (design doc, plan doc, task output, test report). Reads the appropriate constraint checklist from `constraints/` based on artifact type. Each finding is categorized by severity and routed back to the correct stage via the feedback loop.

**Core principle:** Review the artifact, not the author. Check correctness AND pattern consistency. Issues flow back through feedback.

## Entry Condition

Target artifact must exist. User specifies which stage's artifact to review. Router checks file existence before forwarding.

## Process

1. Ask user which artifact to review (design / plan / task / test)
2. Read the corresponding constraint file from `constraints/`:
   - `design-constraints.md` for design doc
   - `plan-constraints.md` for plan doc
   - `task-constraints.md` for task output
   - `test-constraints.md` for test report
3. Read the target artifact
4. For each checklist item, determine: pass or issue found
5. For each issue, record:
   - Severity: Critical (broken/bug/security) / Important (missing/wrong/poor) / Minor (style/nitpick)
   - 回流目标阶段: design / plan / task / test
   - 文件位置: path:line
   - 问题描述: what's wrong and why it matters
6. Include mode consistency check: does this artifact follow established project patterns? Any new structural patterns introduced?
7. Write review report to `.agents/skills/skill-lifecycle-router/notes/<skill-name>-review.md`

## Review Report Format

```markdown
# Review Report: <skill-name>

**Artifact reviewed:** <path>
**Constraint checklist:** constraints/<stage>-constraints.md

## Strengths
[What's well done? Be specific.]

## Issues

### <Issue Title>
- **严重度:** Critical | Important | Minor
- **回流目标阶段:** design | plan | task | test
- **文件:** <path:line>
- **问题:** <description>
- **影响:** <impact>

## Mode Consistency
[Pattern consistency check result. Any new structural patterns? Do they align with project conventions?]

## Assessment
[Overall readiness. If zero Critical + zero Important → automatic pass.]
```

## Self-Check

- [ ] 审查报告存在
- [ ] 每条发现标注了严重度和回流目标阶段
- [ ] 包含模式一致性检查结论
- [ ] 给出明确的整体评估

## Output

Review report ends with the self-check declaration:

```markdown
## Self-Check
- [x] 审查报告存在
- [x] 每条发现标注了严重度和回流目标阶段
- [x] 包含模式一致性检查结论
- [x] 整体评估明确
```
