# MVC Module Workflow 设计

> 知识索引：[Harness Engineering](../../knowledgebase/harness-engineering.md)

## 两层抽象

| 范式 | 管什么 | 落地 |
| ---- | ------ | ---- |
| 行为树 | 节点怎么串——先后、嵌套、失败往哪跳 | `_tree.md` + 文件夹嵌套 |
| Harness Engineering | 每个节点里做什么——约束、反馈、熵管理 | spec → plan → execute → test |

行为树是骨架，Harness 是血肉。

## 节点标准模板

00_init 跑一次，meta 文件被子层继承。

```text
<NodeName>/
├── _tree.md         ← Sequence: Layer1 → Layer2 → Layer3
├── _status.md       ← pending | running | done
├── _context.md      ← G1 上下文索引（路径、基类、已有清单）
├── _constraint.md   ← G2 架构约束（分层依赖、顺序、禁止项）
├── _dev_log.md      ← G4 开发记录
├── 00_init.md       ← 初始化：更新 _context、写 _status、建 _dev_log
│
├── <Layer1>/        ← Condition 可跳过
│   ├── 01_spec.md   ← /brainstorming
│   ├── 02_plan.md   ← /writing-plans
│   ├── 03_execute.md ← /executing-plans + TDD
│   └── 04_test.md   ← /verification
│
├── <Layer2>/
│   └── 01_spec.md ... 04_test.md
│
└── <Layer3>/
    └── 01_spec.md ... 04_test.md
```

层不复制 meta 文件，从父级继承。`_tree.md` 定义层顺序和条件。

**Orchestrator / Worker 分离**：`_tree.md` + 父级 meta 文件是 Orchestrator——定义顺序、约束、上下文、回写规则；每层 01→04 是 Worker——具体执行。思考（tree）和执行（layer）在文件层面物理分离。

### 步骤流程

```text
00_init → 更新 _context → 写 _status = pending → 建 _dev_log（空）

每层: 01_spec → 02_plan → 03_exec(+TDD) → 04_test
层间: Sequence 顺序，前层完成才进后层
```

### SDD + TDD

- **SDD**：00_init → 每层 01→02→03
- **TDD**：嵌在每层 03_exec 里，每个 task 先写测试再实现
- **集成验证**：层内 TDD 覆盖不到的——跨层链路、注册完整、常量正确

### 四道护栏映射

| 护栏 | 对应文件 | 机制 |
| ---- | -------- | ---- |
| G1 上下文工程 | `_context.md` + 每层 `01_spec.md` | `_context` 存索引，spec 引用指路不复制全文 |
| G2 架构约束 | `_constraint.md` + `_tree.md` | `_constraint` 写死层顺序和禁止项，`_tree` Sequence 强制层间顺序 |
| G3 反馈回路 | 每层 `03_exec` + `04_test` | TDD 即时反馈 + 层内验证 → Fallback |
| G4 熵管理 | `_dev_log.md` + 失败回写 | 即时：失败 → 改文档 → 重来；累积：`_dev_log` 记录决策链。文档是活的反馈循环——每次失败都更新文档，agent 下次不会再犯相同错误 |

## 执行角色

### 入口：采集上下文（skill）

用户调用 `mvc-context-gatherer` skill，参考 `_context.example.md` 模板，以苏格拉底式提问逐项采集必要上下文（路径约定、已有清单、外部参考），写入 `_context.md`。上下文不完整则继续追问，补齐后进入 00_init。

### Agent 阶段：自主执行

Agent 走完 00_init → 每层 01→04，自己做决策。仅在以下三种情况暂停等人：

| 暂停条件 | 示例 |
| ---- | ---- |
| 需求模糊 | 01_spec 理解不清，需用户澄清 |
| 结构性决策 | 新建 Proxy 还是复用已有？ |
| Fallback 全失败 | 所有备选路径走不通，需人工介入 |

其他决策 agent 自己做，在 `_dev_log` 留记录。

## Agent 失败模式及对策

Harness Engineering 定义了三类典型失败，本 workflow 的结构设计直接应对：

| 失败模式 | 如何被防住 |
| ---- | --------- |
| **一步到位（One-shotting）** | Sequence + 三层结构强制分解——每层必须走完 01→04 才能进下一层 |
| **过早宣布胜利** | 04_test 集成验证六条全部打勾才算 done，agent 不能"看着差不多了"就标记完成 |
| **过早标记功能完成** | TDD 在 03_exec 保证单元级正确，04_test 保证跨层链路完整。test pass ≠ feature done |

额外风险：**Agent 擅长模式复制**。如果已有 workflow 是松散的线性脚本，agent 可能生成只有树壳没有树魂的假行为树。对策：`_tree.md` schema 硬约束——Sequence 必须顺序、Fallback 必须有备选、Condition 必须有判断条件——`_constraint.md` 编码为规则后由 lint 阻断违规。

## `_context.md` 格式

索引式，不堆内容。每层 01_spec 引它指路。模板参照 [`_context.example.md`](_context.example.md)。

```markdown
# <NodeName> 知识索引

## 外部参考
- [Harness Engineering](../../../knowledgebase/harness-engineering.md)

## 路径约定
- ViewId 枚举：`app/common/GameViewId.ts`
- 注册入口：`app/scene/UIManifest.ts`
- View 基类：`app/mvc/BaseView.ts`
- Mediator 基类：`app/mvc/BaseMediator.ts`
- Proxy 基类：`app/mvc/BaseProxy.ts`
- 通知常量：`app/mvc/Commands.ts`
- Prefab 目录：`assets/prefabs/ui/`

## 已有清单
- 已注册 ViewId：[SettingsPopup, ShopMain, LoginPopup, ...]
- 已存在 Proxy：[UserProxy, InventoryProxy, ShopProxy]
```

## `_constraint.md` 格式

每项约束都是硬规则，agent 在 03_exec 生成代码时必须遵守。违反任何一条 → 03_exec 失败 → Fallback。

### 分层依赖

```text
View → Mediator → Proxy
  ↓        ↓
Prefab   Command
```

| # | 约束 | 说明 |
| -- | ---- | ---- |
| C1 | View 不直接引用 Proxy | View 通过 Mediator 访问数据，不可 `import { FooProxy }` |
| C2 | Mediator 不直接操作 Prefab | Mediator 通过 View 的公开方法间接操作 UI |
| C3 | Proxy 不引用 View/Mediator | Proxy 纯数据层，不 import UI 类 |
| C4 | Command 可编排 Proxy + Mediator | Command 作为业务编排者，允许同时引用两者 |

### 声明与注册

| # | 约束 | 说明 |
| -- | ---- | ---- |
| C5 | ViewId 必须用枚举值，禁止裸字符串 | `GameViewId.SettingsPopup` 而非 `"SettingsPopup"` |
| C6 | View 类必须 `@registerView` | 装饰器绑定 ViewId + prefab 路径 |
| C7 | Mediator 类必须 `@registerMediator` | 装饰器绑定 ViewId |
| C8 | Proxy 必须 `extends BaseProxy` | 继承基类获得数据存取能力 |
| C9 | Command 必须实现 `ICommand` 或继承 `SimpleCommand`/`MacroCommand` | |

### 通知常量

| # | 约束 | 说明 |
| -- | ---- | ---- |
| C10 | 通知常量统一在 `Commands.ts` 声明 | 禁止在各文件中手写字符串 `"DO_SOMETHING"` |
| C11 | 常量命名空间隔离 | `Commands.UI.{ModuleName}.{Action}` |

### 注册顺序

| # | 约束 | 说明 |
| -- | ---- | ---- |
| C12 | 注册顺序：Proxy → View → Mediator → Command | GameFacade 按此顺序注册，违反则运行时 undefined |
| C13 | UIManifest 映射：每个 ViewId 必须有 `UIViewConfig` | 缺失则模块不可加载 |

## `_dev_log.md` 格式 + G4 熵管理

G4 分两种节奏：

| 机制 | 触发 | 作用 |
| ---- | ---- | ---- |
| 即时修复 | 任何步骤失败 | 回写 `_context`/`_constraint`/spec → 从卡住的节点重来 |
| 累积记录 | 每次开发完成 | 追加 `_dev_log`，追溯决策链 |

```markdown
## YYYY-MM-DD 操作摘要
- 创建/修改了什么
- 复用了什么、新建了什么
- 遇到的问题 + 如何解决
```

## Fallback 和 Condition

不写代码。Agent 读 `_tree.md`，按语义执行：

| 节点 | 语义 | Agent 行为 |
| ---- | ---- | --------- |
| Sequence | 左到右逐个，一个失败全停 | 按序读子节点，执行完一个走下一个 |
| Fallback | 左到右尝试，第一个成功就停 | 试一个，成则返回，全失败才报错 |
| Condition | 满足条件进，不满足跳过算成功 | grep/读文件/问用户判断条件，true 进 false 跳 |

例：

```text
_tree.md:                          Agent 执行:
──────                             ──────
Fallback: create_prefab            试第一个
├── Condition: already_exists?     → grep 项目找已有 prefab
│   └── Reference Existing            找到 → true → 引用
└── Create New                        没找到 → false → 跳过
                                  第一个没成功 → 试第二个
```

### 失败回写（G4）

任何步骤失败 → 不允许跳过文档直接改代码：

```text
失败
  → 在失败的 step 文件末尾追加失败原因
  → 回写受影响的文档（_context / _constraint / spec）
  → 从卡住的节点重试
  → 不重跑全树
```

## MVC 三层实例

节点模板落地到 MVC 场景：

```text
Popup/
├── _tree.md              ← Sequence: Proxy → View+Prefab → Mediator
├── _status.md
├── _context.md
├── _constraint.md
├── _dev_log.md
├── 00_init.md
│
├── Proxy/                ← Condition: needs_proxy?（可跳过）
│   ├── 01_spec.md        ← 数据需求、复用 or 新建
│   ├── 02_plan.md        ← 新建/复用 + 注册
│   ├── 03_execute.md     ← TDD：Proxy 类 + GameFacade 注册
│   └── 04_test.md        ← 数据读写正确
│
├── View+Prefab/
│   ├── 01_spec.md        ← UI 元素、布局、生命周期
│   ├── 02_plan.md        ← Fallback: prefab_exists? → 引用 / 新建
│   ├── 03_execute.md     ← TDD：View 类 + .prefab
│   └── 04_test.md        ← 节点绑定、生命周期回调
│
└── Mediator/
    ├── 01_spec.md        ← 事件监听、业务逻辑
    ├── 02_plan.md        ← 通知常量 + 绑定 View
    ├── 03_execute.md     ← TDD：Mediator 类 + UIManifest 注册
    └── 04_test.md        ← 事件收发、View 引用正确
```

### 层间依赖

| 层 | 依赖 | 说明 |
| -- | ---- | ---- |
| Proxy | 无 | 跳过整层（Condition: needs_proxy? = false） |
| View+Prefab | 无 | 必须执行 |
| Mediator | View+Prefab | View+Prefab 失败 → Mediator 不可执行 |

最简（无 Proxy）只跑 View+Prefab + Mediator。

### 集成验证清单

三层各自 test 完成后，Popup 级别验证：

```text
□ View @registerView → prefab 路径能定位到 .prefab 文件
□ Mediator @registerMediator → 对应 View 类存在
□ GameFacade 注册了所有新 Proxy（如有）
□ UIManifest 有 ViewId → UIViewConfig 映射
□ 通知常量在各文件中拼写一致
□ 模块运行时无报错加载

Fail 示例：
  "Proxy 未注册" → 回改 Proxy/02_plan
  "prefab 路径空" → 回改 View+Prefab/02_plan
  "NotifConst.X 未定义" → 回改 Mediator/02_plan
```

## 父套子（递归）

父节点（MainUI）包含多个子节点（弹窗），每个子节点内都是三层结构：

```text
MainUI/                            [done]
├── _tree.md
├── _status.md                     done
├── _context.md
├── _constraint.md
├── _dev_log.md
├── 00_init.md
│
├── TopBar/                        [done]
│   ├── _tree.md
│   ├── _status.md                 done
│   ├── Proxy/   (跳过)
│   ├── View+Prefab/ (01→04 done)
│   └── Mediator/   (01→04 done)
│
├── Inventory/                     [running]
│   ├── _status.md                 running ← Mediator/02_plan 卡住
│   └── ...
│
└── Chat/                          [pending]
    └── _status.md                 pending
```

追溯：找第一个 `running` → Inventory → Mediator。改完文档从 Mediator 继续，不重跑整个 MainUI。

父节点也可有层间集成验证——验证子模块之间的通信常量共享、ViewId 不冲突、GameFacade 注册无遗漏。
