<!-- 适用角色：所有角色 -->
<!-- 来源：agent 历史失败场景 -->

# 注册顺序与清单约束

每项约束都是硬规则。违反 = 节点执行失败 → 三类回写。

## 硬规则

| # | 约束 | 违规后果 | 来源 |
|---|------|----------|------|
| C12 | 注册顺序：Proxy → View → Mediator → Command | 违反则运行时 undefined | agent 曾在 Proxy 注册前实例化 Mediator |
| C13 | UIManifest 映射：每个 ViewId 必须有 `UIViewConfig` | 缺失则模块不可加载 | agent 曾新增 ViewId 但忘记更新 manifest |

## 注册完整性检查清单

| 类类型 | 注册位置 | 注册方式 |
|--------|----------|----------|
| Proxy | `ModelPrepCmd.ts` | `this.facade.registerProxy(new XxxProxy())` |
| Mediator | `ViewPrepCmd.ts` 或 `@registerMediator` | `this.facade.registerMediator(new XxxMediator())` |
| Command | `ControllerCmd.ts` | `this.facade.registerCommand(Commands.XXX, () => new XxxCmd())` |

## 搜索模式
- 检测 C12 违规：检查 `_tree.md` 是否遵循 Proxy → View+Prefab → Mediator 的 Sequence
- 检测 C13 违规：比对 `UIManifest.ts` 中 ViewId 枚举与 UI_MANIFEST 的 key 集合
