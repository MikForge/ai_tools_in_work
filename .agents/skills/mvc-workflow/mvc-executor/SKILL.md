---
name: mvc-executor
description: Use when continuing or executing a prepared Cocos Creator PureMVC module workflow workspace.
---

# MVC Executor

## Overview

Execute a prepared MVC module workflow workspace one layer at a time. Trusts `_status.md` and `_tree.md` over conversation memory, advances low-risk steps automatically, blocks when human steering is required.

**Architecture knowledge lives in `docs/mvc-workflows/BaseContext/` — this skill references it, not duplicates it.**

## Inputs

- Module workflow directory containing `_tree.md`, `_status.md`, `_context.md`, and `_constraint.md`

## Must Read

### 工作区文件（始终）
- `_tree.md`
- `_status.md`
- `_context.md`
- `_constraint.md` — 本模块适用的约束清单（指向 `docs/mvc-workflows/constraint/`）

### 架构参考（按当前层加载 — 委托子 skill 前必读）
- `docs/mvc-workflows/BaseContext/ProxyBaseContext.md` — Proxy 层执行时读取
- `docs/mvc-workflows/BaseContext/ViewBaseContext.md` — View+Prefab 层执行时读取
- `docs/mvc-workflows/BaseContext/MediatorBaseContext.md` — Mediator 层执行时读取
- `docs/mvc-workflows/BaseContext/CommandBaseContext.md` — 涉及新建 Command 时读取

### 约束参考（按当前层加载 — 从 `_constraint.md` 适用清单中索引）
- `docs/mvc-workflows/constraint/ProxyConstraint.md`
- `docs/mvc-workflows/constraint/ViewConstraint.md`
- `docs/mvc-workflows/constraint/MediatorConstraint.md`
- `docs/mvc-workflows/constraint/CommandConstraint.md`
- `docs/mvc-workflows/constraint/NotificationConstraint.md`
- `docs/mvc-workflows/constraint/RegistrationConstraint.md`
- `docs/mvc-workflows/constraint/ModuleStructureConstraint.md`

## Must Not

- Do not bypass `_status.md`.
- Do not skip layers or steps.
- Do not continue when any active layer is `blocked`.
- Do not recollect information already confirmed by `mvc-context-gatherer`.
- Do not directly edit `_tree.md` to change execution order.
- Do not modify shared registration files while another module or child module is active without blocking for confirmation.
- Do not inline architecture patterns — read them from `docs/mvc-workflows/BaseContext/`.

## Recovery Algorithm

1. Read `Runtime.current_layer` and `Runtime.current_step`.
2. Validate Runtime against the corresponding row in Layers.
3. If Runtime is valid and status is `running` or `failed`, continue or retry from that step.
4. If Runtime is `blocked`, stop and show `blocked_reason`.
5. If Runtime is missing or inconsistent, scan Layers for the first `running`, `blocked`, `failed`, or `pending` row.
6. If all layers are `done` or `skipped`, set current step to `integration` and run integration verification.

## Runtime Actions

| Action | Use |
|--------|-----|
| `enter_step(layer, step)` | Start a layer step |
| `complete_step(layer, next_step)` | Advance after successful step |
| `skip_layer(layer, reason)` | Skip an unnecessary layer |
| `block(layer, step, reason)` | Stop for human confirmation |
| `fail(layer, step, error)` | Record failure and enter rewrite flow |
| `reset_from(layer)` | Reset an affected layer and downstream layers |
| `integration_pass()` | Mark integration success |
| `integration_fail(error)` | Record integration failure |

## Workflow

1. Recover the starting point from `_status.md`.
2. Check layer prerequisites from `_tree.md`.
3. Execute `01_spec → 02_plan → 03_execute → 04_test`.
4. Update `_status.md` through Runtime Actions after every step.
5. Append `_dev_log.md` after every state change.
6. Block on high-risk gates.
7. Use the three rewrite paths for failures, new information, and requirement changes.
8. Run integration verification after all layers are `done` or `skipped`.

## Delegation Rules

委托子 skill 时，必须将当前层的 BaseContext + Constraint 文件内容作为上下文传入子 skill，这样子 skill 不需要自己去项目 grep 模式：

| 当前层 | 委托前必读 | 传给子 skill |
|--------|-----------|-------------|
| Proxy | `ProxyBaseContext.md` + `ProxyConstraint.md` | Proxy 创建模式 + 约束 |
| View+Prefab | `ViewBaseContext.md` + `ViewConstraint.md` | View 创建模式 + Prefab 约定 + 约束 |
| Mediator | `MediatorBaseContext.md` + `MediatorConstraint.md` | Mediator 创建模式 + 事件绑定 + 约束 |

| Step | 委托目标 |
|------|----------|
| `01_spec` | `/brainstorming` |
| `02_plan` | `/writing-plans` |
| `03_execute` | `/executing-plans` + `/test-driven-development` |
| `04_test` | `/verification` |

## High-Risk Gates

Block when any of these occur:

- Requirement change affects `_context.md` or generated specs.
- Repository facts differ from `_context.md`.
- Shared files such as `UIManifest.ts`, `Commands.ts`, `ModelPrepCmd.ts`, `ViewPrepCmd.ts`, or `ControllerCmd.ts` must be modified.
- Parent completion depends on child modules that are not `done` or `skipped`.
- Constraints in `docs/mvc-workflows/constraint/*.md` conflict with the implementation.
- Integration verification fails.

## Final Output

- Current `_status.md` summary
- Completed layer list
- Blocked reason or integration verification result
- Next action
