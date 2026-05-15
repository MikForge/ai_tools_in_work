<!-- 适用角色：工作流（所有层） -->
<!-- 来源：agent 历史失败场景 -->

# 模块结构与边界约束

每项约束都是硬规则。违反 = 节点执行失败 → 三类回写。

## 硬规则

| # | 约束 | 违规后果 | 来源 |
|---|------|----------|------|
| C14 | 所有 md 文档必须在 workflow 目录内 | 不散落到项目其他目录 | agent 曾把 spec 文件写入项目 docs/ 目录 |
| C15 | 共享文件串行修改 | 同一父模块下，涉及全局注册/常量文件的 03_exec 必须 blocked 等待确认 | agent 曾多个子模块同时修改 Commands.ts 导致合并冲突 |
| C16 | 子模块只允许一层 | 父 → 子，禁止孙模块 | agent 曾创建三层嵌套导致状态追踪失控 |
| C17 | 父完成条件含子模块 | 父 done = 父三层 done + 所有子模块 done/skipped | agent 曾在子模块未完成时标记父模块 done |

## 共享文件清单（C15 触发文件）

修改以下任一文件时，03_exec 必须 blocked 等待确认：

- `assets/scripts/game/common/constants/UIManifest.ts`
- `assets/scripts/game/common/constants/Commands.ts`
- `assets/scripts/game/controller/cmd/startup/ModelPrepCmd.ts`
- `assets/scripts/game/controller/cmd/startup/ViewPrepCmd.ts`
- `assets/scripts/game/controller/cmd/startup/ControllerCmd.ts`
