---
name: mvc-executor
description: Use when continuing or executing a prepared Cocos Creator PureMVC module workflow workspace.
---

# MVC Executor

## Overview

Execute a prepared MVC module workflow workspace one layer at a time. This skill trusts `_status.md` and `_tree.md` over conversation memory, advances low-risk steps automatically, and blocks when human steering is required.

## Inputs

- Module workflow directory containing `_tree.md`, `_status.md`, `_context.md`, and `_constraint.md`

## Must Read

- `_tree.md`
- `_status.md`
- `_context.md`
- `_constraint.md`
- Current layer files: `01_spec.md`, `02_plan.md`, `03_execute.md`, `04_test.md`

## Must Not

- Do not bypass `_status.md`.
- Do not skip layers or steps.
- Do not continue when any active layer is `blocked`.
- Do not recollect information already confirmed by `mvc-context-gatherer`.
- Do not directly edit `_tree.md` to change execution order.
- Do not modify shared registration files while another module or child module is active without blocking for confirmation.

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

- `01_spec` → `/brainstorming`
- `02_plan` → `/writing-plans`
- `03_execute` → `/executing-plans` + `/test-driven-development`
- `04_test` → `/verification`

## High-Risk Gates

Block when any of these occur:

- Requirement change affects `_context.md` or generated specs.
- Repository facts differ from `_context.md`.
- Shared files such as `UIManifest.ts`, `Commands.ts`, `ModelPrepCmd.ts`, `ViewPrepCmd.ts`, or `ControllerCmd.ts` must be modified.
- Parent completion depends on child modules that are not `done` or `skipped`.
- C1-C17 constraints conflict with the implementation.
- Integration verification fails.

## Final Output

- Current `_status.md` summary
- Completed layer list
- Blocked reason or integration verification result
- Next action
