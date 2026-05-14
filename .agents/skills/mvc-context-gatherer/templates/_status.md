# {{ModuleName}} 状态

## Runtime
| 字段 | 值 |
|------|----|
| current_layer | — |
| current_step | — |
| mode | auto |
| blocked_reason | — |
| updated_at | {{CreatedAt}} |

## Layers
| 层 | 状态 | step | retries | last_error |
|----|------|------|---------|------------|
| Proxy | {{ProxyInitialStatus}} | — | 0 | — |
| View+Prefab | pending | — | 0 | — |
| Mediator | pending | — | 0 | — |

## SubModules
| 子模块 | 状态 | blocked_reason |
|--------|------|----------------|
{{SubModuleStatusRows}}

<!-- 状态枚举：pending | running | blocked | done | skipped | failed -->
<!-- step 枚举：— | 01_spec | 02_plan | 03_execute | 04_test | integration -->
<!-- 层 done/skipped 时 step = — -->
