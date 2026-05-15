---
name: mvc-workflow
description: Cocos Creator PureMVC 模块开发工作流入口。选择场景后委托给子 skill。
---

# MVC Workflow

## Role

Route MVC module workflow requests. Do not perform business analysis or implementation here.

## Must Read

- `CLAUDE.md`
- `.claude/rules/*`
- `docs/mvc-workflows/INDEX.md`

## Routes

| User Intent | Route |
|---|---|
| Create a module workflow workspace | `mvc-context-gatherer` |
| Refresh module workflow context | `mvc-context-gatherer` |
| Add child module workflow context | `mvc-context-gatherer` |
| Continue a prepared workflow workspace | `mvc-executor` |

## Workflow

1. Read the workflow index.
2. Identify whether the user needs context gathering or execution.
3. Delegate to the matching child skill.
4. Stop.

## Stop Conditions

- If the user intent does not clearly match gatherer or executor, ask one concise routing question.
- Do not edit source files, workflow files, or docs from this router.
