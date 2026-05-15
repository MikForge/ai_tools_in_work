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
| Command | {{CommandInitialStatus}} | — | 0 | — |

## Integration
| 字段 | 值 |
|------|----|
| status | pending |
| verified_at | — |
| result | — |

## SubModules
| 子模块 | 状态 | blocked_reason |
|--------|------|----------------|
{{SubModuleStatusRows}}

<!-- 状态枚举：pending | running | blocked | done | skipped | failed -->
<!-- step 枚举：— | 01_spec | 02_plan | 03_execute | 04_test | integration -->
<!-- 层 done/skipped 时 step = — -->
<!-- last_error 表示当前未解决错误；层 done/skipped 时必须清空为 —，历史错误写入 _dev_log.md -->
