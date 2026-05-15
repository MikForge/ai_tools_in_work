# _context.example.md

> 模板。`mvc-context-gatherer` skill 逐项提问，将答案替换 `<!-- ASK -->` 占位符后写入目标节点的 `_context.md`。

## 外部参考

- [Harness Engineering](../../../knowledgebase/harness-engineering.md)
<!-- ASK: 有无额外参考文档？MVC 框架文档、项目 wiki、团队编码规范？ -->

## 路径约定

<!-- ASK: 逐项确认以下路径在当前项目中是否正确，不正确的请提供实际路径 -->

- ViewId 枚举：`app/common/GameViewId.ts`
- 注册入口：`app/scene/UIManifest.ts`
- View 基类：`app/mvc/BaseView.ts`
- Mediator 基类：`app/mvc/BaseMediator.ts`
- Proxy 基类：`app/mvc/BaseProxy.ts`
- 通知常量：`app/mvc/Commands.ts`
- Prefab 目录：`assets/prefabs/ui/`

<!-- ASK: 是否还有其他约定路径？（如常量文件、UI 配置文件） -->

## 已有清单

<!-- ASK: 逐项确认清单是否完整 -->

### 已注册 ViewId

<!-- ASK: 列出项目中所有已注册的 ViewId -->

### 已有 Proxy

<!-- ASK: 列出所有已有的 Proxy 类，注明各自负责的数据域 -->

### 已有 Mediator

<!-- ASK: 列出所有已有的 Mediator 类，注明各自绑定的 View -->

## 命名约定

<!-- ASK: 确认命名规范 -->

- View 类：`{ModuleName}View.ts`
- Mediator 类：`{ModuleName}Mediator.ts`
- Proxy 类：`{ModuleName}Proxy.ts`
- Prefab 文件：`{ModuleName}.prefab`
- ViewId 枚举值：`{ModuleName}`

## 模块清单（仅父节点需要）

<!-- ASK: 如果这是一个父节点（如 MainUI），列出需要包含的所有子模块 -->

<!-- 子模块名称和简要描述 -->

## 当前状态

<!-- ASK: 这次要完成的具体目标是什么？新建模块？修改已有模块？ -->
