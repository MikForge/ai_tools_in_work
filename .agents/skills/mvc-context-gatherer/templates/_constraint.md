# {{ModuleName}} 约束

每项约束都是硬规则。违反 = 节点执行失败 → 三类回写。

## 分层依赖

```text
View → Mediator → Proxy
  ↓        ↓
Prefab   Command
```

| # | 约束 | 说明 | 来源 |
|---|------|------|------|
| C1 | View 不直接引用 Proxy | View 通过 Mediator 访问数据 | agent 曾跳过 Mediator 直接读写 Proxy |
| C2 | Mediator 不直接操作 Prefab | 通过 View 公开方法间接操作 UI | agent 曾在 Mediator 中直接 getChildByName |
| C3 | Proxy 不引用 View/Mediator | Proxy 纯数据层 | 循环依赖导致 undefined |
| C4 | Command 可编排 Proxy + Mediator | 业务编排者允许同时引用两者 | —（有意设计） |
| C5 | ViewId 必须用枚举值 | `ViewId.SettingsPopup` 而非 `"SettingsPopup"` | agent 曾使用裸字符串导致注册失败 |
| C6 | View 类必须 `@registerView` | 装饰器绑定 ViewId + prefab 路径 | agent 曾忘记装饰器导致 View 无法加载 |
| C7 | Mediator 类必须 `@registerMediator` | 装饰器绑定 ViewId | agent 曾忘记装饰器导致通知无法路由 |
| C8 | Proxy 必须 `extends BaseProxy` | 继承基类 | agent 曾直接继承 Proxy 导致 onRegister 未调用 |
| C9 | Command 必须实现 `ICommand` 或继承 `SimpleCommand`/`MacroCommand` | 按项目已有模式选择 | agent 曾使用裸函数注册导致类型错误 |
| C10 | 通知常量统一在 `Commands.ts` 声明 | 禁止裸字符串 | agent 曾在多处硬编码字符串导致拼写不一致 |
| C11 | 常量命名空间隔离 | `Commands.UI.{{ModuleName}}.{Action}` | agent 曾把常量放在错误命名空间导致冲突 |
| C12 | 注册顺序：Proxy → View → Mediator → Command | 违反则运行时 undefined | agent 曾在 Proxy 注册前实例化 Mediator |
| C13 | UIManifest 映射：每个 ViewId 必须有 `UIViewConfig` | 缺失则模块不可加载 | agent 曾新增 ViewId 但忘记更新 manifest |
| C14 | 所有 md 文档必须在 workflow 目录内 | 不散落到项目其他目录 | agent 曾把 spec 文件写入项目 docs/ 目录 |
| C15 | 共享文件串行修改 | 同一父模块下，涉及全局注册/常量文件的 03_exec 必须 blocked 等待确认 | agent 曾多个子模块同时修改 Commands.ts 导致合并冲突 |
| C16 | 子模块只允许一层 | 父 → 子，禁止孙模块 | agent 曾创建三层嵌套导致状态追踪失控 |
| C17 | 父完成条件含子模块 | 父 done = 父三层 done + 所有子模块 done/skipped | agent 曾在子模块未完成时标记父模块 done |
