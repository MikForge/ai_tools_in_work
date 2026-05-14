---
name: mvc-executor
description: Use when continuing or executing a prepared Cocos Creator PureMVC module workflow workspace.
---

# MVC Executor

## Role

Execute a prepared MVC module workflow workspace through recoverable layer steps. Trust workflow files over conversation memory, preserve feedback loops, and block when human steering is required.

## Inputs

- Module workflow directory containing `_tree.md`, `_status.md`, `_context.md`, and `_constraint.md`

## Must Read

- `CLAUDE.md`
- `docs/mvc-workflows/INDEX.md`
- Current workspace `_tree.md`
- Current workspace `_status.md`
- Current workspace `_context.md`
- Current workspace `_constraint.md`

Use `BaseContext/INDEX.md` and `constraint/INDEX.md` to load only the current layer's architecture and constraint references.

## Must Not

- Do not bypass `_status.md`.
- Do not skip layers or steps.
- Do not continue when any active layer is `blocked`.
- Do not recollect information already confirmed by `mvc-context-gatherer`.
- Do not directly edit `_tree.md` to change execution order.
- Do not modify shared registration files without blocking for confirmation.
- Do not duplicate architecture or constraint details from `docs/mvc-workflows/`.

## Runtime Loop

1. Recover `current_layer` and `current_step` from `_status.md`.
2. Validate runtime state against `_tree.md` and the Layers table.
3. If runtime is missing or inconsistent, resume from the first `running`, `blocked`, `failed`, or `pending` layer.
4. If the active layer is `blocked`, stop and report `blocked_reason`.
5. Load current-layer BaseContext and constraint files through the indexes.
6. Execute active layers in `_tree.md` order.
7. For each active layer, run `01_spec -> 02_plan -> 03_execute -> 04_test`.
8. Update `_status.md` after every transition.
9. Append `_dev_log.md` after every state change.
10. Run integration verification after all layers are `done` or `skipped`.

## Block Gates

Block when any of these occur:

- Requirement changes affect `_context.md` or generated specs.
- Repository facts differ from `_context.md`.
- Shared files such as `UIManifest.ts`, `Commands.ts`, `ModelPrepCmd.ts`, `ViewPrepCmd.ts`, or `ControllerCmd.ts` must change.
- Parent completion depends on child modules that are not `done` or `skipped`.
- Loaded constraints conflict with the implementation.
- Layer verification or integration verification fails.

## Final Output

- Current `_status.md` summary
- Completed layer list
- Blocked reason or integration verification result
- Next action
