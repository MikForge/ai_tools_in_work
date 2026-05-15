<!-- 适用角色：Mediator -->
<!-- 来源：agent 历史失败场景 -->

# Mediator 约束

每项约束都是硬规则。违反 = 节点执行失败 → 三类回写。

## 硬规则

| # | 约束 | 违规后果 | 来源 |
|---|------|----------|------|
| C2 | Mediator 不直接操作 Prefab | 通过 View 公开方法间接操作 UI | agent 曾在 Mediator 中直接 getChildByName |
| C5 | ViewId 必须用枚举值 | `ViewId.SettingsPopup` 而非 `"SettingsPopup"` | agent 曾使用裸字符串导致注册失败 |
| C7 | Mediator 类必须 `@registerMediator` | 装饰器绑定 ViewId | agent 曾忘记装饰器导致通知无法路由 |

## 搜索模式
- 检测 C2 违规：grep Mediator 文件中是否使用 `getChildByName` / `getComponent` 直接操作 UI
- 检测 C5 违规：grep Mediator 文件中是否出现裸字符串代替 ViewId 枚举
- 检测 C7 违规：grep Mediator 文件中是否缺少 `@registerMediator` 装饰器
