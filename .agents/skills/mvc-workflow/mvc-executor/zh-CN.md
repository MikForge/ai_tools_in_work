---
name: mvc-executor
description: 用于继续或执行已经准备好的 Cocos Creator PureMVC 模块 workflow 工作区。
---

# MVC Executor

## 角色

通过可恢复的层级 step 执行已经准备好的 MVC 模块 workflow 工作区。相信 workflow 文件而不是会话记忆，保留反馈回路，并在需要人类掌舵时 blocked。

## 输入

- 包含 `_tree.md`、`_status.md`、`_context.md` 和 `_constraint.md` 的模块 workflow 目录

## 必须读取

- `CLAUDE.md`
- `docs/mvc-workflows/INDEX.md`
- 当前工作区 `_tree.md`
- 当前工作区 `_status.md`
- 当前工作区 `_context.md`
- 当前工作区 `_constraint.md`

通过 `BaseContext/INDEX.md` 和 `constraint/INDEX.md` 只加载当前层需要的架构与约束参考。

## 禁止事项

- 不得绕过 `_status.md`。
- 不得跳过层或 step。
- 任一活动层为 `blocked` 时不得继续。
- 不得重新采集 `mvc-context-gatherer` 已确认的信息。
- 不得直接编辑 `_tree.md` 来改变执行顺序。
- 不得在未 blocked 确认的情况下修改共享注册文件。
- 不得复制 `docs/mvc-workflows/` 中的架构或约束细节。

## Runtime Loop

1. 从 `_status.md` 恢复 `current_layer` 和 `current_step`。
2. 用 `_tree.md` 和 Layers 表校验 runtime 状态。
3. 如果 runtime 缺失或不一致，从第一个 `running`、`blocked`、`failed` 或 `pending` 层恢复。
4. 如果活动层为 `blocked`，停止并报告 `blocked_reason`。
5. 通过索引加载当前层 BaseContext 和 constraint 文件。
6. 按 `_tree.md` 顺序执行活动层。
7. 每个活动层执行 `01_spec -> 02_plan -> 03_execute -> 04_test`。
8. 每次转换后更新 `_status.md`。
9. 每次状态变化后追加 `_dev_log.md`。
10. 所有层为 `done` 或 `skipped` 后执行集成验证。

## Block Gates

以下情况必须 blocked：

- 需求变更影响 `_context.md` 或已生成 spec。
- 仓库事实与 `_context.md` 不一致。
- 必须修改 `UIManifest.ts`、`Commands.ts`、`ModelPrepCmd.ts`、`ViewPrepCmd.ts` 或 `ControllerCmd.ts` 等共享文件。
- 父模块完成依赖尚未 `done` 或 `skipped` 的子模块。
- 已加载约束与实现冲突。
- 层验证或集成验证失败。

## 最终输出

- 当前 `_status.md` 摘要
- 已完成层列表
- blocked reason 或集成验证结果
- 下一步动作
