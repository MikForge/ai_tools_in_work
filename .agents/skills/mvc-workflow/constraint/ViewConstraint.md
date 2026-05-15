<!-- 适用角色：View + Prefab -->
<!-- 来源：agent 历史失败场景 -->

# View 约束

每项约束都是硬规则。违反 = 节点执行失败 → 三类回写。

## 硬规则

| # | 约束 | 违规后果 | 来源 |
|---|------|----------|------|
| C1 | View 不直接引用 Proxy | View 通过 Mediator 访问数据 | agent 曾跳过 Mediator 直接读写 Proxy |
| C5 | ViewId 必须用枚举值 | `ViewId.SettingsPopup` 而非 `"SettingsPopup"` | agent 曾使用裸字符串导致注册失败 |
| C6 | View 类必须 `@registerView` | 装饰器绑定 ViewId + prefab 路径 | agent 曾忘记装饰器导致 View 无法加载 |
| C13 | UIManifest 映射：每个 ViewId 必须有 `UIViewConfig` | 缺失则模块不可加载 | agent 曾新增 ViewId 但忘记更新 manifest |

## 搜索模式
- 检测 C1 违规：grep View 文件中是否 import Proxy
- 检测 C5 违规：grep View/Mediator 文件中是否出现裸字符串代替 ViewId 枚举
- 检测 C6 违规：grep View 类文件中是否缺少 `@registerView` 装饰器
- 检测 C13 违规：比对 ViewId 枚举值与 UI_MANIFEST 中的 key 是否一一对应
