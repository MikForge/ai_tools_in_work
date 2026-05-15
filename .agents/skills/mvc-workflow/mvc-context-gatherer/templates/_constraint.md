# {{ModuleName}} 约束适用清单

继承自 [约束索引](../constraint/INDEX.md)，gatherer 按模块配置标记适用性。

| 约束文件 | 适用 | 原因/备注 |
|----------|------|-----------|
| [ProxyConstraint](../constraint/ProxyConstraint.md) | {{#if needs_proxy}}✓{{else}}—{{/if}} | {{ProxyApplicability}} |
| [ViewConstraint](../constraint/ViewConstraint.md) | {{#if has_ui}}✓{{else}}—{{/if}} | {{ViewApplicability}} |
| [MediatorConstraint](../constraint/MediatorConstraint.md) | {{#if has_mediator}}✓{{else}}—{{/if}} | {{MediatorApplicability}} |
| [CommandConstraint](../constraint/CommandConstraint.md) | {{#if new_command}}✓{{else}}—{{/if}} | {{CommandApplicability}} |
| [NotificationConstraint](../constraint/NotificationConstraint.md) | {{#if new_notifications}}✓{{else}}—{{/if}} | {{NotificationReason}} |
| [RegistrationConstraint](../constraint/RegistrationConstraint.md) | ✓ | 全部模块需注册 |
| [ModuleStructureConstraint](../constraint/ModuleStructureConstraint.md) | ✓ | 文件边界 + 父子结构 |

## 本模块特有限制
- {{#if special_constraints}}{{SpecialConstraints}}{{else}}无{{/if}}
