---
name: mvc-context-gatherer
description: Use when creating or refreshing a Cocos Creator PureMVC module workflow workspace.
---

# MVC Context Gatherer

## Overview

Build a module workflow workspace before implementation starts. Creates the module truth layer, initializes workflow files, stops before any business code is changed.

**Architecture knowledge lives in `docs/mvc-workflows/BaseContext/` — this skill references it, not duplicates it.**

## Inputs

- Module intent or module name
- Optional requirement document path
- Current Cocos Creator PureMVC repository

## Must Read

### 项目规则（始终加载）
- `CLAUDE.md`
- `.claude/rules/*`

### 架构参考（按需加载 — 来自 docs/mvc-workflows/）
- `docs/mvc-workflows/BaseContext/ProxyBaseContext.md` — Proxy 创建模式 + 搜索命令
- `docs/mvc-workflows/BaseContext/ViewBaseContext.md` — View 创建模式 + 搜索命令
- `docs/mvc-workflows/BaseContext/MediatorBaseContext.md` — Mediator 创建模式 + 搜索命令
- `docs/mvc-workflows/BaseContext/CommandBaseContext.md` — Command 创建模式 + 搜索命令
- `docs/mvc-workflows/constraint/*.md` — 按角色拆分的硬约束

### 仓库探测目标（使用 BaseContext 中的搜索模式去搜）
- `assets/scripts/game/common/constants/UIManifest.ts`
- `assets/scripts/game/controller/Commands.ts`
- `assets/scripts/game/controller/cmd/startup/ModelPrepCmd.ts`
- `assets/scripts/game/controller/cmd/startup/ViewPrepCmd.ts`
- `assets/scripts/game/controller/cmd/startup/ControllerCmd.ts`

## Must Not

- Do not implement business code.
- Do not call executor-stage skills.
- Do not modify real project source files.
- Do not generate the workflow workspace before the user confirms repo-first findings.
- Do not ask questions for information already found in the repository.
- Do not inline architecture patterns — read them from `docs/mvc-workflows/BaseContext/`.

## Cold Start

Before Phase A, check if `docs/mvc-workflows/BaseContext/` has content:

```
docs/mvc-workflows/BaseContext/ 存在且非空？
  → NO  → 提示用户："首次运行，需要从项目源码提取架构参考"
         → 读取 BaseProxy.ts / BaseView.ts / BaseMeditor.ts 等源码
         → 按 BaseContext 8-section 模板生成 4 个文件
         → 从现有 templates/_constraint.md 反序列化 C1-C17 生成 7 个 constraint 文件
         → 展示生成内容，等待用户确认
         → 确认后写盘，继续 Phase A
  → YES → 读取 BaseContext/*.md 获取搜索模式
         → 比对 BaseContext 与源码关键 API 签名
         → 偏差告警写入 00_init.md
         → 继续 Phase A
```

## Workflow

### Phase A: Repo-First Discovery

1. Read `docs/mvc-workflows/BaseContext/*.md` to learn search patterns.
2. Search the repo using those patterns:
   - Existing Proxies: read `ModelPrepCmd.ts` → grep `registerProxy`
   - Existing ViewIds: read `UIManifest.ts` → ViewId enum
   - Existing UI configs: read `UIManifest.ts` → UI_MANIFEST
   - Existing Commands: grep `ControllerCmd.ts` + `ViewPrepCmd.ts` → `registerCommand`
   - Existing Prefabs: ls `assets/resources/gui/` + `common/prefab/`
   - Existing notifications: read `Commands.ts` → namespaces
3. Show discovered resources to user for confirmation or correction.

### Phase B: Socratic Q&A

4. Read `docs/mvc-workflows/constraint/*.md` to inform questioning.
5. Ask only for information not determinable from the repo:
   - Module name (PascalCase)
   - Target ViewId (new or reuse)
   - Needs new Proxy? (compare against discovered list)
   - Has sub-modules? List names.
   - Has UI? → mark complexity: simple / medium / complex
   - Related notification constants
   - Any external reference documents

### Phase C: Render Templates

6. Render templates from `templates/` into `docs/mvc-workflows/<ModuleName>/`.
7. Initialize `_status.md` with Runtime, Layers, SubModules.
8. Create layer directories (Proxy/ View+Prefab/ Mediator/).

### Phase D: Report

9. Report workflow path, generated files, initial `_status.md` summary, next step `/mvc-executor`.

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
