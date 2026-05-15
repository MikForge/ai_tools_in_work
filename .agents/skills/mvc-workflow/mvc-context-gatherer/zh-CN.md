---
name: mvc-context-gatherer
description: 用于创建或刷新 Cocos Creator PureMVC 模块 workflow 工作区。
---

# MVC Context Gatherer

## 角色

在实现开始前创建或刷新模块 workflow 工作区。建立模块真相层、初始化 workflow 结构，并在任何业务源码修改前停止。

## 输入

- 模块意图或模块名
- 可选需求文档路径
- 当前 Cocos Creator PureMVC 仓库

## 必须读取

- `CLAUDE.md`
- `.claude/rules/*`
- `docs/mvc-workflows/INDEX.md`
- `docs/mvc-workflows/BaseContext/INDEX.md`
- `docs/mvc-workflows/constraint/INDEX.md`

## 禁止事项

- 不得实现业务代码。
- 不得调用 executor 阶段 skill。
- 不得修改真实项目源码。
- 不得在用户确认 repo-first 探测结果前生成 workflow 工作区。
- 不得追问仓库中已经探测到的信息。
- 不得复制 `docs/mvc-workflows/` 中的架构或约束细节。

## 工作流程

1. 加载 workflow 索引。
2. 校验索引中的 BaseContext 文件及其权威源码路径是否存在。
3. 如果 BaseContext 缺失或疑似过期，将告警写入 `00_init.md` 并先询问用户。
4. 通过 `BaseContext/INDEX.md` 选择 repo-first 探测需要的架构参考。
5. 先探测仓库已有资源，再向用户提问。
6. 展示探测结果，等待用户确认或修正。
7. 只追问仓库无法确定的模块事实。
8. 通过 `constraint/INDEX.md` 标记本模块适用的约束。
9. 将模板渲染到 `docs/mvc-workflows/<ModuleName>/`。
10. 创建 `Proxy`、`View+Prefab`、`Mediator` 和可选 `Command` 层目录。
11. 初始化 `_context.md`、`_tree.md`、`_status.md`、`_constraint.md` 和 `_dev_log.md`。
12. 报告生成的工作区和下一步动作。

## 停止条件

- 模块需求模糊到无法命名或定界。
- 必需项目路径无法找到。
- BaseContext 索引条目或权威源码路径无法找到。
- 用户尚未确认 repo-first 探测结果。
- 用户请求的子模块会产生超过父子两层的嵌套。

## 最终输出

- Workflow 工作区路径
- 生成文件列表
- 初始 `_status.md` 摘要
- blocked reason，如有
- 下一步：`mvc-executor`
