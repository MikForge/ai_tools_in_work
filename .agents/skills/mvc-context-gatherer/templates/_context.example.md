# {{ModuleName}} 知识索引

## 外部参考
{{ExternalReferences}}

## 路径约定
- ViewId 枚举：`assets/scripts/game/common/constants/UIManifest.ts`
- UI 配置注册：`assets/scripts/game/common/constants/UIManifest.ts`（`UI_MANIFEST`）
- View 基类：`assets/core/gui/base/BaseView.ts`
- Mediator 基类：`assets/scripts/core/base/BaseMeditor.ts`
- Proxy 基类：`assets/scripts/core/base/BaseProxy.ts`
- 通知常量：`assets/scripts/game/controller/Commands.ts`
- PureMVC 注册入口：`assets/scripts/game/controller/cmd/startup/ModelPrepCmd.ts` / `ViewPrepCmd.ts` / `ControllerCmd.ts`
- Prefab 目录：`assets/resources/gui/`、`assets/resources/common/prefab/`

## 已有清单
- 已注册 ViewId：{{DiscoveredViewIds}}
- 已存在 Proxy：{{DiscoveredProxies}}
- 已存在 Prefab：{{DiscoveredPrefabs}}
- 已存在通知常量：{{DiscoveredCommands}}

## 模块配置
- 模块名称：`{{ModuleName}}`
- 目标 ViewId：`{{ViewId}}`
- 是否需要新建 Proxy：{{NeedsProxy}}
- 相关通知常量：{{ModuleCommands}}

## UI 配置
- 是否有 UI：{{HasUI}}
- UI 复杂度：{{UIComplexity}}

## 子模块
{{SubModules}}

## 用户确认
- repo-first 探测确认：{{DiscoveryConfirmedAt}}
- 需求确认：{{RequirementConfirmedAt}}
