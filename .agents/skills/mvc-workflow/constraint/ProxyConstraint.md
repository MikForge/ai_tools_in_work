<!-- 适用角色：Proxy -->
<!-- 来源：agent 历史失败场景 -->

# Proxy 约束

每项约束都是硬规则。违反 = 节点执行失败 → 三类回写。

## 硬规则

| # | 约束 | 违规后果 | 来源 |
|---|------|----------|------|
| C3 | Proxy 不引用 View/Mediator | 循环依赖 → undefined | agent 曾在 Proxy 中 import MainViewMediator |
| C8 | Proxy 必须 `extends BaseProxy` | onRegister 未调用 → 数据未初始化 | agent 曾直接继承 Proxy 类导致生命周期未触发 |

## 搜索模式
- 检测 C3 违规：grep Proxy 文件中是否 import View/Mediator 路径
- 检测 C8 违规：grep Proxy 文件中非 `extends BaseProxy` 的 Proxy 声明
