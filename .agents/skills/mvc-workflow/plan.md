# MVC Module Workflow Skills Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the two Codex skills and template files described by `docs/superpowers/specs/2026-05-14-mvc-module-workflow-design.md`.

**Architecture:** Keep skills in the shared skill repository at `/Users/michael/Desktop/gitfiles/ai_tools_in_work/.agents/skills/`. `mvc-context-gatherer` owns repo-first context collection and template rendering; `mvc-executor` owns workflow recovery, state transitions, delegation rules, and integration verification. Templates are plain Markdown contracts so they can be copied or rendered without adding a runtime dependency.

**Tech Stack:** Codex skill Markdown, Chinese mirror docs (`zh-CN.md`), Markdown templates, shell verification through `rtk`, Git commits.

---

## File Structure

```text
/Users/michael/Desktop/gitfiles/ai_tools_in_work/.agents/skills/
  mvc-context-gatherer/
    SKILL.md
    zh-CN.md
    templates/
      _context.example.md
      _status.md
      _tree.md
      _constraint.md
      _ui-spec.md
      _dev_log.md
      00_init.md
      layers/
        01_spec.md
        02_plan.md
        03_execute.md
        04_test.md
  mvc-executor/
    SKILL.md
    zh-CN.md
```

- Create `mvc-context-gatherer/SKILL.md`: English triggerable skill contract for creating workflow workspaces.
- Create `mvc-context-gatherer/zh-CN.md`: Chinese mirror of the gatherer skill.
- Create `mvc-context-gatherer/templates/*`: Markdown templates used to initialize a module workflow directory.
- Create `mvc-executor/SKILL.md`: English triggerable skill contract for executing prepared workspaces.
- Create `mvc-executor/zh-CN.md`: Chinese mirror of the executor skill.

## Implementation Tasks

### Task 1: Create `mvc-context-gatherer` Skill Docs

**Files:**
- Create: `/Users/michael/Desktop/gitfiles/ai_tools_in_work/.agents/skills/mvc-context-gatherer/SKILL.md`
- Create: `/Users/michael/Desktop/gitfiles/ai_tools_in_work/.agents/skills/mvc-context-gatherer/zh-CN.md`

- [ ] **Step 1: Verify the gatherer skill does not exist yet**

Run:

```bash
rtk sh -lc 'test -f /Users/michael/Desktop/gitfiles/ai_tools_in_work/.agents/skills/mvc-context-gatherer/SKILL.md'
```

Expected: FAIL because the file is not present before this task.

- [ ] **Step 2: Create the gatherer skill directory**

Run:

```bash
rtk mkdir -p /Users/michael/Desktop/gitfiles/ai_tools_in_work/.agents/skills/mvc-context-gatherer
```

Expected: command exits successfully.

- [ ] **Step 3: Create `SKILL.md` and `zh-CN.md`**

Create the following files under `/Users/michael/Desktop/gitfiles/ai_tools_in_work/.agents/skills/` using the inline content below:

```patch
*** Begin Patch
*** Add File: mvc-context-gatherer/SKILL.md
+---
+name: mvc-context-gatherer
+description: Use when creating or refreshing a Cocos Creator PureMVC module workflow workspace.
+---
+
+# MVC Context Gatherer
+
+## Overview
+
+Build a module workflow workspace before implementation starts. This skill creates the module truth layer, initializes the workflow files, and stops before any business code is changed.
+
+## Inputs
+
+- Module intent or module name
+- Optional requirement document path
+- Current Cocos Creator PureMVC repository
+
+## Must Read
+
+- `CLAUDE.md`
+- `.claude/rules/*`
+- `assets/scripts/game/common/constants/UIManifest.ts`
+- `assets/scripts/game/controller/Commands.ts`
+- `assets/scripts/game/controller/cmd/startup/ModelPrepCmd.ts`
+- `assets/scripts/game/controller/cmd/startup/ViewPrepCmd.ts`
+- `assets/scripts/game/controller/cmd/startup/ControllerCmd.ts`
+- Existing Proxy, View, ViewId, Prefab, and Command resources discovered with repo-first search
+
+## Must Not
+
+- Do not implement business code.
+- Do not call executor-stage skills.
+- Do not modify real project source files.
+- Do not generate the workflow workspace before the user confirms repo-first findings.
+- Do not ask questions for information already found in the repository.
+
+## Workflow
+
+1. Run repo-first discovery for existing resources.
+2. Show the discovered Proxy, ViewId, Prefab, Command, and path findings to the user.
+3. Wait for user confirmation or correction.
+4. Ask only for missing information.
+5. Render templates into the module workflow directory.
+6. Initialize `_status.md` with Runtime, Layers, and SubModules.
+7. Report the workflow path, generated files, and next step `/mvc-executor`.
+
+## Required Discovery
+
+| Resource | Search target |
+|----------|---------------|
+| Proxy registrations | `ModelPrepCmd.ts` and `extends BaseProxy` |
+| ViewId values | `UIManifest.ts` |
+| UI manifest mappings | `UIManifest.ts` |
+| Prefabs | `assets/resources/gui/` and `assets/resources/common/prefab/` |
+| Notifications | `Commands.ts` |
+| Startup registration files | `ModelPrepCmd.ts`, `ViewPrepCmd.ts`, `ControllerCmd.ts` |
+
+## Stop Conditions
+
+Stop and wait for the user when:
+
+- The module requirement is too vague to name or scope.
+- A required project path cannot be found.
+- The user has not confirmed repo-first findings.
+- A requested child module would create deeper than parent-to-child nesting.
+
+## Final Output
+
+- Workflow workspace path
+- Generated file list
+- Initial `_status.md` summary
+- Any blocked reason
+- Next step: `/mvc-executor`
*** Add File: mvc-context-gatherer/zh-CN.md
+---
+name: mvc-context-gatherer
+description: 用于创建或刷新 Cocos Creator PureMVC 模块 workflow 工作区。
+---
+
+# MVC Context Gatherer
+
+## 概览
+
+在实现开始前创建模块 workflow 工作区。本 skill 负责建立模块真相层、初始化 workflow 文件，并在任何业务代码修改前停止。
+
+## 输入
+
+- 模块意图或模块名
+- 可选需求文档路径
+- 当前 Cocos Creator PureMVC 仓库
+
+## 必须读取
+
+- `CLAUDE.md`
+- `.claude/rules/*`
+- `assets/scripts/game/common/constants/UIManifest.ts`
+- `assets/scripts/game/controller/Commands.ts`
+- `assets/scripts/game/controller/cmd/startup/ModelPrepCmd.ts`
+- `assets/scripts/game/controller/cmd/startup/ViewPrepCmd.ts`
+- `assets/scripts/game/controller/cmd/startup/ControllerCmd.ts`
+- 通过 repo-first 搜索发现的已有 Proxy、View、ViewId、Prefab、Command 资源
+
+## 禁止事项
+
+- 不得实现业务代码。
+- 不得调用 executor 阶段 skill。
+- 不得修改真实项目源码。
+- 不得在用户确认 repo-first 探测结果前生成 workflow 工作区。
+- 不得追问仓库中已经探测到的信息。
+
+## 工作流程
+
+1. 对已有资源执行 repo-first 探测。
+2. 向用户展示已发现的 Proxy、ViewId、Prefab、Command 和路径结果。
+3. 等待用户确认或修正。
+4. 只追问缺失信息。
+5. 将 templates 渲染到模块 workflow 目录。
+6. 用 Runtime、Layers、SubModules 初始化 `_status.md`。
+7. 报告 workflow 路径、生成文件和下一步 `/mvc-executor`。
+
+## 必须探测
+
+| 资源 | 搜索目标 |
+|------|----------|
+| Proxy 注册 | `ModelPrepCmd.ts` 和 `extends BaseProxy` |
+| ViewId 值 | `UIManifest.ts` |
+| UI manifest 映射 | `UIManifest.ts` |
+| Prefab | `assets/resources/gui/` 和 `assets/resources/common/prefab/` |
+| 通知 | `Commands.ts` |
+| 启动注册文件 | `ModelPrepCmd.ts`、`ViewPrepCmd.ts`、`ControllerCmd.ts` |
+
+## 停止条件
+
+出现以下情况时停止并等待用户：
+
+- 模块需求模糊到无法命名或定界。
+- 必需项目路径无法找到。
+- 用户尚未确认 repo-first 探测结果。
+- 用户请求的子模块会产生超过父子两层的嵌套。
+
+## 最终输出
+
+- Workflow 工作区路径
+- 生成文件列表
+- 初始 `_status.md` 摘要
+- 任何 blocked reason
+- 下一步：`/mvc-executor`
*** End Patch
```

- [ ] **Step 4: Verify the gatherer docs**

Run:

```bash
rtk rg -n "name: mvc-context-gatherer|description: Use when creating|## Must Read|## Must Not|## Final Output" /Users/michael/Desktop/gitfiles/ai_tools_in_work/.agents/skills/mvc-context-gatherer/SKILL.md
rtk rg -n "description: 用于创建|## 必须读取|## 禁止事项|## 最终输出" /Users/michael/Desktop/gitfiles/ai_tools_in_work/.agents/skills/mvc-context-gatherer/zh-CN.md
```

Expected: both commands return matches for every pattern.

- [ ] **Step 5: Commit the gatherer skill docs**

Run:

```bash
rtk git -C /Users/michael/Desktop/gitfiles/ai_tools_in_work add .agents/skills/mvc-context-gatherer/SKILL.md .agents/skills/mvc-context-gatherer/zh-CN.md
rtk git -C /Users/michael/Desktop/gitfiles/ai_tools_in_work commit -m "feat: add mvc context gatherer skill"
```

Expected: commit succeeds with only the two gatherer docs staged.

### Task 2: Create `mvc-context-gatherer` Templates

**Files:**
- Create: `/Users/michael/Desktop/gitfiles/ai_tools_in_work/.agents/skills/mvc-context-gatherer/templates/_context.example.md`
- Create: `/Users/michael/Desktop/gitfiles/ai_tools_in_work/.agents/skills/mvc-context-gatherer/templates/_status.md`
- Create: `/Users/michael/Desktop/gitfiles/ai_tools_in_work/.agents/skills/mvc-context-gatherer/templates/_tree.md`
- Create: `/Users/michael/Desktop/gitfiles/ai_tools_in_work/.agents/skills/mvc-context-gatherer/templates/_constraint.md`
- Create: `/Users/michael/Desktop/gitfiles/ai_tools_in_work/.agents/skills/mvc-context-gatherer/templates/_ui-spec.md`
- Create: `/Users/michael/Desktop/gitfiles/ai_tools_in_work/.agents/skills/mvc-context-gatherer/templates/_dev_log.md`
- Create: `/Users/michael/Desktop/gitfiles/ai_tools_in_work/.agents/skills/mvc-context-gatherer/templates/00_init.md`
- Create: `/Users/michael/Desktop/gitfiles/ai_tools_in_work/.agents/skills/mvc-context-gatherer/templates/layers/01_spec.md`
- Create: `/Users/michael/Desktop/gitfiles/ai_tools_in_work/.agents/skills/mvc-context-gatherer/templates/layers/02_plan.md`
- Create: `/Users/michael/Desktop/gitfiles/ai_tools_in_work/.agents/skills/mvc-context-gatherer/templates/layers/03_execute.md`
- Create: `/Users/michael/Desktop/gitfiles/ai_tools_in_work/.agents/skills/mvc-context-gatherer/templates/layers/04_test.md`

- [ ] **Step 1: Verify template files do not exist yet**

Run:

```bash
rtk sh -lc 'test -f /Users/michael/Desktop/gitfiles/ai_tools_in_work/.agents/skills/mvc-context-gatherer/templates/_status.md'
```

Expected: FAIL because templates are not present before this task.

- [ ] **Step 2: Create template directories**

Run:

```bash
rtk mkdir -p /Users/michael/Desktop/gitfiles/ai_tools_in_work/.agents/skills/mvc-context-gatherer/templates/layers
```

Expected: command exits successfully.

- [ ] **Step 3: Create root templates**

Create the following files under `/Users/michael/Desktop/gitfiles/ai_tools_in_work/.agents/skills/` using the inline content below:

```patch
*** Begin Patch
*** Add File: mvc-context-gatherer/templates/_context.example.md
+# {{ModuleName}} 知识索引
+
+## 外部参考
+{{ExternalReferences}}
+
+## 路径约定
+- ViewId 枚举：`assets/scripts/game/common/constants/UIManifest.ts`
+- UI 配置注册：`assets/scripts/game/common/constants/UIManifest.ts`（`UI_MANIFEST`）
+- View 基类：`assets/core/gui/base/BaseView.ts`
+- Mediator 基类：`assets/scripts/core/base/BaseMeditor.ts`
+- Proxy 基类：`assets/scripts/core/base/BaseProxy.ts`
+- 通知常量：`assets/scripts/game/controller/Commands.ts`
+- PureMVC 注册入口：`assets/scripts/game/controller/cmd/startup/ModelPrepCmd.ts` / `ViewPrepCmd.ts` / `ControllerCmd.ts`
+- Prefab 目录：`assets/resources/gui/`、`assets/resources/common/prefab/`
+
+## 已有清单
+- 已注册 ViewId：{{DiscoveredViewIds}}
+- 已存在 Proxy：{{DiscoveredProxies}}
+- 已存在 Prefab：{{DiscoveredPrefabs}}
+- 已存在通知常量：{{DiscoveredCommands}}
+
+## 模块配置
+- 模块名称：`{{ModuleName}}`
+- 目标 ViewId：`{{ViewId}}`
+- 是否需要新建 Proxy：{{NeedsProxy}}
+- 相关通知常量：{{ModuleCommands}}
+
+## UI 配置
+- 是否有 UI：{{HasUI}}
+- UI 复杂度：{{UIComplexity}}
+
+## 子模块
+{{SubModules}}
+
+## 用户确认
+- repo-first 探测确认：{{DiscoveryConfirmedAt}}
+- 需求确认：{{RequirementConfirmedAt}}
*** Add File: mvc-context-gatherer/templates/_status.md
+# {{ModuleName}} 状态
+
+## Runtime
+| 字段 | 值 |
+|------|----|
+| current_layer | — |
+| current_step | — |
+| mode | auto |
+| blocked_reason | — |
+| updated_at | {{CreatedAt}} |
+
+## Layers
+| 层 | 状态 | step | retries | last_error |
+|----|------|------|---------|------------|
+| Proxy | {{ProxyInitialStatus}} | — | 0 | — |
+| View+Prefab | pending | — | 0 | — |
+| Mediator | pending | — | 0 | — |
+
+## SubModules
+| 子模块 | 状态 | blocked_reason |
+|--------|------|----------------|
+{{SubModuleStatusRows}}
+
+<!-- 状态枚举：pending | running | blocked | done | skipped | failed -->
+<!-- step 枚举：— | 01_spec | 02_plan | 03_execute | 04_test | integration -->
+<!-- 层 done/skipped 时 step = — -->
*** Add File: mvc-context-gatherer/templates/_tree.md
+# {{ModuleName}} 行为树
+
+Sequence: Proxy → View+Prefab → Mediator
+
+├── Proxy/
+│   Condition: needs_proxy? = {{NeedsProxy}}
+│   ├── true  → Execute
+│   └── false → Skip（_status = skipped）
+│
+├── View+Prefab/
+│   MUST: Proxy = done | skipped
+│   → Execute
+│
+└── Mediator/
+    MUST: View+Prefab = done
+    → Execute
*** Add File: mvc-context-gatherer/templates/_constraint.md
+# {{ModuleName}} 约束
+
+每项约束都是硬规则。违反 = 节点执行失败 → 三类回写。
+
+## 分层依赖
+
+```text
+View → Mediator → Proxy
+  ↓        ↓
+Prefab   Command
+```
+
+| # | 约束 | 说明 | 来源 |
+|---|------|------|------|
+| C1 | View 不直接引用 Proxy | View 通过 Mediator 访问数据 | agent 曾跳过 Mediator 直接读写 Proxy |
+| C2 | Mediator 不直接操作 Prefab | 通过 View 公开方法间接操作 UI | agent 曾在 Mediator 中直接 getChildByName |
+| C3 | Proxy 不引用 View/Mediator | Proxy 纯数据层 | 循环依赖导致 undefined |
+| C4 | Command 可编排 Proxy + Mediator | 业务编排者允许同时引用两者 | —（有意设计） |
+| C5 | ViewId 必须用枚举值 | `ViewId.SettingsPopup` 而非 `"SettingsPopup"` | agent 曾使用裸字符串导致注册失败 |
+| C6 | View 类必须 `@registerView` | 装饰器绑定 ViewId + prefab 路径 | agent 曾忘记装饰器导致 View 无法加载 |
+| C7 | Mediator 类必须 `@registerMediator` | 装饰器绑定 ViewId | agent 曾忘记装饰器导致通知无法路由 |
+| C8 | Proxy 必须 `extends BaseProxy` | 继承基类 | agent 曾直接继承 Proxy 导致 onRegister 未调用 |
+| C9 | Command 必须实现 `ICommand` 或继承 `SimpleCommand`/`MacroCommand` | 按项目已有模式选择 | agent 曾使用裸函数注册导致类型错误 |
+| C10 | 通知常量统一在 `Commands.ts` 声明 | 禁止裸字符串 | agent 曾在多处硬编码字符串导致拼写不一致 |
+| C11 | 常量命名空间隔离 | `Commands.UI.{{ModuleName}}.{Action}` | agent 曾把常量放在错误命名空间导致冲突 |
+| C12 | 注册顺序：Proxy → View → Mediator → Command | 违反则运行时 undefined | agent 曾在 Proxy 注册前实例化 Mediator |
+| C13 | UIManifest 映射：每个 ViewId 必须有 `UIViewConfig` | 缺失则模块不可加载 | agent 曾新增 ViewId 但忘记更新 manifest |
+| C14 | 所有 md 文档必须在 workflow 目录内 | 不散落到项目其他目录 | agent 曾把 spec 文件写入项目 docs/ 目录 |
+| C15 | 共享文件串行修改 | 同一父模块下，涉及全局注册/常量文件的 03_exec 必须 blocked 等待确认 | agent 曾多个子模块同时修改 Commands.ts 导致合并冲突 |
+| C16 | 子模块只允许一层 | 父 → 子，禁止孙模块 | agent 曾创建三层嵌套导致状态追踪失控 |
+| C17 | 父完成条件含子模块 | 父 done = 父三层 done + 所有子模块 done/skipped | agent 曾在子模块未完成时标记父模块 done |
*** Add File: mvc-context-gatherer/templates/_ui-spec.md
+# {{ModuleName}} UI 节点规格
+
+## 复杂度：{{UIComplexity}}
+
+<!-- 复杂度分级规则：
+  简单（≤5 节点）：只需节点树
+  中等（5-15 节点）：节点树 + 数据绑定 + 交互链路 + 显隐条件
+  复杂（>15 节点）：同上 + 逐节点交互说明
+-->
+
+## 节点树
+
+| 节点路径 | 组件类型 | 用途 | 来源 |
+|---------|---------|------|------|
+{{UINodeRows}}
+
+## 数据绑定
+<!-- 中等/复杂模块必填，简单模块可跳过 -->
+
+| 节点 | 字段来源（Proxy.字段） | 更新时机 |
+|------|----------------------|---------|
+{{UIBindingRows}}
+
+## 交互链路
+<!-- 中等/复杂模块必填，简单模块可跳过 -->
+
+| 触发节点 | 事件 | 目标通知 | 参数 |
+|---------|------|---------|------|
+{{UIInteractionRows}}
+
+## 显隐条件
+<!-- 中等/复杂模块必填，简单模块可跳过 -->
+
+| 节点 | 条件 | 备注 |
+|------|------|------|
+{{UIVisibilityRows}}
*** Add File: mvc-context-gatherer/templates/_dev_log.md
+# {{ModuleName}} 开发记录
+
+| 时间 | 事件 | 层 | step | 结果 |
+|------|------|----|------|------|
+| {{CreatedAt}} | init | — | — | workflow initialized |
*** Add File: mvc-context-gatherer/templates/00_init.md
+# {{ModuleName}} 初始化记录
+
+## Repo-first 探测摘要
+
+| 资源 | 结果 |
+|------|------|
+| Proxy | {{DiscoveredProxies}} |
+| ViewId | {{DiscoveredViewIds}} |
+| Prefab | {{DiscoveredPrefabs}} |
+| Commands | {{DiscoveredCommands}} |
+
+## 用户确认
+
+| 项 | 结论 |
+|----|------|
+| 探测结果 | {{DiscoveryConfirmation}} |
+| 模块名 | {{ModuleName}} |
+| ViewId | {{ViewId}} |
+| needs_proxy | {{NeedsProxy}} |
+| has_ui | {{HasUI}} |
+| ui_complexity | {{UIComplexity}} |
+| sub_modules | {{SubModules}} |
+
+## 初始化结果
+
+- 工作区：`{{WorkflowDir}}`
+- 创建时间：{{CreatedAt}}
+- 下一步：`/mvc-executor`
*** End Patch
```

- [ ] **Step 4: Create layer templates**

Create the following files under `/Users/michael/Desktop/gitfiles/ai_tools_in_work/.agents/skills/` using the inline content below:

```patch
*** Begin Patch
*** Add File: mvc-context-gatherer/templates/layers/01_spec.md
+# {{LayerName}} 01_spec
+
+## 输入
+- 模块：`{{ModuleName}}`
+- 层：`{{LayerName}}`
+- 真相层：`../_context.md`
+- 约束：`../_constraint.md`
+
+## 设计结论
+{{LayerSpec}}
+
+## 验收标准
+{{LayerAcceptance}}
+
+## 回写记录
+{{LayerSpecRewrites}}
*** Add File: mvc-context-gatherer/templates/layers/02_plan.md
+# {{LayerName}} 02_plan
+
+## 输入
+- Spec：`01_spec.md`
+- 状态：`../_status.md`
+- 约束：`../_constraint.md`
+
+## 实施任务
+{{LayerPlanTasks}}
+
+## 验证命令
+{{LayerVerificationCommands}}
+
+## 风险
+{{LayerRisks}}
*** Add File: mvc-context-gatherer/templates/layers/03_execute.md
+# {{LayerName}} 03_execute
+
+## 输入
+- Plan：`02_plan.md`
+- 状态：`../_status.md`
+
+## 执行摘要
+{{ExecutionSummary}}
+
+## 改动文件
+{{ChangedFiles}}
+
+## 失败与回写
+{{ExecutionRewrites}}
*** Add File: mvc-context-gatherer/templates/layers/04_test.md
+# {{LayerName}} 04_test
+
+## 输入
+- 执行记录：`03_execute.md`
+- 状态：`../_status.md`
+
+## 验证证据
+{{VerificationEvidence}}
+
+## 结果
+{{VerificationResult}}
+
+## 集成前风险
+{{PreIntegrationRisks}}
*** End Patch
```

- [ ] **Step 5: Verify template coverage**

Run:

```bash
rtk sh -lc 'for f in _context.example.md _status.md _tree.md _constraint.md _ui-spec.md _dev_log.md 00_init.md layers/01_spec.md layers/02_plan.md layers/03_execute.md layers/04_test.md; do test -f "/Users/michael/Desktop/gitfiles/ai_tools_in_work/.agents/skills/mvc-context-gatherer/templates/$f" || exit 1; done'
rtk rg -n "Runtime|Layers|SubModules|C17|{{ModuleName}}|01_spec|02_plan|03_execute|04_test" /Users/michael/Desktop/gitfiles/ai_tools_in_work/.agents/skills/mvc-context-gatherer/templates
```

Expected: first command exits successfully; second command returns matches from status, constraint, tree, and layer templates.

- [ ] **Step 6: Commit the gatherer templates**

Run:

```bash
rtk git -C /Users/michael/Desktop/gitfiles/ai_tools_in_work add .agents/skills/mvc-context-gatherer/templates
rtk git -C /Users/michael/Desktop/gitfiles/ai_tools_in_work commit -m "feat: add mvc workflow gatherer templates"
```

Expected: commit succeeds with only gatherer template files staged.

### Task 3: Create `mvc-executor` Skill Docs

**Files:**
- Create: `/Users/michael/Desktop/gitfiles/ai_tools_in_work/.agents/skills/mvc-executor/SKILL.md`
- Create: `/Users/michael/Desktop/gitfiles/ai_tools_in_work/.agents/skills/mvc-executor/zh-CN.md`

- [ ] **Step 1: Verify the executor skill does not exist yet**

Run:

```bash
rtk sh -lc 'test -f /Users/michael/Desktop/gitfiles/ai_tools_in_work/.agents/skills/mvc-executor/SKILL.md'
```

Expected: FAIL because the file is not present before this task.

- [ ] **Step 2: Create the executor skill directory**

Run:

```bash
rtk mkdir -p /Users/michael/Desktop/gitfiles/ai_tools_in_work/.agents/skills/mvc-executor
```

Expected: command exits successfully.

- [ ] **Step 3: Create `SKILL.md` and `zh-CN.md`**

Create the following files under `/Users/michael/Desktop/gitfiles/ai_tools_in_work/.agents/skills/` using the inline content below:

```patch
*** Begin Patch
*** Add File: mvc-executor/SKILL.md
+---
+name: mvc-executor
+description: Use when continuing or executing a prepared Cocos Creator PureMVC module workflow workspace.
+---
+
+# MVC Executor
+
+## Overview
+
+Execute a prepared MVC module workflow workspace one layer at a time. This skill trusts `_status.md` and `_tree.md` over conversation memory, advances low-risk steps automatically, and blocks when human steering is required.
+
+## Inputs
+
+- Module workflow directory containing `_tree.md`, `_status.md`, `_context.md`, and `_constraint.md`
+
+## Must Read
+
+- `_tree.md`
+- `_status.md`
+- `_context.md`
+- `_constraint.md`
+- Current layer files: `01_spec.md`, `02_plan.md`, `03_execute.md`, `04_test.md`
+
+## Must Not
+
+- Do not bypass `_status.md`.
+- Do not skip layers or steps.
+- Do not continue when any active layer is `blocked`.
+- Do not recollect information already confirmed by `mvc-context-gatherer`.
+- Do not directly edit `_tree.md` to change execution order.
+- Do not modify shared registration files while another module or child module is active without blocking for confirmation.
+
+## Recovery Algorithm
+
+1. Read `Runtime.current_layer` and `Runtime.current_step`.
+2. Validate Runtime against the corresponding row in Layers.
+3. If Runtime is valid and status is `running` or `failed`, continue or retry from that step.
+4. If Runtime is `blocked`, stop and show `blocked_reason`.
+5. If Runtime is missing or inconsistent, scan Layers for the first `running`, `blocked`, `failed`, or `pending` row.
+6. If all layers are `done` or `skipped`, set current step to `integration` and run integration verification.
+
+## Runtime Actions
+
+| Action | Use |
+|--------|-----|
+| `enter_step(layer, step)` | Start a layer step |
+| `complete_step(layer, next_step)` | Advance after successful step |
+| `skip_layer(layer, reason)` | Skip an unnecessary layer |
+| `block(layer, step, reason)` | Stop for human confirmation |
+| `fail(layer, step, error)` | Record failure and enter rewrite flow |
+| `reset_from(layer)` | Reset an affected layer and downstream layers |
+| `integration_pass()` | Mark integration success |
+| `integration_fail(error)` | Record integration failure |
+
+## Workflow
+
+1. Recover the starting point from `_status.md`.
+2. Check layer prerequisites from `_tree.md`.
+3. Execute `01_spec → 02_plan → 03_execute → 04_test`.
+4. Update `_status.md` through Runtime Actions after every step.
+5. Append `_dev_log.md` after every state change.
+6. Block on high-risk gates.
+7. Use the three rewrite paths for failures, new information, and requirement changes.
+8. Run integration verification after all layers are `done` or `skipped`.
+
+## Delegation Rules
+
+- `01_spec` → `/brainstorming`
+- `02_plan` → `/writing-plans`
+- `03_execute` → `/executing-plans` + `/test-driven-development`
+- `04_test` → `/verification`
+
+## High-Risk Gates
+
+Block when any of these occur:
+
+- Requirement change affects `_context.md` or generated specs.
+- Repository facts differ from `_context.md`.
+- Shared files such as `UIManifest.ts`, `Commands.ts`, `ModelPrepCmd.ts`, `ViewPrepCmd.ts`, or `ControllerCmd.ts` must be modified.
+- Parent completion depends on child modules that are not `done` or `skipped`.
+- C1-C17 constraints conflict with the implementation.
+- Integration verification fails.
+
+## Final Output
+
+- Current `_status.md` summary
+- Completed layer list
+- Blocked reason or integration verification result
+- Next action
*** Add File: mvc-executor/zh-CN.md
+---
+name: mvc-executor
+description: 用于继续或执行已经准备好的 Cocos Creator PureMVC 模块 workflow 工作区。
+---
+
+# MVC Executor
+
+## 概览
+
+逐层执行已经准备好的 MVC 模块 workflow 工作区。本 skill 相信 `_status.md` 和 `_tree.md`，不依赖会话记忆；低风险步骤自动推进，需要人类掌舵时进入 blocked。
+
+## 输入
+
+- 包含 `_tree.md`、`_status.md`、`_context.md` 和 `_constraint.md` 的模块 workflow 目录
+
+## 必须读取
+
+- `_tree.md`
+- `_status.md`
+- `_context.md`
+- `_constraint.md`
+- 当前层文件：`01_spec.md`、`02_plan.md`、`03_execute.md`、`04_test.md`
+
+## 禁止事项
+
+- 不得绕过 `_status.md`。
+- 不得跳过层或 step。
+- 任一活动层为 `blocked` 时不得继续。
+- 不得重新采集 `mvc-context-gatherer` 已确认的信息。
+- 不得直接编辑 `_tree.md` 来改变执行顺序。
+- 当其他模块或子模块处于活动状态时，不得在未 blocked 确认的情况下修改共享注册文件。
+
+## 恢复算法
+
+1. 读取 `Runtime.current_layer` 和 `Runtime.current_step`。
+2. 用 Layers 中的对应行校验 Runtime。
+3. 如果 Runtime 有效且状态为 `running` 或 `failed`，从该 step 继续或重试。
+4. 如果 Runtime 为 `blocked`，停止并展示 `blocked_reason`。
+5. 如果 Runtime 缺失或不一致，扫描 Layers 中第一个 `running`、`blocked`、`failed` 或 `pending` 行。
+6. 如果所有层都是 `done` 或 `skipped`，将当前 step 设为 `integration` 并执行集成验证。
+
+## Runtime Actions
+
+| Action | 用途 |
+|--------|------|
+| `enter_step(layer, step)` | 开始某层某 step |
+| `complete_step(layer, next_step)` | step 成功后推进 |
+| `skip_layer(layer, reason)` | 跳过不需要的层 |
+| `block(layer, step, reason)` | 停止等待人类确认 |
+| `fail(layer, step, error)` | 记录失败并进入回写流程 |
+| `reset_from(layer)` | 重置受影响层和下游层 |
+| `integration_pass()` | 标记集成成功 |
+| `integration_fail(error)` | 记录集成失败 |
+
+## 工作流程
+
+1. 从 `_status.md` 恢复起点。
+2. 根据 `_tree.md` 检查层前置条件。
+3. 执行 `01_spec → 02_plan → 03_execute → 04_test`。
+4. 每个 step 后通过 Runtime Actions 更新 `_status.md`。
+5. 每次状态变化后追加 `_dev_log.md`。
+6. 遇到高风险门禁时 blocked。
+7. 对失败、新信息和需求变更使用三类回写路径。
+8. 所有层为 `done` 或 `skipped` 后执行集成验证。
+
+## 委托规则
+
+- `01_spec` → `/brainstorming`
+- `02_plan` → `/writing-plans`
+- `03_execute` → `/executing-plans` + `/test-driven-development`
+- `04_test` → `/verification`
+
+## 高风险门禁
+
+以下情况必须 blocked：
+
+- 需求变更影响 `_context.md` 或已生成 spec。
+- 仓库事实与 `_context.md` 不一致。
+- 必须修改 `UIManifest.ts`、`Commands.ts`、`ModelPrepCmd.ts`、`ViewPrepCmd.ts` 或 `ControllerCmd.ts` 等共享文件。
+- 父模块完成依赖尚未 `done` 或 `skipped` 的子模块。
+- C1-C17 约束与实现冲突。
+- 集成验证失败。
+
+## 最终输出
+
+- 当前 `_status.md` 摘要
+- 已完成层列表
+- blocked reason 或集成验证结果
+- 下一步动作
*** End Patch
```

- [ ] **Step 4: Verify the executor docs**

Run:

```bash
rtk rg -n "name: mvc-executor|description: Use when continuing|## Recovery Algorithm|## Runtime Actions|## High-Risk Gates|## Final Output" /Users/michael/Desktop/gitfiles/ai_tools_in_work/.agents/skills/mvc-executor/SKILL.md
rtk rg -n "description: 用于继续|## 恢复算法|## 高风险门禁|## 最终输出" /Users/michael/Desktop/gitfiles/ai_tools_in_work/.agents/skills/mvc-executor/zh-CN.md
```

Expected: both commands return matches for every pattern.

- [ ] **Step 5: Commit the executor skill docs**

Run:

```bash
rtk git -C /Users/michael/Desktop/gitfiles/ai_tools_in_work add .agents/skills/mvc-executor/SKILL.md .agents/skills/mvc-executor/zh-CN.md
rtk git -C /Users/michael/Desktop/gitfiles/ai_tools_in_work commit -m "feat: add mvc executor skill"
```

Expected: commit succeeds with only the executor docs staged.

### Task 4: Verify Skill Package Integrity

**Files:**
- Test: `/Users/michael/Desktop/gitfiles/ai_tools_in_work/.agents/skills/mvc-context-gatherer/**`
- Test: `/Users/michael/Desktop/gitfiles/ai_tools_in_work/.agents/skills/mvc-executor/**`

- [ ] **Step 1: Run structural verification**

Run:

```bash
rtk sh -lc 'for f in mvc-context-gatherer/SKILL.md mvc-context-gatherer/zh-CN.md mvc-executor/SKILL.md mvc-executor/zh-CN.md; do test -f "/Users/michael/Desktop/gitfiles/ai_tools_in_work/.agents/skills/$f" || exit 1; done'
rtk sh -lc 'for f in _context.example.md _status.md _tree.md _constraint.md _ui-spec.md _dev_log.md 00_init.md layers/01_spec.md layers/02_plan.md layers/03_execute.md layers/04_test.md; do test -f "/Users/michael/Desktop/gitfiles/ai_tools_in_work/.agents/skills/mvc-context-gatherer/templates/$f" || exit 1; done'
```

Expected: both commands exit successfully.

- [ ] **Step 2: Verify required trigger and contract terms**

Run:

```bash
rtk rg -n "Use when|Must Not|Final Output|repo-first|_status.md|blocked|Runtime Actions|High-Risk Gates" /Users/michael/Desktop/gitfiles/ai_tools_in_work/.agents/skills/mvc-context-gatherer /Users/michael/Desktop/gitfiles/ai_tools_in_work/.agents/skills/mvc-executor
```

Expected: matches appear in both skills.

- [ ] **Step 3: Verify Chinese mirrors exist and reference the same core sections**

Run:

```bash
rtk rg -n "## 概览|## 输入|## 必须读取|## 禁止事项|## 最终输出" /Users/michael/Desktop/gitfiles/ai_tools_in_work/.agents/skills/mvc-context-gatherer/zh-CN.md /Users/michael/Desktop/gitfiles/ai_tools_in_work/.agents/skills/mvc-executor/zh-CN.md
```

Expected: matches appear in both `zh-CN.md` files.

- [ ] **Step 4: Run whitespace verification**

Run:

```bash
rtk git -C /Users/michael/Desktop/gitfiles/ai_tools_in_work diff --check -- .agents/skills/mvc-context-gatherer .agents/skills/mvc-executor
```

Expected: no output and exit code 0.

- [ ] **Step 5: Confirm the Cocos repo spec and plan remain unchanged by skill implementation**

Run:

```bash
rtk git status --short docs/superpowers/specs/2026-05-14-mvc-module-workflow-design.md docs/superpowers/plans/2026-05-14-mvc-module-workflow-skills.md
```

Expected: no changes to the spec; the plan may be tracked or already committed in the Cocos repo.

## Self-Review Checklist

- Spec coverage: Tasks 1 and 3 implement both `SKILL.md` skeletons; Task 2 implements Template Manifest; Task 4 verifies Runtime and high-risk gate terms.
- File coverage: Every file listed in the File Structure section has a create or verification step.
- TDD/documentation coverage: Each new skill package starts with a failing file-existence check, then creates the docs/templates, then verifies them.
- No extra runtime dependencies: templates are Markdown only.
- Cross-repo boundary: skill files are committed in `/Users/michael/Desktop/gitfiles/ai_tools_in_work`; this plan is committed in `/Users/michael/Desktop/gitfiles/Cocos-Creator-PureMvc-Framework`.
