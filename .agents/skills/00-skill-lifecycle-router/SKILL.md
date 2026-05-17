---
name: skill-lifecycle-router
description: Skill 生命周期统一入口。路由 design/plan/task/test/review/feedback 六阶段，检查入口条件，管理反馈回流。
---

# Skill Lifecycle Router

## Overview

Skill 生命周期的 Harness 层。询问用户当前要处理哪个阶段，检查入口条件，转发到对应子 skill，管理反馈回流和退出循环。

**Core principle:** Router, not executor. Contains no domain knowledge — reads the target sub-skill SKILL.md to learn what to do.

## Path Binding

Before any workflow step, bind `ROUTER_SKILL_DIR` to the absolute directory containing the root `skill-lifecycle-router/SKILL.md`.

The router uses three explicit path roots:

| Root | Bound to | Owns |
| ---- | -------- | ---- |
| `ROUTER_SKILL_DIR` | Absolute directory containing this root router `SKILL.md` | Router `SKILL.md`, `zh-CN.md`, internal sub-skills, router constraints |
| `TARGET_WORKSPACE` | User-specified workspace, or the current target repository root when unambiguous | Lifecycle reports under `docs/specs`, `docs/plans`, `docs/test`, and `docs/notes` |
| `TARGET_SKILL_DIR` | Directory of the skill being created or modified, once the target skill is known | Target skill `SKILL.md`, `zh-CN.md`, scripts, templates, and references |

`ROUTER_SKILL_DIR` is the only root for router-owned files:
- sub-skill files: `ROUTER_SKILL_DIR/skill-lifecycle-<stage>/SKILL.md`
- router constraint files: `ROUTER_SKILL_DIR/docs/constraints/*.md`
- any relative path inside a router sub-skill that points to router-owned files

`TARGET_WORKSPACE` binding rules:
- If the user explicitly names a workspace, bind `TARGET_WORKSPACE` to that absolute path.
- Otherwise bind `TARGET_WORKSPACE` to the current target repository root.
- If the current working directory is inside a repository, use that repository root instead of the nested current directory.
- If multiple plausible workspaces exist, ask one question before entering a stage.
- Do not bind `TARGET_WORKSPACE` to `ROUTER_SKILL_DIR` unless the router package itself is the target workspace.

Never resolve router-owned files from the current shell working directory, the project root, or `TARGET_WORKSPACE`. If a path could exist in both `ROUTER_SKILL_DIR` and the project workspace, use `ROUTER_SKILL_DIR` only when the instruction explicitly says `ROUTER_SKILL_DIR`.

Lifecycle output artifacts such as `TARGET_WORKSPACE/docs/specs/<skill-name>-design.md` and `TARGET_WORKSPACE/docs/plans/<skill-name>-plan.md` belong to the target workspace unless the user explicitly says otherwise.

Sub-skills inherit these bindings and must not reinterpret `ROUTER_SKILL_DIR` as their own directory.

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
| design | Done / Not started | `TARGET_WORKSPACE/docs/specs/<skill-name>-design.md` |
| plan | Done / Not started | `TARGET_WORKSPACE/docs/plans/<skill-name>-plan.md` |
| task | Done / Not started | Skill SKILL.md and related files under `TARGET_SKILL_DIR` |
| test | Done / Not started | `TARGET_WORKSPACE/docs/test/<skill-name>-test-report.md` |
| review | Done / Not started | `TARGET_WORKSPACE/docs/notes/<skill-name>-review.md` |
| feedback | Issues pending / None | `TARGET_WORKSPACE/docs/notes/<skill-name>-feedback.md` |

Also scan `TARGET_WORKSPACE/docs/notes/<skill-name>-feedback.md` for unresolved issues and show them.

### Step 3: Ask which stage

"Which stage? (design / plan / task / test / review / feedback)"

### Step 4: Check entry conditions

- `plan` → design doc must exist. If not: "没有设计文档的实现计划容易偏离方向——先用 design 阶段明确边界和范围"
- `task` → plan doc must exist. If not: "没有实现计划就动手容易跑偏——先用 plan 阶段明确要做什么"
- `test` → task output must exist. If not: "没有实现产物就测试是在验证空气——先完成 task 阶段"
- `review` → target artifact must exist (ask user which stage to review). If not: "没有产物可以审查——先完成对应阶段的输出"
- `feedback` → no precondition. Ask user if this is user-initiated or triggered by review/test findings.

### Step 5: Execute sub-skill

Read `ROUTER_SKILL_DIR/skill-lifecycle-<stage>/SKILL.md`. Follow its instructions to execute the stage. Do NOT invoke it via Skill tool — execute it directly as the router.

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

When entering a stage, scan `docs/notes/<skill-name>-feedback.md` for historical issues targeting this stage. Remind: "上次 design 阶段有 X 个问题需要注意：..."

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
