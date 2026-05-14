---
name: mvc-context-gatherer
description: Use when creating or refreshing a Cocos Creator PureMVC module workflow workspace.
---

# MVC Context Gatherer

## Overview

Build a module workflow workspace before implementation starts. This skill creates the module truth layer, initializes the workflow files, and stops before any business code is changed.

## Inputs

- Module intent or module name
- Optional requirement document path
- Current Cocos Creator PureMVC repository

## Must Read

- `CLAUDE.md`
- `.claude/rules/*`
- `assets/scripts/game/common/constants/UIManifest.ts`
- `assets/scripts/game/controller/Commands.ts`
- `assets/scripts/game/controller/cmd/startup/ModelPrepCmd.ts`
- `assets/scripts/game/controller/cmd/startup/ViewPrepCmd.ts`
- `assets/scripts/game/controller/cmd/startup/ControllerCmd.ts`
- Existing Proxy, View, ViewId, Prefab, and Command resources discovered with repo-first search

## Must Not

- Do not implement business code.
- Do not call executor-stage skills.
- Do not modify real project source files.
- Do not generate the workflow workspace before the user confirms repo-first findings.
- Do not ask questions for information already found in the repository.

## Workflow

1. Run repo-first discovery for existing resources.
2. Show the discovered Proxy, ViewId, Prefab, Command, and path findings to the user.
3. Wait for user confirmation or correction.
4. Ask only for missing information.
5. Render templates into `docs/mvc-workflows/<ModuleName>/`.
6. Initialize `_status.md` with Runtime, Layers, and SubModules.
7. Report the workflow path, generated files, and next step `/mvc-executor`.

## Required Discovery

| Resource | Search target |
|----------|---------------|
| Proxy registrations | `ModelPrepCmd.ts` and `extends BaseProxy` |
| ViewId values | `UIManifest.ts` |
| UI manifest mappings | `UIManifest.ts` |
| Prefabs | `assets/resources/gui/` and `assets/resources/common/prefab/` |
| Notifications | `Commands.ts` |
| Startup registration files | `ModelPrepCmd.ts`, `ViewPrepCmd.ts`, `ControllerCmd.ts` |

## Stop Conditions

Stop and wait for the user when:

- The module requirement is too vague to name or scope.
- A required project path cannot be found.
- The user has not confirmed repo-first findings.
- A requested child module would create deeper than parent-to-child nesting.

## Final Output

- Workflow workspace path
- Generated file list
- Initial `_status.md` summary
- Any blocked reason
- Next step: `/mvc-executor`
