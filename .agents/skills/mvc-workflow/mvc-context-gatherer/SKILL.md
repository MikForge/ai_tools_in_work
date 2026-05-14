---
name: mvc-context-gatherer
description: Use when creating or refreshing a Cocos Creator PureMVC module workflow workspace.
---

# MVC Context Gatherer

## Role

Create or refresh a module workflow workspace before implementation begins. Build the module truth layer, initialize workflow structure, and stop before business source code changes.

## Inputs

- Module intent or module name
- Optional requirement document path
- Current Cocos Creator PureMVC repository

## Must Read

- `CLAUDE.md`
- `docs/mvc-workflows/INDEX.md`
- `docs/mvc-workflows/BaseContext/INDEX.md`
- `docs/mvc-workflows/constraint/INDEX.md`

## Must Not

- Do not implement business code.
- Do not call executor-stage skills.
- Do not modify real project source files.
- Do not generate a workflow workspace before the user confirms repo-first findings.
- Do not ask for information already discovered from the repository.
- Do not duplicate architecture or constraint details from `docs/mvc-workflows/`.

## Workflow

1. Load the workflow indexes.
2. Use `BaseContext/INDEX.md` to choose the architecture references needed for repo-first discovery.
3. Discover existing repository resources before asking questions.
4. Show discovered resources to the user and wait for confirmation or correction.
5. Ask only for missing module facts that the repository cannot determine.
6. Use `constraint/INDEX.md` to mark applicable constraints for the module.
7. Render templates into `docs/mvc-workflows/<ModuleName>/`.
8. Initialize `_context.md`, `_tree.md`, `_status.md`, `_constraint.md`, and `_dev_log.md`.
9. Report the generated workspace and next action.

## Stop Conditions

- The module requirement is too vague to name or scope.
- A required project path cannot be found.
- The user has not confirmed repo-first findings.
- A requested child module would create deeper than parent-to-child nesting.

## Final Output

- Workflow workspace path
- Generated file list
- Initial `_status.md` summary
- Blocked reason, if any
- Next action: `mvc-executor`
