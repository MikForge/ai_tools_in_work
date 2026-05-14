---
name: mvc-context-gatherer
description: 用于创建或刷新 Cocos Creator PureMVC 模块 workflow 工作区。
---

# MVC Context Gatherer

## 概览

在实现开始前创建模块 workflow 工作区。本 skill 负责建立模块真相层、初始化 workflow 文件，并在任何业务代码修改前停止。

**架构知识存放在 `docs/mvc-workflows/BaseContext/` — 本 skill 只引用，不复制。**

## 输入

- 模块意图或模块名
- 可选需求文档路径
- 当前 Cocos Creator PureMVC 仓库

## 必须读取

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

## 禁止事项

- 不得实现业务代码。
- 不得调用 executor 阶段 skill。
- 不得修改真实项目源码。
- 不得在用户确认 repo-first 探测结果前生成 workflow 工作区。
- 不得追问仓库中已经探测到的信息。
- 不得内联架构模式 — 从 `docs/mvc-workflows/BaseContext/` 读取。

## 冷启动

Phase A 之前检查 `docs/mvc-workflows/BaseContext/` 是否有内容：

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

## 工作流程

### Phase A：Repo-First 探测

1. 读取 `docs/mvc-workflows/BaseContext/*.md` 学习搜索模式。
2. 使用模式搜索仓库：
   - 已有 Proxy：读 `ModelPrepCmd.ts` → grep `registerProxy`
   - 已有 ViewId：读 `UIManifest.ts` → ViewId 枚举
   - 已有 UI 配置：读 `UIManifest.ts` → UI_MANIFEST
   - 已有 Command：grep `ControllerCmd.ts` + `ViewPrepCmd.ts` → `registerCommand`
   - 已有 Prefab：ls `assets/resources/gui/` + `common/prefab/`
   - 已有通知常量：读 `Commands.ts` → namespace
3. 向用户展示探测结果，等待确认或修正。

### Phase B：蘇格拉底式 Q&A

4. 读取 `docs/mvc-workflows/constraint/*.md` 辅助提问。
5. 只追问仓库无法确定的信息：
   - 模块名称（PascalCase）
   - 目标 ViewId（新 or 复用已有）
   - 是否需要新建 Proxy？（比对已有清单）
   - 是否有子模块？列出子模块名列表
   - 是否有 UI？→ 标记复杂度：简单 / 中等 / 复杂
   - 相关通知常量
   - 任何外部参考文档

### Phase C：渲染模板

6. 将 `templates/` 渲染到 `docs/mvc-workflows/<ModuleName>/`。
7. 用 Runtime、Layers、SubModules 初始化 `_status.md`。
8. 创建层目录（Proxy/ View+Prefab/ Mediator/）。

### Phase D：报告

9. 报告 workflow 路径、生成文件、初始 `_status.md` 摘要、下一步 `/mvc-executor`。

## 停止条件

出现以下情况时停止并等待用户：

- 模块需求模糊到无法命名或定界。
- 必需项目路径无法找到。
- 用户尚未确认 repo-first 探测结果。
- 用户请求的子模块会产生超过父子两层的嵌套。

## 最终输出

- Workflow 工作区路径
- 生成文件列表
- 初始 `_status.md` 摘要
- 任何 blocked reason
- 下一步：`/mvc-executor`
