---
name: mvc-context-gatherer
description: 用于创建或刷新 Cocos Creator PureMVC 模块 workflow 工作区。
---

# MVC Context Gatherer

## 概览

在实现开始前创建模块 workflow 工作区。本 skill 负责建立模块真相层、初始化 workflow 文件，并在任何业务代码修改前停止。

## 输入

- 模块意图或模块名
- 可选需求文档路径
- 当前 Cocos Creator PureMVC 仓库

## 必须读取

- `CLAUDE.md`
- `.claude/rules/*`
- `assets/scripts/game/common/constants/UIManifest.ts`
- `assets/scripts/game/controller/Commands.ts`
- `assets/scripts/game/controller/cmd/startup/ModelPrepCmd.ts`
- `assets/scripts/game/controller/cmd/startup/ViewPrepCmd.ts`
- `assets/scripts/game/controller/cmd/startup/ControllerCmd.ts`
- 通过 repo-first 搜索发现的已有 Proxy、View、ViewId、Prefab、Command 资源

## 禁止事项

- 不得实现业务代码。
- 不得调用 executor 阶段 skill。
- 不得修改真实项目源码。
- 不得在用户确认 repo-first 探测结果前生成 workflow 工作区。
- 不得追问仓库中已经探测到的信息。

## 工作流程

1. 对已有资源执行 repo-first 探测。
2. 向用户展示已发现的 Proxy、ViewId、Prefab、Command 和路径结果。
3. 等待用户确认或修正。
4. 只追问缺失信息。
5. 将 templates 渲染到模块 workflow 目录。
6. 用 Runtime、Layers、SubModules 初始化 `_status.md`。
7. 报告 workflow 路径、生成文件和下一步 `/mvc-executor`。

## 必须探测

| 资源 | 搜索目标 |
|------|----------|
| Proxy 注册 | `ModelPrepCmd.ts` 和 `extends BaseProxy` |
| ViewId 值 | `UIManifest.ts` |
| UI manifest 映射 | `UIManifest.ts` |
| Prefab | `assets/resources/gui/` 和 `assets/resources/common/prefab/` |
| 通知 | `Commands.ts` |
| 启动注册文件 | `ModelPrepCmd.ts`、`ViewPrepCmd.ts`、`ControllerCmd.ts` |

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
