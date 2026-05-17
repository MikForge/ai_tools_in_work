---
name: skill-lifecycle-feedback
description: Lifecycle sub-skill — record issues with severity and reflux routing. Internal, invoked by skill-lifecycle-router (user-selectable or auto-triggered by review/test).
disable-model-invocation: true
---

# Skill Lifecycle — Feedback

## Overview

Record issues found during review or test, annotate severity and target reflux stage, and trigger repair loops. Two entry paths: user selecting "feedback" stage, or router auto-triggering after review/test finds issues.

**Core principle:** Feedback is the signal router — it routes issues back to the correct stage for repair, not a dumping ground for complaints.

## Path Contract

This sub-skill is executed by the root router. It inherits:

- `ROUTER_SKILL_DIR`: absolute path to the root `skill-lifecycle-router` package directory.
- `TARGET_WORKSPACE`: absolute path to the workspace where lifecycle artifacts live.
- `TARGET_SKILL_DIR`: absolute path to the skill being created or modified, when applicable.

Do not resolve router-owned files from the current working directory. Do not use parent-relative docs paths for router-owned files or lifecycle artifacts.

## Entry

- **User-initiated:** User selects feedback stage in router. Router asks: "For which skill? About which stage? What's the issue?"
- **Auto-triggered:** Router detects non-empty Issues section in review/test report → invokes feedback to generate structured feedback note.

## Process

### User-Initiated
1. Router asks which skill this feedback is for
2. Router asks which stage the issue targets (design / plan / task / test)
3. User describes the issue
4. Router assigns severity (Critical / Important / Minor) based on user description
5. Write feedback note to `TARGET_WORKSPACE/docs/notes/<skill-name>-feedback.md`

### Auto-Triggered
1. Router passes review/test report to feedback sub-skill
2. Extract each issue from the report's Issues section
3. Format each issue per `ROUTER_SKILL_DIR/docs/constraints/feedback-note-constraints.md`
4. Append (not overwrite) to `TARGET_WORKSPACE/docs/notes/<skill-name>-feedback.md`

## Output Format

Follow `ROUTER_SKILL_DIR/docs/constraints/feedback-note-constraints.md`:

```markdown
# Feedback Note: <skill-name>

## Issues

### <Issue Title>
- **严重度:** Critical | Important | Minor
- **来源:** review | test | self-check | user
- **回流目标阶段:** design | plan | task | test
- **描述:** <what was found and why it matters>
- **文件:** <path:line if applicable>
```

## Router Handoff

After feedback note is written, router presents:
- Number of issues by severity
- 问题回流到哪个阶段
- "回到 <stage> 修，还是接受继续？"

## Self-Check

- [ ] Feedback note exists at `TARGET_WORKSPACE/docs/notes/<skill-name>-feedback.md`
- [ ] 每条问题标注了严重度
- [ ] 每条问题标注了回流目标阶段
- [ ] 来源已标注

## Output

Feedback note ends with the self-check declaration:

```markdown
## Self-Check
- [x] 每条问题标注了严重度
- [x] 每条问题标注了回流目标阶段
- [x] 来源已标注
```
