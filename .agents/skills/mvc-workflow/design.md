# MVC Module Workflow 设计

> 知识索引：[Harness Engineering](../../knowledgebase/harness-engineering.md)

## 总纲

本 workflow 以 **2 个独立 skill** 落地：

| # | Skill | 职责 |
|---|-------|------|
| 1 | `mvc-context-gatherer` | repo-first 探测 + 缺口追问，建立模块真相层与 workflow 工作区 |
| 2 | `mvc-executor` | 混合编排器：自动推进低风险步骤，高风险门禁暂停确认 |

**核心悖论**：更大的 AI 自主权需要更严格的运行时约束。
**第一原则**：瓶颈在基础设施，不在模型智能。

**操作模型**：人类掌舵，智能体执行（Human Steer, Agent Execute）。

**落地策略**：强机读、强模板、强恢复。文件格式、状态枚举、停止条件、回写动作尽量固定，让 agent 按合同执行，而不是靠自由发挥。

### 三种入口

| 入口模式 | 路径 | 场景 |
|---------|------|------|
| 新模块 | `/mvc-context-gatherer` → `/mvc-executor` | 从零开始建一个模块 |
| 继续开发 | `/mvc-executor` | 读 `_status.md` 自动定位 running/pending 层，从断点恢复 |
| 更新上下文 | `/mvc-context-gatherer` | 结构性变化（增加子模块、Proxy 策略变化），手动更新 `_context.md` |

### 执行模式

`mvc-executor` 采用 **混合编排器** 模式：

- 默认自动推进 `01_spec → 02_plan → 03_execute → 04_test`，并维护 `_status.md` 与 `_dev_log.md`
- 遇到会改变真相层、影响共享文件、跨模块聚合、违反硬约束或集成验证失败的动作，必须写入 `blocked_reason` 并暂停等待用户确认
- 恢复执行时只信 `_status.md` 与 `_tree.md`，不依赖会话记忆

### 两条核心原则（从旧链路吸收）

**真相层原则**：`_context.md` 是该模块的单一真相源。任何执行中发现上下文不准确，必须先回写 `_context.md`，再继续当前层。

**repo-first 原则**：gatherer 先用 grep 探测仓库已有资源，展示探测结果让用户确认/修正，只有确认缺失的才追问。

## 2-skill 体系

```text
mvc-context-gatherer                         mvc-executor
─────────────────────                        ─────────────────────
G1: 上下文工程                               G2+G3+G4: 执行闭环
                                               
repo-first 探测（grep → 展示 → 确认）        读 _tree.md → 逐层循环
蘇格拉底式 Q&A（仅追问缺失）                 每层前置检查（读 _status.md）
写入 _context.md（真相层）                   委托已有 skill（01→04）：
生成 _tree.md（Sequence: Proxy→View→Mediator） 01_spec  → /brainstorming
生成 _status.md（可恢复状态机）                02_plan  → /writing-plans
生成 _constraint.md（C1-C17）                   03_exec  → /executing-plans + TDD
生成 _dev_log.md（空）                          04_test  → /verification
创建完整目录结构                             更新 _status.md（Runtime + Layers）
处理子模块空目录                             三类回写（失败/新信息/需求变更）
                                             所有层 done/skipped → 集成验证
```

## Skill 详情

### 1. mvc-context-gatherer

**触发**：用户表达"创建/开发 MVC 模块"意图。

**前置检查**：无。入口 skill。不得进入实现，不调用 plan/execute/test。

**执行协议**：

**Phase A — repo-first 探测**：

```text
1. grep 项目 → 探测已有资源：
   - 已有 Proxy 列表（grep ModelPrepCmd.ts + extends BaseProxy）
   - 已有 ViewId（grep UIManifest.ts → ViewId 枚举）
   - 已有 Prefab（ls assets/resources/gui/）
   - 已有通知常量（grep Commands.ts）
   - 路径约定（固定，从模板读取）

2. 展示探测结果给用户确认：
   "我找到了以下已有资源：
    - Proxy: [UserProxy, InventoryProxy, ShopProxy]
    - ViewId: [SettingsPopup, ShopMain, LoginPopup]
    - 是否正确？有无遗漏？"

3. 用户确认/修正
```

**Phase B — 蘇格拉底式 Q&A**（仅追问探测无法确定的信息）：

```text
逐项采集：
  - 模块名称（PascalCase）
  - 目标 ViewId 枚举值（新 or 复用已有）
  - 是否需要新建 Proxy（已有清单比对，不确定则追问）
  - 是否有子模块？列出子模块名列表
  - 是否有 UI？（有 → 标记 UI 复杂度：简单/中等/复杂）
  - 相关通知常量有哪些
  - 任何外部参考文档
```

**Phase C — 生成环境**：

```text
1. 写入 _context.md（真相层）
2. 在 workflow 目录下创建 <ModuleName>/ 目录
3. 从 templates/ 生成全部模板文件
4. 创建三层空目录（Proxy/ View+Prefab/ Mediator/）
5. 如有子模块，创建子模块空目录占位
6. _status.md 初始 Runtime + Layers + SubModules，所有层 = pending，step = —
```

**输出合同**：

| 文件/目录 | 必须性 | 成功标准 |
|----------|--------|----------|
| `_context.md` | MUST | 记录路径约定、已有资源清单、UI 配置、子模块列表 |
| `_tree.md` | MUST | 固定 Sequence 与层级前置条件 |
| `_status.md` | MUST | 包含 Runtime、Layers、SubModules（如有），可从零恢复 |
| `_constraint.md` | MUST | 包含 C1-C17 硬约束 |
| `_dev_log.md` | MUST | 初始为空或仅有 init 记录 |
| `_ui-spec.md` | SHOULD（有 UI 时） | 初始化节点规格模板 |
| `Proxy/ View+Prefab/ Mediator/` | MUST | 每层含 `01_spec.md`、`02_plan.md`、`03_execute.md`、`04_test.md` 占位 |
| `<SubModule>/` | SHOULD（有子模块时） | 只创建空目录占位，不生成子模块真相层 |

**暂停条件**：用户无法回答某个问题时（需求模糊），暂停等人。

---

### 2. mvc-executor

**触发**：
- gatherer 完成后自然进入
- 用户直接 `/mvc-executor`（继续开发模式）
- 用户告知需求变更后（更新上下文模式）

**职责边界**：

- 只读取 gatherer 产物启动，不重新做需求采集
- 负责定位当前层和当前 step，推进 `01_spec → 02_plan → 03_execute → 04_test`
- 负责更新 `_status.md` 与 `_dev_log.md`
- 默认自动推进低风险步骤；遇到高风险门禁必须暂停确认

**前置检查（MUST）**：

```text
□ _tree.md 存在？
  → NO  → STOP："请先运行 mvc-context-gatherer"

□ _status.md 存在？
  → NO  → STOP："_status.md 缺失，请重新运行 mvc-context-gatherer"

□ 定位起点：
  → 优先读取 Runtime.current_layer/current_step
  → 若 Runtime 缺失或与 Layers 不一致，扫描 Layers 中第一个 running/blocked/failed/pending
  → 全部 done/skipped → Runtime.current_step = integration，进入集成验证
  → 找到 pending/running/failed → 从该层 step 开始或重试
  → 找到 blocked → STOP：展示 blocked_reason，等待用户确认
```

**执行协议 — 逐层循环**：

```text
for each 层 in [_tree.md Sequence]:
    1. 前置检查
       □ 读 _status.md → 前置层 = done | skipped？
         → NO  → STOP："前置层未完成，请先完成 <前置层名>"
         → YES → 继续
       □ 若是 Proxy 层 → Condition: needs_proxy?
         → false → 写 _status: Proxy = skipped，continue
         → true  → 继续

    2. 更新 _status: 当前层 = running, step = 01_spec

    3. 01_spec → /brainstorming
       → 若当前层 = View+Prefab 且 _context.md 标记"有 UI"：
         产出 ui-spec（节点清单 + 按复杂度决定字段来源/交互链路/显隐条件）
       → 更新 _status: step = 02_plan

    4. 02_plan → /writing-plans
       → 更新 _status: step = 03_execute

    5. 03_exec → /executing-plans + /test-driven-development
       → 更新 _status: step = 04_test

    6. 04_test → /verification
       → 更新 _status: step = —

    7. 层完成
       → 更新 _status: 当前层 = done, step = —
       → 追加 _dev_log.md

    8. 若执行中发现上下文偏差 → 三类回写
```

**高风险门禁（MUST BLOCK）**：

以下情况必须写 `_status.md`：当前层 `状态 = blocked`，`blocked_reason = <原因>`，并暂停等待用户确认。

| 门禁 | 触发 | 处理 |
|------|------|------|
| 需求变更 | 用户提出新增/删除/改规则，影响 `_context.md` 或已生成 spec | 暂停 → 确认影响范围 → 需求变更回写 |
| 上下文偏差 | 仓库事实与 `_context.md` 不一致 | 暂停 → 展示差异 → 发现新信息回写 |
| 共享文件修改 | 涉及 `UIManifest.ts`、`Commands.ts`、`ModelPrepCmd.ts`、`ViewPrepCmd.ts`、`ControllerCmd.ts` | 暂停 → 确认串行窗口与影响 |
| 父子模块聚合 | 父模块完成前发现任一子模块未 `done/skipped` | 暂停 → 阻断父模块 done |
| 约束冲突 | 触发 C1-C17 或实现需要临时例外 | 暂停 → 确认是否修文档或调整实现 |
| 集成验证失败 | 单层 test 通过但跨层注册/路径/通知/运行加载失败 | 暂停 → 记录失败 → 失败回写 |

**三类回写**：

| 场景 | 触发 | 动作 |
|------|------|------|
| 失败回写 | 03_exec/04_test/integration 失败或违反 C 约束 | 写 `last_error` + `_dev_log.md` → 回写当前层 `01_spec.md` 或 `02_plan.md` → 将 step 重置到最早受影响步骤 |
| 发现新信息 | 执行中发现已有 Proxy/ViewId/Prefab/Command 不在 `_context.md` | 暂停 → 回写 `_context.md` → 从当前 step 继续；只有新信息改变设计时才重跑整层 |
| 需求变更 | 用户确认需求变化 | 回写 `_context.md` → 受影响层标记 `pending` → 下游层重置 `pending` → 不受影响上游保留 `done/skipped` |

**所有层 done/skipped 后 — 集成验证**：

```text
□ View @registerView → prefab 路径能定位到 .prefab 文件
□ Mediator @registerMediator → 对应 View 类存在
□ GameFacade 注册了所有新 Proxy（如有）
□ UIManifest 有 ViewId → UIViewConfig 映射
□ 通知常量在各文件中拼写一致
□ 有 UI 的模块：ui-spec 节点名 grep prefab 确认存在
□ 子模块（如有）：所有子模块 _status.md = done/skipped（C17）
□ 模块运行时无报错加载
□ 写一句结构性 review 结论（如：C1-C4 分层依赖是否合规、注册顺序是否正确）
```

**委托已有 skill**：/brainstorming → /writing-plans → /executing-plans + /test-driven-development → /verification

---

## 节点目录结构（gatherer 输出）

```text
<ModuleName>/                       ← C14：所有文件在 workflow 目录内
├── _tree.md                        ← Sequence: Proxy → View+Prefab → Mediator
├── _status.md                      ← Runtime + Layers + SubModules，可恢复状态机
├── _context.md                     ← G1 真相层（资源索引）
├── _constraint.md                  ← G2 硬约束（C1-C17）
├── _dev_log.md                     ← G4 开发记录
├── _ui-spec.md                     ← UI 节点规格（如有 UI）
├── 00_init.md                      ← 初始化记录
│
├── Proxy/                          ← Condition: needs_proxy? 可跳过
│   ├── 01_spec.md
│   ├── 02_plan.md
│   ├── 03_execute.md
│   └── 04_test.md
│
├── View+Prefab/
│   ├── 01_spec.md                  ← 如有 UI，含 ui-spec
│   ├── 02_plan.md
│   ├── 03_execute.md
│   └── 04_test.md
│
├── Mediator/
│   ├── 01_spec.md
│   ├── 02_plan.md
│   ├── 03_execute.md
│   └── 04_test.md
│
└── <SubModule>/                    ← 子模块空目录（如有）
```

## _status.md 格式（可恢复状态机）

```markdown
# <ModuleName> 状态

## Runtime
| 字段 | 值 |
|------|----|
| current_layer | View+Prefab |
| current_step | 03_execute |
| mode | auto |
| blocked_reason | — |
| updated_at | 2026-05-14 18:30 |

## Layers
| 层 | 状态 | step | retries | last_error |
|----|------|------|---------|------------|
| Proxy | skipped | — | 0 | — |
| View+Prefab | running | 03_execute | 1 | C6 registerView missing |
| Mediator | pending | — | 0 | — |

## SubModules
| 子模块 | 状态 | blocked_reason |
|--------|------|----------------|
| TopBar | done | — |
| Inventory | running | 等待子模块 executor 完成 |

<!-- 状态枚举：pending | running | blocked | done | skipped | failed -->
<!-- step 枚举：— | 01_spec | 02_plan | 03_execute | 04_test | integration -->
<!-- 层 done/skipped 时 step = — -->
```

**恢复算法**：

```text
1. 读取 Runtime.current_layer/current_step
2. 校验 Runtime 是否与 Layers 中对应层一致
3. 若一致：
   - running/failed → 从 current_step 继续或重试
   - blocked → STOP，展示 blocked_reason
4. 若 Runtime 缺失或不一致：
   - 扫描 Layers 中第一个 running/blocked/failed/pending
   - running/failed → 从该层 step 继续或重试
   - blocked → STOP，展示 blocked_reason
   - pending → 从 01_spec 开始
5. 若全部 done/skipped：
   - Runtime.current_step = integration
   - 进入集成验证
```

## _context.md 格式

```markdown
# <ModuleName> 知识索引

## 外部参考
- [Harness Engineering](../../../knowledgebase/harness-engineering.md)
- [需求文档]（如有）

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
- 已注册 ViewId：（grep 探测结果）
- 已存在 Proxy：（grep 探测结果）

## UI 配置
- 是否有 UI：[是/否]
- UI 复杂度：[简单（≤5 节点）/ 中等（5-15 节点）/ 复杂（>15 节点）]

## 子模块
- [子模块名列表]（如有）
```

## _ui-spec.md 格式

```markdown
# <ModuleName> UI 节点规格

## 节点树
<!-- v2：prefab-parser 自动填充，当前手动列出 -->

| 节点路径 | 组件类型 | 用途 | 来源 |
|---------|---------|------|------|
| root/btn_close | Button | 关闭弹窗 | 手动 |

## 数据绑定
<!-- 中等/复杂模块必填，简单模块可跳过 -->

| 节点 | 字段来源（Proxy.字段） | 更新时机 |
|------|----------------------|---------|
| label_title | ShopProxy.shopName | onShow |

## 交互链路
<!-- 中等/复杂模块必填，简单模块可跳过 -->

| 触发节点 | 事件 | 目标通知 | 参数 |
|---------|------|---------|------|
| btn_close | TOUCH_END | Commands.UI.CLOSE | ViewId.ShopMain |

## 显隐条件
<!-- 中等/复杂模块必填，简单模块可跳过 -->

| 节点 | 条件 | 备注 |
|------|------|------|
| badge_new | ShopProxy.hasNewItem | 实时更新 |
```

### 复杂度分级

| 复杂度 | 要求 | 示例 |
|--------|------|------|
| 简单（≤5 节点） | 节点清单即可 | 确认弹窗、飘字提示 |
| 中等（5-15 节点） | 节点清单 + 数据绑定 + 交互链路 + 显隐条件 | 商品详情、设置页 |
| 复杂（>15 节点） | 同上 + 逐节点交互说明 | 背包、商城主页 |

### 扩展点

v1（当前）：用户手动填写全部内容。
v2（未来）：prefab-parser 自动提取"节点树"section（节点路径 + 组件类型），标记 `[auto]`。其余由用户/brainstorming 补充。ui-spec 格式不变，变的是数据来源。

## _tree.md 格式

```markdown
# <ModuleName> 行为树

Sequence: Proxy → View+Prefab → Mediator

├── Proxy/
│   Condition: needs_proxy?
│   ├── true  → Execute
│   └── false → Skip（_status = skipped）
│
├── View+Prefab/
│   MUST: Proxy = done | skipped
│   → Execute
│
└── Mediator/
    MUST: View+Prefab = done
    → Execute
```

## _constraint.md 格式

每项约束都是硬规则。违反 = 节点执行失败 → 三类回写。

每条约束必须可追溯到至少一个历史失败场景（Hashimoto 原则）。

### 分层依赖

```text
View → Mediator → Proxy
  ↓        ↓
Prefab   Command
```

| # | 约束 | 说明 | 来源 |
| -- | ---- | ---- | ---- |
| C1 | View 不直接引用 Proxy | View 通过 Mediator 访问数据 | agent 曾跳过 Mediator 直接读写 Proxy |
| C2 | Mediator 不直接操作 Prefab | 通过 View 公开方法间接操作 UI | agent 曾在 Mediator 中直接 getChildByName |
| C3 | Proxy 不引用 View/Mediator | Proxy 纯数据层 | 循环依赖导致 undefined |
| C4 | Command 可编排 Proxy + Mediator | 业务编排者允许同时引用两者 | —（有意设计） |

### 声明与注册

| # | 约束 | 说明 |
| -- | ---- | ---- |
| C5 | ViewId 必须用枚举值 | `ViewId.SettingsPopup` 而非 `"SettingsPopup"` |
| C6 | View 类必须 `@registerView` | 装饰器绑定 ViewId + prefab 路径 |
| C7 | Mediator 类必须 `@registerMediator` | 装饰器绑定 ViewId |
| C8 | Proxy 必须 `extends BaseProxy` | 继承基类 |
| C9 | Command 必须实现 `ICommand` 或继承 `SimpleCommand`/`MacroCommand` | |

### 通知常量

| # | 约束 | 说明 |
| -- | ---- | ---- |
| C10 | 通知常量统一在 `Commands.ts` 声明 | 禁止裸字符串 |
| C11 | 常量命名空间隔离 | `Commands.UI.{ModuleName}.{Action}` |

### 注册顺序

| # | 约束 | 说明 |
| -- | ---- | ---- |
| C12 | 注册顺序：Proxy → View → Mediator → Command | 违反则运行时 undefined |
| C13 | UIManifest 映射：每个 ViewId 必须有 `UIViewConfig` | 缺失则模块不可加载 |

### 文件与目录

| # | 约束 | 说明 |
| -- | ---- | ---- |
| C14 | 所有 md 文档必须在 workflow 目录内 | 不散落到项目其他目录 |

### 父子模块

| # | 约束 | 说明 |
| -- | ---- | ---- |
| C15 | 共享文件串行修改 | 同一父模块下，涉及全局注册/常量文件的 03_exec 必须 blocked 等待确认 |
| C16 | 子模块只允许一层 | 父 → 子，禁止孙模块 |
| C17 | 父完成条件含子模块 | 父 done = 父三层 done + 所有子模块 done/skipped |

## 设计原则

| 原则 | 说明 |
| ---- | ---- |
| repo-first | gatherer 先 grep 探测 → 展示 → 确认，后追问，减少无聊提问 |
| 真相层单一 | `_context.md` 是唯一真相源，偏差先回写再继续 |
| 三类回写 | 失败/新信息/需求变更，均回写上游再重试 |
| 结构先于执行 | gatherer 搭环境（模板文件 + 目录），executor 进实现 |
| 前置检查硬约束 | executor 每层 MUST 检查 `_status.md` 前置状态 |
| 思考与执行分离 | `_tree.md` + meta = Orchestrator，层内 01→04 = Worker |
| 约束可自动化 | C1-C17 有 Linter/CI 落地 |
| 文档驱动回滚 | 出错先修文档，再重试 |
| 局部失败局部恢复 | 卡在哪层，从哪层恢复 |
| 节点内闭环 | 每层 01→04，不跳步 |
| 文件自包含 | C14 |
| UI 可扩展 | ui-spec 格式不变，v2 增 prefab-parser 自动填充 |

## 四道护栏映射

| 护栏 | 落地方式 | 机制 |
| ---- | -------- | ---- |
| G1 上下文工程 | `_context.md` + repo-first | grep 探测 → 按需追问 → 索引式不堆全文 |
| G2 架构约束 | `_constraint.md` + `_tree.md` + 前置检查 + Linter/CI | C1-C17 写死，前置检查阻断跳层，Linter 阻断违规 |
| G3 反馈回路 | executor 逐层 03_exec + 04_test | TDD → Fallback → 三类回写 → 重试，失败自动循环回模型 |
| G4 熵管理 | `_dev_log.md` + `_status.md` Runtime/Layers + Doc-gardening | 即时回写 + step 恢复粒度 + 决策日志 + 定期扫描 |

## Agent 失败模式及对策

| 失败模式 | 如何被防住 |
| ---- | --------- |
| **一步到位** | gatherer + executor 两阶段分离；executor 逐层循环不可跳过 |
| **过早宣布胜利** | 集成验证清单 + _status 全部 done + 结构性 review 一句，缺一不可 |
| **过早标记功能完成** | TDD + 04_test + 集成验证三层验证 |
| **跳过前置层** | executor 逐层 MUST 读取 `_status.md` 前置状态 |
| **模式复制/架构漂移** | C1-C17 硬约束 + Linter 阻断 |

## Skill 目录结构

```text
mvc-context-gatherer/
├── SKILL.md
├── zh-CN.md
└── templates/
    ├── _context.example.md
    ├── _tree.md
    ├── _status.md
    ├── _constraint.md
    ├── _ui-spec.md
    └── _dev_log.md

mvc-executor/
├── SKILL.md
└── zh-CN.md
```

executor 无需 templates/——委托已有 skill，只含执行协议。

## Template Manifest

模板文件必须能直接落地到 `mvc-context-gatherer/templates/`。gatherer 负责创建和初始化；executor 负责推进、追加和必要回写。

| 模板 | 生成者 | 更新者 | 变量/输入 | 落地要求 |
|------|--------|--------|-----------|----------|
| `_context.example.md` | gatherer | gatherer / executor 回写 | `ModuleName`、资源清单、UI 配置、子模块、外部参考 | 作为 `_context.md` 的渲染模板，必须覆盖路径约定、已有清单、UI 配置、子模块 |
| `_status.md` | gatherer | executor | `current_layer`、`current_step`、`blocked_reason`、Layers、SubModules | 必须使用 Runtime/Layers/SubModules 三段格式 |
| `_tree.md` | gatherer | 原则上不更新 | `needs_proxy`、Sequence、前置条件 | 固定 Proxy → View+Prefab → Mediator，禁止 executor 临时改执行顺序 |
| `_constraint.md` | gatherer | workflow 维护者 | C1-C17 | 每条约束必须可被 executor 引用为失败原因 |
| `_ui-spec.md` | gatherer | View+Prefab 的 01_spec / 04_test | 节点、绑定、交互、显隐 | 有 UI 时生成；简单 UI 允许只填节点树 |
| `_dev_log.md` | gatherer | executor | 时间、事件、层、step、结果 | 追加式日志，禁止覆盖历史记录 |
| `00_init.md` | gatherer | 不更新 | 探测摘要、用户确认、初始化结果 | 记录 repo-first 探测和用户确认结论 |
| `Layer/01_spec.md` | gatherer 占位 | executor 委托 `/brainstorming` 写入 | layer、输入、输出、验收标准 | 记录当前层需求和设计，不写实现步骤 |
| `Layer/02_plan.md` | gatherer 占位 | executor 委托 `/writing-plans` 写入 | layer、spec、任务拆分 | 记录可执行计划和验证命令 |
| `Layer/03_execute.md` | gatherer 占位 | executor 委托 `/executing-plans` 写入 | layer、plan、执行记录 | 记录执行摘要、改动文件、失败回写 |
| `Layer/04_test.md` | gatherer 占位 | executor 委托 `/verification` 写入 | layer、验证命令、结果 | 记录测试证据和集成前风险 |

**模板写入边界**：

| 文件 | 允许覆盖 | 允许追加 | 允许回写 |
|------|----------|----------|----------|
| `_context.md` | gatherer 初始化时 | 否 | 是，限发现新信息/需求变更 |
| `_status.md` | gatherer 初始化时 | 否 | 是，限 executor 状态动作 |
| `_tree.md` | gatherer 初始化时 | 否 | 原则上否；结构性变化重新运行 gatherer |
| `_constraint.md` | gatherer 初始化时 | 否 | 原则上否；约束升级走 workflow 维护 |
| `_ui-spec.md` | gatherer 初始化时 | 否 | 是，限 View+Prefab spec/test |
| `_dev_log.md` | gatherer 初始化时 | 是 | 否 |
| `00_init.md` | gatherer 初始化时 | 否 | 否 |
| `Layer/*.md` | gatherer 初始化占位时 | 是 | 是，限当前层三类回写 |

## Runtime Contract

executor 更新 `_status.md` 时只能使用下列状态动作。每次动作后必须追加 `_dev_log.md`，记录动作名、层、step、结果和原因。

| 动作 | 触发 | `_status.md` 更新 |
|------|------|------------------|
| `enter_step(layer, step)` | 准备执行某层某 step | `Runtime.current_layer = layer`；`Runtime.current_step = step`；`Runtime.mode = auto`；`Runtime.blocked_reason = —`；Layer 状态设为 `running` |
| `complete_step(layer, next_step)` | 当前 step 成功 | 若 `next_step != —`，Layer `step = next_step`；若 `next_step = —`，Layer 状态设为 `done`，Layer `step = —` |
| `skip_layer(layer, reason)` | Condition 为 false 或无需该层 | Layer 状态设为 `skipped`；Layer `step = —`；`last_error = reason` |
| `block(layer, step, reason)` | 触发高风险门禁 | Runtime 和 Layer 都记录 `blocked`；写入 `blocked_reason = reason`；立即停止 |
| `fail(layer, step, error)` | 执行、测试或集成失败 | Layer 状态设为 `failed`；`retries += 1`；`last_error = error`；进入三类回写判断 |
| `reset_from(layer)` | 需求变更影响该层或下游 | 该层和下游层设为 `pending`；`step = —`；上游 `done/skipped` 不动 |
| `integration_pass()` | 集成验证全部通过 | `Runtime.current_step = —`；清空 `blocked_reason`；追加完成日志 |
| `integration_fail(error)` | 集成验证失败 | `Runtime.current_step = integration`；`Runtime.blocked_reason = error`；进入 `block` 或 `fail` 分支 |

**动作约束**：

| 约束 | 说明 |
|------|------|
| 单一入口 | executor 恢复时必须先运行定位起点算法，再调用状态动作 |
| 单一写者 | `_status.md` 只允许 executor 在运行期更新；gatherer 只做初始化 |
| 不跳状态 | 未 `complete_step` 前不得推进下一 step |
| blocked 停止 | 任一层为 `blocked` 时不得继续执行下游层 |
| failed 可恢复 | `failed` 不等于终止，必须进入三类回写判断 |

## SKILL.md 骨架

### `mvc-context-gatherer/SKILL.md`

```markdown
---
name: mvc-context-gatherer
description: Use when creating or refreshing a Cocos Creator PureMVC module workflow workspace.
---

# MVC Context Gatherer

## Purpose
建立 MVC 模块真相层和 workflow 工作区。

## Inputs
- 模块意图或模块名
- 可选需求文档
- 当前 repo

## Must Read
- `CLAUDE.md`
- `.claude/rules/*`
- `assets/scripts/game/common/constants/UIManifest.ts`
- `assets/scripts/game/controller/Commands.ts`
- `assets/scripts/game/controller/cmd/startup/ModelPrepCmd.ts`
- `assets/scripts/game/controller/cmd/startup/ViewPrepCmd.ts`
- `assets/scripts/game/controller/cmd/startup/ControllerCmd.ts`
- 已有 Proxy/View/Prefab 清单

## Must Not
- 不得实现业务代码
- 不得调用 executor 阶段 skill
- 不得修改真实项目源码
- 不得在用户确认 repo-first 探测前生成工作区

## Workflow
1. repo-first 探测
2. 展示探测结果并等待确认
3. 只追问缺失信息
4. 渲染 templates
5. 初始化 `_status.md`
6. 输出工作区路径和下一步 `/mvc-executor`

## Stop Conditions
- 需求模糊且用户无法确认
- 关键路径缺失
- 用户未确认探测结果

## Final Output
- workflow 工作区路径
- 生成文件列表
- `_status.md` 初始状态摘要
- 下一步 `/mvc-executor`
```

### `mvc-executor/SKILL.md`

```markdown
---
name: mvc-executor
description: Use when continuing or executing a prepared Cocos Creator PureMVC module workflow workspace.
---

# MVC Executor

## Purpose
读取 workflow 工作区并推进 MVC 模块实现链路。

## Inputs
- 模块 workflow 目录

## Must Read
- `_tree.md`
- `_status.md`
- `_context.md`
- `_constraint.md`

## Must Not
- 不得绕过 `_status.md`
- 不得跳层
- 不得在 `blocked` 状态继续执行
- 不得重新采集 gatherer 已确认的信息
- 不得直接改 `_tree.md` 调整执行顺序

## Workflow
1. 恢复起点
2. 前置检查
3. 逐层执行 `01_spec → 02_plan → 03_execute → 04_test`
4. 每步使用 Runtime Contract 更新 `_status.md`
5. 触发高风险门禁时 blocked 并停止
6. 失败时进入三类回写
7. 所有层 done/skipped 后执行集成验证

## Delegation Rules
- `01_spec` → `/brainstorming`
- `02_plan` → `/writing-plans`
- `03_execute` → `/executing-plans` + `/test-driven-development`
- `04_test` → `/verification`

## Final Output
- 当前 `_status.md` 摘要
- 完成层列表
- blocked reason 或集成验证结果
- 下一步建议
```

## 父套子（递归）

### 原则

父模块只负责创建子模块占位、记录依赖、聚合状态。子模块必须独立跑完整流程（gatherer → executor），拥有自己的 `_context.md`、`_tree.md`、`_status.md`。`_constraint.md` 可复用父的 C1-C17 框架约束。所有文件在父 workflow 目录内（C14）。

### 边界

| # | 边界 | 说明 |
|---|------|------|
| B1 | 目录创建 | 父 gatherer 只建空目录，子 gatherer 增量生成，不覆盖父文件 |
| B2 | 独立真相层 | 子模块必须有自己的 `_context.md`、`_tree.md`、`_status.md` |
| B3 | 共享文件串行（C15） | 子模块 03_exec 涉及共享文件时必须 blocked 等待确认 |
| B4 | 父完成含子（C17） | 父 done 前 MUST 读取所有子 `_status.md` |
| B5 | _tree.md 独立 | agent 进哪个目录读哪个 `_tree.md` |
| B6 | 深度上限（C16） | 只允许父 → 子，禁止孙模块 |

### 目录结构

```text
MainUI/
├── _tree.md                    Sequence + Fallback(子模块验证)
├── _status.md                  父+子模块状态汇总
├── _context.md
├── _constraint.md              C1-C17（子复用）
├── Proxy/ View+Prefab/ Mediator/
│
├── TopBar/                     ← 独立 gatherer+executor
│   ├── _tree.md                独立行为树
│   ├── _status.md
│   ├── _context.md             独立采集
│   └── Proxy/ View+Prefab/ Mediator/
│
├── Inventory/                  [running]
└── Chat/                       [pending]
```

### 风险防控

| 风险 | 防控 |
|------|------|
| 重复采集 | repo-first 探测可复用父的清单，但模块特有信息必须独立采集 |
| 行为树冲突 | B4：agent 进哪个目录读哪个 _tree.md |
| 状态不可聚合 | 父 _status 汇总子状态 + C17 |
| 共享文件竞写 | C15：涉及共享文件时 blocked，确认串行窗口后继续 |
| 深度失控 | C16：只允许父 → 子 |

## 设计检查表

任意模块是否符合本 workflow 范式：

| 检查项 | 必须满足 |
| ---- | ---- |
| 有无 gatherer → executor | 两个 skill 均调用 |
| 有无 repo-first | gatherer 先 grep 探测再追问 |
| 有无真相层 | `_context.md` 存在且被所有后续步骤引用 |
| 有无回写机制 | 执行偏差 → 回写 `_context.md` → 重试 |
| 有无前置检查 | executor 每层 MUST 读取 `_status.md` |
| 有无可恢复状态 | `_status.md` 记录 Runtime/Layers/SubModules，支持崩溃恢复 |
| 有无模板合同 | Template Manifest 明确每个模板的生成者、更新者、变量和写入边界 |
| 有无运行时合同 | Runtime Contract 明确 executor 每个状态动作如何更新 `_status.md` |
| 有无 skill 骨架 | 两个 `SKILL.md` 骨架包含 Purpose、Inputs、Must Read、Must Not、Workflow、Final Output |
| 有无硬约束 | `_constraint.md` 明确 C1-C17 |
| 有无 UI 规格 | 有 UI 的模块有 `_ui-spec.md`，复杂度分级 |
| 有无行为树 | `_tree.md` 定义 Sequence/Condition |
| 有无执行闭环 | 每层 01→04 |
| 有无集成验证 | 全层 done + 清单打勾 + review 结论 |
| 有无熵管理 | `_dev_log.md` + Doc-gardening |
| 有无深度控制 | 只允许父 → 子（C16）|
| 有无共享文件串行 | 涉及共享文件时 blocked 等待确认（C15） |
