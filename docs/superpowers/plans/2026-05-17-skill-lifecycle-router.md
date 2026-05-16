# Skill Lifecycle Router — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the skill-lifecycle-router — a Harness-layer skill that routes skill development through 6 stages (design → plan → task → test → review → feedback) with gate checks, self-check enforcement, and feedback loop management.

**Architecture:** Single exposed skill (`/skill-lifecycle-router`) at `.agents/skills/skill-lifecycle-router/SKILL.md`. Six internal sub-skills nested under the router directory, executed by the router reading their SKILL.md and following instructions. Five constraint files define review checklists and feedback note format.

**Tech Stack:** Markdown (SKILL.md, constraints). No code — pure skill definition files.

---

## File Map

```
.agents/skills/skill-lifecycle-router/
  SKILL.md                              # [CREATE] Router entry point
  zh-CN.md                              # [CREATE] Chinese translation
  constraints/
    design-constraints.md               # [CREATE] Design doc review checklist
    plan-constraints.md                 # [CREATE] Plan doc review checklist
    task-constraints.md                 # [CREATE] Task output review checklist
    test-constraints.md                 # [CREATE] Test report review checklist
    feedback-note-constraints.md        # [CREATE] Feedback note format spec
  skill-lifecycle-design/
    SKILL.md                            # [CREATE] Design sub-skill
  skill-lifecycle-plan/
    SKILL.md                            # [CREATE] Plan sub-skill
  skill-lifecycle-task/
    SKILL.md                            # [CREATE] Task sub-skill
  skill-lifecycle-test/
    SKILL.md                            # [CREATE] Test sub-skill
  skill-lifecycle-review/
    SKILL.md                            # [CREATE] Review sub-skill
  skill-lifecycle-feedback/
    SKILL.md                            # [CREATE] Feedback sub-skill
```

---

### Task 1: Create directory structure

**Files:**
- Create: `.agents/skills/skill-lifecycle-router/`
- Create: `.agents/skills/skill-lifecycle-router/constraints/`
- Create: `.agents/skills/skill-lifecycle-router/skill-lifecycle-design/`
- Create: `.agents/skills/skill-lifecycle-router/skill-lifecycle-plan/`
- Create: `.agents/skills/skill-lifecycle-router/skill-lifecycle-task/`
- Create: `.agents/skills/skill-lifecycle-router/skill-lifecycle-test/`
- Create: `.agents/skills/skill-lifecycle-router/skill-lifecycle-review/`
- Create: `.agents/skills/skill-lifecycle-router/skill-lifecycle-feedback/`

- [ ] **Step 1: Create all directories**

```bash
mkdir -p .agents/skills/skill-lifecycle-router/constraints
mkdir -p .agents/skills/skill-lifecycle-router/skill-lifecycle-design
mkdir -p .agents/skills/skill-lifecycle-router/skill-lifecycle-plan
mkdir -p .agents/skills/skill-lifecycle-router/skill-lifecycle-task
mkdir -p .agents/skills/skill-lifecycle-router/skill-lifecycle-test
mkdir -p .agents/skills/skill-lifecycle-router/skill-lifecycle-review
mkdir -p .agents/skills/skill-lifecycle-router/skill-lifecycle-feedback
```

- [ ] **Step 2: Verify structure**

```bash
find .agents/skills/skill-lifecycle-router -type d | sort
```

Expected output:
```
.agents/skills/skill-lifecycle-router
.agents/skills/skill-lifecycle-router/constraints
.agents/skills/skill-lifecycle-router/skill-lifecycle-design
.agents/skills/skill-lifecycle-router/skill-lifecycle-feedback
.agents/skills/skill-lifecycle-router/skill-lifecycle-plan
.agents/skills/skill-lifecycle-router/skill-lifecycle-review
.agents/skills/skill-lifecycle-router/skill-lifecycle-task
.agents/skills/skill-lifecycle-router/skill-lifecycle-test
```

- [ ] **Step 3: Commit**

```bash
git add .agents/skills/skill-lifecycle-router/
git commit -m "feat(skill-lifecycle-router): scaffold directory structure"
```

---

### Task 2: Write constraint files

**Files:**
- Create: `.agents/skills/skill-lifecycle-router/constraints/design-constraints.md`
- Create: `.agents/skills/skill-lifecycle-router/constraints/plan-constraints.md`
- Create: `.agents/skills/skill-lifecycle-router/constraints/task-constraints.md`
- Create: `.agents/skills/skill-lifecycle-router/constraints/test-constraints.md`
- Create: `.agents/skills/skill-lifecycle-router/constraints/feedback-note-constraints.md`

- [ ] **Step 1: Write design-constraints.md**

```markdown
# Design Doc Review Checklist

Review each design doc against these criteria. Categorize findings as Critical / Important / Minor.

## Scope & Boundaries
- [ ] Problem statement is clear — what problem does this skill solve?
- [ ] Scope is explicitly bounded — what is IN and what is OUT
- [ ] Non-goals are listed and justified

## Consistency
- [ ] No contradictory assertions (e.g., "router only routes" vs "router validates content")
- [ ] Terminology is consistent throughout (same word for same concept)
- [ ] Architecture diagram matches text description

## Completeness
- [ ] No "TBD" or "TODO" placeholders
- [ ] All referenced files/artifacts have defined paths
- [ ] Edge cases addressed (empty state, error state, boundary conditions)

## Pattern Consistency
- [ ] Follows project conventions (file naming, directory structure, YAML frontmatter)
- [ ] Does not introduce patterns that conflict with existing verified patterns
- [ ] If deviates from existing pattern, deviation is justified

## Mode Consistency (from spec mode-copy-defense)
- [ ] Does the design introduce a new structural pattern? If yes, flag for review
- [ ] Is the design consistent with how similar skills in this project are structured?
```

- [ ] **Step 2: Write plan-constraints.md**

```markdown
# Plan Doc Review Checklist

Review each plan doc against these criteria. Categorize findings as Critical / Important / Minor.

## Executability
- [ ] Each step is independently executable (no "then do X, then do Y" in one step)
- [ ] Each step has exact file paths
- [ ] Each code step shows complete code (no "similar to Task N")
- [ ] Each command step has expected output

## Completeness
- [ ] No "TBD" or "TODO" placeholders
- [ ] All referenced specs, files, or dependencies exist
- [ ] Testing strategy is defined per task

## Dependency Order
- [ ] Tasks are ordered correctly — no forward references to undefined types/functions
- [ ] File creation happens before file modification
- [ ] Test file creation happens before implementation

## Pattern Consistency
- [ ] Plan structure matches project plan conventions
- [ ] Commit message style is consistent
```

- [ ] **Step 3: Write task-constraints.md**

```markdown
# Task Output Review Checklist

Review task execution output against these criteria. Categorize findings as Critical / Important / Minor.

## Plan Adherence
- [ ] Every plan step has corresponding output
- [ ] No skipped or partially completed steps
- [ ] Commit history matches plan task sequence

## Output Quality
- [ ] SKILL.md has valid YAML frontmatter (name, description)
- [ ] SKILL.md follows project skill conventions (Workflow, Rules, Anti-Patterns sections where applicable)
- [ ] Referenced scripts or templates exist and are functional

## Mode Consistency
- [ ] New skill structure mirrors existing verified skill patterns
- [ ] No architectural pattern introduced without explicit justification in design doc
- [ ] File naming and directory structure follow project conventions
```

- [ ] **Step 4: Write test-constraints.md**

```markdown
# Test Report Review Checklist

Review each test report against these criteria. Categorize findings as Critical / Important / Minor.

## Verification Coverage
- [ ] Format checks cover all required sections (YAML frontmatter, headers, code blocks)
- [ ] Completeness checks cover all referenced files and dependencies
- [ ] Structure checks verify against project conventions

## Results Clarity
- [ ] Pass/fail status is explicit for each check item
- [ ] Failure items include file:line location
- [ ] Failure items include expected vs actual

## Counter-Check (Test Effectiveness)
- [ ] If all checks pass but the artifact has visible issues → flag as "verification boundary insufficient"
- [ ] Verification items are non-trivial (not just "file exists")
```

- [ ] **Step 5: Write feedback-note-constraints.md**

```markdown
# Feedback Note Format

Every feedback note follows this structure. A note may contain multiple issues.

```markdown
# Feedback Note: <skill-name>

## Issues

### <Issue Title>
- **Severity:** Critical | Important | Minor
- **Source:** review | test | self-check
- **Target Stage:** design | plan | task | test
- **Description:** <what was found and why it matters>
- **File:** <path:line if applicable>

### <Issue Title>
...
```

## Format Rules
- Each issue MUST have Severity, Source, Target Stage, and Description
- Severity follows review criteria: Critical = broken/bug/security, Important = missing/wrong/poor, Minor = style/nitpick
- Target Stage determines where the feedback routes for repair
- Issues are appended (not overwritten) when feedback is triggered multiple times for the same skill
```

- [ ] **Step 6: Commit**

```bash
git add .agents/skills/skill-lifecycle-router/constraints/
git commit -m "feat(skill-lifecycle-router): add constraint review checklists and feedback note format"
```

---

### Task 3: Write design sub-skill SKILL.md

**Files:**
- Create: `.agents/skills/skill-lifecycle-router/skill-lifecycle-design/SKILL.md`

- [ ] **Step 1: Write skill-lifecycle-design/SKILL.md**

Content:

```markdown
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

1. Read the design spec at `docs/superpowers/specs/2026-05-17-skill-lifecycle-router-design.md` if designing the lifecycle router itself, or relevant references for other skills
2. Clarify the problem: what problem does this skill solve? What happens without it?
3. Define scope: what is IN and what is OUT. List non-goals explicitly.
4. Design the approach: architecture, components, data flow, error handling
5. Write the design doc to `docs/superpowers/specs/<skill-name>/<skill-name>-design.md` or equivalent
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
```

- [ ] **Step 2: Verify file content**

```bash
cat .agents/skills/skill-lifecycle-router/skill-lifecycle-design/SKILL.md | head -5
```

- [ ] **Step 3: Commit**

```bash
git add .agents/skills/skill-lifecycle-router/skill-lifecycle-design/
git commit -m "feat(skill-lifecycle-router): add design sub-skill"
```

---

### Task 4: Write plan sub-skill SKILL.md

**Files:**
- Create: `.agents/skills/skill-lifecycle-router/skill-lifecycle-plan/SKILL.md`

- [ ] **Step 1: Write skill-lifecycle-plan/SKILL.md**

```markdown
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
5. Write the plan doc to `docs/superpowers/plans/<skill-name>/<skill-name>-plan.md` or equivalent
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
```

- [ ] **Step 2: Commit**

```bash
git add .agents/skills/skill-lifecycle-router/skill-lifecycle-plan/
git commit -m "feat(skill-lifecycle-router): add plan sub-skill"
```

---

### Task 5: Write task sub-skill SKILL.md

**Files:**
- Create: `.agents/skills/skill-lifecycle-router/skill-lifecycle-task/SKILL.md`

- [ ] **Step 1: Write skill-lifecycle-task/SKILL.md**

```markdown
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
```

- [ ] **Step 2: Commit**

```bash
git add .agents/skills/skill-lifecycle-router/skill-lifecycle-task/
git commit -m "feat(skill-lifecycle-router): add task sub-skill"
```

---

### Task 6: Write test sub-skill SKILL.md

**Files:**
- Create: `.agents/skills/skill-lifecycle-router/skill-lifecycle-test/SKILL.md`

- [ ] **Step 1: Write skill-lifecycle-test/SKILL.md**

```markdown
---
name: skill-lifecycle-test
description: Lifecycle sub-skill — validate artifact format, completeness, and structure. Internal, invoked by skill-lifecycle-router.
disable-model-invocation: true
---

# Skill Lifecycle — Test

## Overview

Validate the task stage output: check format, completeness, and structure against project conventions. Produce a test report with explicit pass/fail results.

**Core principle:** Verify format, completeness, and structure. If all checks pass but output has visible issues, the verification boundary is insufficient — fail.

## Entry Condition

Task output must exist. Router checks this before forwarding. If missing, return to task stage.

## Process

1. Identify the task output files (SKILL.md, scripts, templates)
2. Run verification checks in three categories:
   - **Format:** YAML frontmatter valid, markdown structure correct, code blocks have language tags
   - **Completeness:** All referenced files exist, no broken paths, all required sections present
   - **Structure:** Follows project skill conventions, directory layout matches patterns
3. For each check, record: pass/fail, file:line if failed, expected vs actual
4. Write test report to `skill-lifecycle-router/test/<skill-name>-test-report.md`
5. Run self-check before declaring completion

## Counter-Check (Test Effectiveness)

After all checks complete:
- If ALL checks pass but the product has visible issues → **FAIL** — the verification boundary is insufficient. Note which issues were missed and return for redesign of verification.
- If checks reveal failures → document them clearly and route to the appropriate stage via the router.

## Self-Check

- [ ] Test report exists
- [ ] Each check item has explicit pass/fail result
- [ ] Failed items have file:line location and expected vs actual
- [ ] Counter-check performed — if all passing, product quality confirmed independently

## Output

Test report ends with the self-check declaration:

```markdown
## Self-Check
- [x] Test report exists
- [x] Pass/fail results explicit
- [x] Failed items have location info
- [x] Counter-check performed
```

## Reference

Draw verification methodology from `writing-skills` validation standards. For counter-check, reference Harness Engineering practice: "AI-written tests passing buggy code → tests are invalid — force reconsideration of verification boundaries."
```

- [ ] **Step 2: Commit**

```bash
git add .agents/skills/skill-lifecycle-router/skill-lifecycle-test/
git commit -m "feat(skill-lifecycle-router): add test sub-skill"
```

---

### Task 7: Write review sub-skill SKILL.md

**Files:**
- Create: `.agents/skills/skill-lifecycle-router/skill-lifecycle-review/SKILL.md`

- [ ] **Step 1: Write skill-lifecycle-review/SKILL.md**

```markdown
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
   - Target stage for回流: design / plan / task / test
   - File:line reference
   - What's wrong and why it matters
6. Include mode consistency check: does this artifact follow established project patterns? Any new structural patterns introduced?
7. Write review report to `skill-lifecycle-router/notes/<skill-name>-review.md`

## Review Report Format

```markdown
# Review Report: <skill-name>

**Artifact reviewed:** <path>
**Constraint checklist:** constraints/<stage>-constraints.md

## Strengths
[What's well done? Be specific.]

## Issues

### <Issue Title>
- **Severity:** Critical | Important | Minor
- **Target Stage:** design | plan | task | test
- **File:** <path:line>
- **What:** <description>
- **Why:** <impact>

## Mode Consistency
[Pattern consistency check result. Any new structural patterns? Do they align with project conventions?]

## Assessment
[Overall readiness. If zero Critical + zero Important → automatic pass.]
```

## Self-Check

- [ ] Review report exists
- [ ] Each finding has severity and target stage
- [ ] Mode consistency check included
- [ ] Assessment gives clear verdict

## Output

Review report ends with the self-check declaration:

```markdown
## Self-Check
- [x] Review report exists
- [x] Each finding has severity and target stage
- [x] Mode consistency check included
- [x] Assessment verdict clear
```
```

- [ ] **Step 2: Commit**

```bash
git add .agents/skills/skill-lifecycle-router/skill-lifecycle-review/
git commit -m "feat(skill-lifecycle-router): add review sub-skill"
```

---

### Task 8: Write feedback sub-skill SKILL.md

**Files:**
- Create: `.agents/skills/skill-lifecycle-router/skill-lifecycle-feedback/SKILL.md`

- [ ] **Step 1: Write skill-lifecycle-feedback/SKILL.md**

```markdown
---
name: skill-lifecycle-feedback
description: Lifecycle sub-skill — record issues with severity and reflux routing. Internal, invoked by skill-lifecycle-router (user-selectable or auto-triggered by review/test).
disable-model-invocation: true
---

# Skill Lifecycle — Feedback

## Overview

Record issues found during review or test, annotate severity and target reflux stage, and trigger repair loops. Two entry paths: user selecting "feedback" stage, or router auto-triggering after review/test finds issues.

**Core principle:** Feedback is the signal router — it routes issues back to the correct stage for repair, not a dumping ground for complaints.

## Entry

- **User-initiated:** User selects feedback stage in router. Router asks: "For which skill? About which stage? What's the issue?"
- **Auto-triggered:** Router detects non-empty Issues section in review/test report → invokes feedback to generate structured feedback note.

## Process

### User-Initiated
1. Router asks which skill this feedback is for
2. Router asks which stage the issue targets (design / plan / task / test)
3. User describes the issue
4. Router assigns severity (Critical / Important / Minor) based on user description
5. Write feedback note to `skill-lifecycle-router/notes/<skill-name>-feedback.md`

### Auto-Triggered
1. Router passes review/test report to feedback sub-skill
2. Extract each issue from the report's Issues section
3. Format each issue per `constraints/feedback-note-constraints.md`
4. Append (not overwrite) to `skill-lifecycle-router/notes/<skill-name>-feedback.md`

## Output Format

Follow `constraints/feedback-note-constraints.md`:

```markdown
# Feedback Note: <skill-name>

## Issues

### <Issue Title>
- **Severity:** Critical | Important | Minor
- **Source:** review | test | self-check | user
- **Target Stage:** design | plan | task | test
- **Description:** <what was found and why it matters>
- **File:** <path:line if applicable>
```

## Router Handoff

After feedback note is written, router presents:
- Number of issues by severity
- Which stages they target for回流
- "Go back to <stage> to fix, or accept and continue?"

## Self-Check

- [ ] Feedback note exists
- [ ] Each issue has severity
- [ ] Each issue has target stage for reflux
- [ ] Source is identified for each issue

## Output

Feedback note ends with the self-check declaration:

```markdown
## Self-Check
- [x] Each issue has severity
- [x] Each issue has target stage
- [x] Source identified
```
```

- [ ] **Step 2: Commit**

```bash
git add .agents/skills/skill-lifecycle-router/skill-lifecycle-feedback/
git commit -m "feat(skill-lifecycle-router): add feedback sub-skill"
```

---

### Task 9: Write router SKILL.md (main entry point)

**Files:**
- Create: `.agents/skills/skill-lifecycle-router/SKILL.md`

- [ ] **Step 1: Write SKILL.md**

```markdown
---
name: skill-lifecycle-router
description: Skill 生命周期统一入口。路由 design/plan/task/test/review/feedback 六阶段，检查入口条件，管理反馈回流。
---

# Skill Lifecycle Router

## Overview

Skill 生命周期的 Harness 层。询问用户当前要处理哪个阶段，检查入口条件，转发到对应子 skill，管理反馈回流和退出循环。

**Core principle:** Router, not executor. Contains no domain knowledge — reads the target sub-skill SKILL.md to learn what to do.

## When to Use

- 用户要开发一个新 skill 或修改现有 skill
- 用户需要结构化的 design → plan → task → test → review 流程
- 用户需要反馈回流机制（review/test 发现问题自动路由回对应阶段）

Do NOT use when:
- 用户只是想记一个想法（用 `record-idea`）
- 用户已经有一个完整的 spec 和 plan 想要直接执行

## Workflow

### Step 1: Identify skill

Ask user: "Which skill are you working on?" This becomes `<skill-name>` for all artifact paths.

### Step 2: Show stage status

Scan for existing artifacts and display:

| Stage | Status | Artifact |
|-------|--------|----------|
| design | Done / Not started | `specs/<skill-name>-design.md` |
| plan | Done / Not started | `plans/<skill-name>-plan.md` |
| task | Done / Not started | Skill SKILL.md and related files |
| test | Done / Not started | `test/<skill-name>-test-report.md` |
| review | Done / Not started | `notes/<skill-name>-review.md` |
| feedback | Issues pending / None | `notes/<skill-name>-feedback.md` |

Also scan `notes/<skill-name>-feedback.md` for unresolved issues and show them.

### Step 3: Ask which stage

"Which stage? (design / plan / task / test / review / feedback)"

### Step 4: Check entry conditions

- `plan` → design doc must exist. If not: "没有设计文档的实现计划容易偏离方向——先用 design 阶段明确边界和范围"
- `task` → plan doc must exist. If not: "没有实现计划就动手容易跑偏——先用 plan 阶段明确要做什么"
- `test` → task output must exist. If not: "没有实现产物就测试是在验证空气——先完成 task 阶段"
- `review` → target artifact must exist (ask user which stage to review). If not: "没有产物可以审查——先完成对应阶段的输出"
- `feedback` → no precondition. Ask user if this is user-initiated or triggered by review/test findings.

### Step 5: Execute sub-skill

Read `.agents/skills/skill-lifecycle-router/skill-lifecycle-<stage>/SKILL.md`. Follow its instructions to execute the stage. Do NOT invoke it via Skill tool — execute it directly as the router.

### Step 6: Verify self-check

After sub-skill execution, check that the output artifact ends with a `## Self-Check` section with checked items (`- [x]`). If missing, the stage is NOT complete — return to the sub-skill.

### Step 7: Check for feedback triggers

After review or test stages:
- Read the review/test report
- If Issues section is non-empty → invoke feedback sub-skill to generate feedback note
- Present issues to user: "回到 <stage> 修，还是接受继续？"

### Step 8: Loop or exit

Show updated stage status. Ask: "Next stage? Or done?"

If user says "done":
- Check unresolved feedback → warn if issues still pending
- If review passed (zero Critical + zero Important) → confirm exit
- If review not run or has issues → "Review 还没通过，确定要结束吗？"

## Entropy Management

When entering a stage, scan `notes/<skill-name>-feedback.md` for historical issues targeting this stage. Remind: "上次 design 阶段有 X 个问题需要注意：..."

## Exit Condition

The lifecycle terminates when:
- review produces zero Critical + zero Important issues, AND
- user accepts the result (user can always veto and continue iterating)

## Rules

1. Router, not executor. Read sub-skill SKILL.md, follow its instructions.
2. Gate checks are existence-only — verify file exists, not content quality.
3. Self-check declarations are mandatory — no declaration = stage incomplete.
4. One question at a time — never batch.
5. Feedback loop: review passes zero Critical+Important → auto-pass. User retains veto.
6. Do NOT call Skill tool for sub-skills. Execute them directly.

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Execute task yourself | Read sub-skill SKILL.md, follow its process |
| Skip self-check verification | Check for `## Self-Check` with `- [x]` items |
| Skip gate check | Verify file existence before entering stage |
| Batch questions | One question at a time |
| Forget feedback scan | Check `notes/` for historical issues on stage entry |
```

- [ ] **Step 2: Verify router SKILL.md**

```bash
wc -l .agents/skills/skill-lifecycle-router/SKILL.md
```

- [ ] **Step 3: Commit**

```bash
git add .agents/skills/skill-lifecycle-router/SKILL.md
git commit -m "feat(skill-lifecycle-router): add router SKILL.md"
```

---

### Task 10: Write zh-CN.md

**Files:**
- Create: `.agents/skills/skill-lifecycle-router/zh-CN.md`

- [ ] **Step 1: Write zh-CN.md**

```markdown
---
name: skill-lifecycle-router
description: Skill 生命周期统一入口。路由 design/plan/task/test/review/feedback 六阶段，检查入口条件，管理反馈回流。
---

# Skill Lifecycle Router（技能生命周期路由器）

## 概述

Skill 生命周期的 Harness 层。询问用户当前要处理哪个阶段，检查入口条件，转发到对应子 skill，管理反馈回流和退出循环。

**核心原则：** 路由器，不是执行器。不承载领域知识——读取目标子 skill 的 SKILL.md 来了解该做什么。

## 使用场景

- 用户要开发一个新 skill 或修改现有 skill
- 用户需要结构化的 design → plan → task → test → review 流程
- 用户需要反馈回流机制（review/test 发现问题自动路由回对应阶段）

不要用于：
- 用户只是想记一个想法（用 `record-idea`）
- 用户已经有一个完整的 spec 和 plan 想要直接执行

## 工作流

### 步骤 1：确定 skill

问用户："你在开发哪个 skill？" 这个名称成为所有产物路径中的 `<skill-name>`。

### 步骤 2：展示阶段状态

扫描已有产物，展示：

| 阶段 | 状态 | 产物 |
|------|------|------|
| design | 已完成 / 未开始 | `specs/<skill-name>-design.md` |
| plan | 已完成 / 未开始 | `plans/<skill-name>-plan.md` |
| task | 已完成 / 未开始 | Skill SKILL.md 及相关文件 |
| test | 已完成 / 未开始 | `test/<skill-name>-test-report.md` |
| review | 已完成 / 未开始 | `notes/<skill-name>-review.md` |
| feedback | 有待处理问题 / 无 | `notes/<skill-name>-feedback.md` |

同时扫描 `notes/<skill-name>-feedback.md`，列出未解决的问题。

### 步骤 3：询问阶段

"进哪个阶段？（design / plan / task / test / review / feedback）"

### 步骤 4：检查入口条件

- `plan` → design doc 必须存在。不存在时："没有设计文档的实现计划容易偏离方向——先用 design 阶段明确边界和范围"
- `task` → plan doc 必须存在。不存在时："没有实现计划就动手容易跑偏——先用 plan 阶段明确要做什么"
- `test` → task 产物必须存在。不存在时："没有实现产物就测试是在验证空气——先完成 task 阶段"
- `review` → 目标产物必须存在（先问用户审查哪个阶段的产物）。不存在时："没有产物可以审查——先完成对应阶段的输出"
- `feedback` → 无条件。问用户是主动记录还是由 review/test 触发。

### 步骤 5：执行子 skill

读取 `.agents/skills/skill-lifecycle-router/skill-lifecycle-<stage>/SKILL.md`，按其中指令执行。不要通过 Skill 工具调用——直接作为 router 执行。

### 步骤 6：验证自检声明

子 skill 执行完毕后，检查产物文件末尾是否有 `## Self-Check` 段并包含已勾选项目（`- [x]`）。缺少自检声明 = 阶段未完成，退回子 skill。

### 步骤 7：检查 feedback 触发

review 或 test 阶段完成后：
- 读取 review/test report
- 如果 Issues 段非空 → 调用 feedback 子 skill 生成 feedback note
- 向用户展示问题："回到 <stage> 修，还是接受继续？"

### 步骤 8：循环或退出

展示更新后的阶段状态。问："下一步？还是结束？"

用户说"结束"时：
- 检查是否有未处理 feedback → 有的话警告
- 如果 review 已通过（零 Critical + 零 Important）→ 确认退出
- 如果 review 未跑或有问题 → "Review 还没通过，确定要结束吗？"

## 熵管理

进入某个阶段时，扫描 `notes/<skill-name>-feedback.md` 中目标为该阶段的历史问题。提醒："上次 design 阶段有 X 个问题需要注意：..."

## 退出条件

生命周期终止条件：
- review 产出零 Critical + 零 Important 问题，且
- 用户接受结果（用户随时可以否决并继续迭代）

## 规则

1. 路由器，不是执行器。读取子 skill SKILL.md，执行其中指令。
2. Gate 检查仅验证存在性——检查文件是否存在，不校验内容质量。
3. 自检声明是强制性的——没有声明 = 阶段未完成。
4. 每次只问一个问题——不批量。
5. 反馈循环：review 零 Critical+Important 自动通过，用户保留否决权。
6. 不要用 Skill 工具调用子 skill，直接执行。
```

- [ ] **Step 2: Commit**

```bash
git add .agents/skills/skill-lifecycle-router/zh-CN.md
git commit -m "feat(skill-lifecycle-router): add zh-CN translation"
```

---

### Task 11: Final verification and self-review

- [ ] **Step 1: Verify all files exist**

```bash
find .agents/skills/skill-lifecycle-router -type f | sort
```

Expected list:
```
.agents/skills/skill-lifecycle-router/SKILL.md
.agents/skills/skill-lifecycle-router/zh-CN.md
.agents/skills/skill-lifecycle-router/constraints/design-constraints.md
.agents/skills/skill-lifecycle-router/constraints/feedback-note-constraints.md
.agents/skills/skill-lifecycle-router/constraints/plan-constraints.md
.agents/skills/skill-lifecycle-router/constraints/task-constraints.md
.agents/skills/skill-lifecycle-router/constraints/test-constraints.md
.agents/skills/skill-lifecycle-router/skill-lifecycle-design/SKILL.md
.agents/skills/skill-lifecycle-router/skill-lifecycle-feedback/SKILL.md
.agents/skills/skill-lifecycle-router/skill-lifecycle-plan/SKILL.md
.agents/skills/skill-lifecycle-router/skill-lifecycle-review/SKILL.md
.agents/skills/skill-lifecycle-router/skill-lifecycle-task/SKILL.md
.agents/skills/skill-lifecycle-router/skill-lifecycle-test/SKILL.md
```

- [ ] **Step 2: Verify all SKILL.md files have valid YAML frontmatter**

```bash
for f in $(find .agents/skills/skill-lifecycle-router -name "SKILL.md"); do
  echo "=== $f ==="
  head -5 "$f"
  echo ""
done
```

- [ ] **Step 3: Verify all sub-skills have disable-model-invocation: true**

```bash
grep -r "disable-model-invocation" .agents/skills/skill-lifecycle-router/skill-lifecycle-*/SKILL.md
```

Expected: 6 matches (one per sub-skill, NOT in the router SKILL.md)

- [ ] **Step 4: Self-review check**

Checklist:
- [ ] Every sub-skill listed in the spec architecture diagram has a SKILL.md
- [ ] Every constraint file listed in the spec architecture diagram exists
- [ ] Router SKILL.md covers all 8 workflow steps
- [ ] Router SKILL.md covers entropy management and exit conditions
- [ ] Each sub-skill defines self-check criteria matching the spec
- [ ] Each sub-skill defines output format including self-check declaration
- [ ] No "TBD" or "TODO" in any file
- [ ] All file paths use forward slashes
- [ ] zh-CN.md is a faithful Chinese translation of the router overview

- [ ] **Step 5: Commit**

```bash
git add -A .agents/skills/skill-lifecycle-router/
git status
git commit -m "feat(skill-lifecycle-router): complete implementation — router + 6 sub-skills + 5 constraints"
```
