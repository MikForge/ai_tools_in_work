---
name: mvc-executor
description: 用于继续或执行已经准备好的 Cocos Creator PureMVC 模块 workflow 工作区。
---

# MVC Executor

## 概览

逐层执行已经准备好的 MVC 模块 workflow 工作区。本 skill 相信 `_status.md` 和 `_tree.md`，不依赖会话记忆；低风险步骤自动推进，需要人类掌舵时进入 blocked。

## 输入

- 包含 `_tree.md`、`_status.md`、`_context.md` 和 `_constraint.md` 的模块 workflow 目录

## 必须读取

- `_tree.md`
- `_status.md`
- `_context.md`
- `_constraint.md`
- 当前层文件：`01_spec.md`、`02_plan.md`、`03_execute.md`、`04_test.md`

## 禁止事项

- 不得绕过 `_status.md`。
- 不得跳过层或 step。
- 任一活动层为 `blocked` 时不得继续。
- 不得重新采集 `mvc-context-gatherer` 已确认的信息。
- 不得直接编辑 `_tree.md` 来改变执行顺序。
- 当其他模块或子模块处于活动状态时，不得在未 blocked 确认的情况下修改共享注册文件。

## 恢复算法

1. 读取 `Runtime.current_layer` 和 `Runtime.current_step`。
2. 用 Layers 中的对应行校验 Runtime。
3. 如果 Runtime 有效且状态为 `running` 或 `failed`，从该 step 继续或重试。
4. 如果 Runtime 为 `blocked`，停止并展示 `blocked_reason`。
5. 如果 Runtime 缺失或不一致，扫描 Layers 中第一个 `running`、`blocked`、`failed` 或 `pending` 行。
6. 如果所有层都是 `done` 或 `skipped`，将当前 step 设为 `integration` 并执行集成验证。

## Runtime Actions

| Action | 用途 |
|--------|------|
| `enter_step(layer, step)` | 开始某层某 step |
| `complete_step(layer, next_step)` | step 成功后推进 |
| `skip_layer(layer, reason)` | 跳过不需要的层 |
| `block(layer, step, reason)` | 停止等待人类确认 |
| `fail(layer, step, error)` | 记录失败并进入回写流程 |
| `reset_from(layer)` | 重置受影响层和下游层 |
| `integration_pass()` | 标记集成成功 |
| `integration_fail(error)` | 记录集成失败 |

## 工作流程

1. 从 `_status.md` 恢复起点。
2. 根据 `_tree.md` 检查层前置条件。
3. 执行 `01_spec → 02_plan → 03_execute → 04_test`。
4. 每个 step 后通过 Runtime Actions 更新 `_status.md`。
5. 每次状态变化后追加 `_dev_log.md`。
6. 遇到高风险门禁时 blocked。
7. 对失败、新信息和需求变更使用三类回写路径。
8. 所有层为 `done` 或 `skipped` 后执行集成验证。

## 委托规则

- `01_spec` → `/brainstorming`
- `02_plan` → `/writing-plans`
- `03_execute` → `/executing-plans` + `/test-driven-development`
- `04_test` → `/verification`

## 高风险门禁

以下情况必须 blocked：

- 需求变更影响 `_context.md` 或已生成 spec。
- 仓库事实与 `_context.md` 不一致。
- 必须修改 `UIManifest.ts`、`Commands.ts`、`ModelPrepCmd.ts`、`ViewPrepCmd.ts` 或 `ControllerCmd.ts` 等共享文件。
- 父模块完成依赖尚未 `done` 或 `skipped` 的子模块。
- C1-C17 约束与实现冲突。
- 集成验证失败。

## 最终输出

- 当前 `_status.md` 摘要
- 已完成层列表
- blocked reason 或集成验证结果
- 下一步动作
