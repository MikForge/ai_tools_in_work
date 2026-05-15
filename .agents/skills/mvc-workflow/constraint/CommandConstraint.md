<!-- 适用角色：Command -->
<!-- 来源：agent 历史失败场景 -->

# Command 约束

每项约束都是硬规则。违反 = 节点执行失败 → 三类回写。

## 硬规则

| # | 约束 | 违规后果 | 来源 |
|---|------|----------|------|
| C4 | Command 可编排 Proxy + Mediator | 业务编排者允许同时引用两者 | —（有意设计） |
| C9 | Command 必须实现 `ICommand` 或继承 `SimpleCommand`/`MacroCommand` | 按项目已有模式选择 | agent 曾使用裸函数注册导致类型错误 |

## 搜索模式
- 检测 C4 合规：Command 可同时 import Proxy 和 Mediator（非违规）
- 检测 C9 违规：grep `registerCommand` 调用中工厂函数返回类型是否为 `SimpleCommand`/`MacroCommand`
