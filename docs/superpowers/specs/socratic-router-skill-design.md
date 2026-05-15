

# Skills Router 设计

## Skill 元信息

| 属性 | 值 |
| ---- | -- |
| name | `skills-router` |
| skill 类型 | discipline-enforcing |
| description | `Use when the user wants to invoke a skill but hasn't specified which one, when target skill arguments are missing, or when the user is unsure how to proceed with a skill` |
| disable-model-invocation | `true`（仅通过 `/skills-router` 手动触发） |

## When to Use（CSO 触发条件）

**触发症状：**

- 用户说"帮我做 X"但没指定用哪个 skill
- 目标 skill 的前置参数缺失（操作类型、目标路径、分类等）
- 用户不确定哪个 skill 匹配当前任务
- 多个 skill 可能适用，需缩小范围

**不适用：**

- 用户已用 `/skill-name` 明确指定 skill
- 用户输入已包含所有必要上下文
- 简单一问一答即可解决

## 工作流（4 步，Sequence 顺序执行）

### Step 1 — 选择目标

列出可用 skill 的 name + description，让用户选一个。用户已明确提到的（如"我想用 knowledge-base-update"），确认即可。

禁止：

- 凭感觉猜用户要哪个，跳过确认

### Step 2 — 读取规范

Read 目标 `SKILL.md`，从前置元数据和正文提取三要素：

- 需要什么参数
- 有哪些前置条件
- 警告了哪些常见错误

禁止：

- 没读就假设参数（"这个 skill 我了解"）
- 凭 description 字段推断参数——description 只写触发条件，不写流程

### Step 3 — 逐条反问

基于 Step 2 提取到的参数/前置条件，一次只问一个问题。每条回答决定下一条问什么。

禁止：

- 一次性列出所有问题（"这几个问题很明显，一起问了吧"）

### Step 4 — 委托执行

上下文收齐后：`Skill({ skill: "<目标>" })`。对话历史自动带入目标 skill。

禁止：

- Router 自己执行任务（"这个简单我自己处理"）
- 目标 skill 不存在时仍继续——立即停止并告知用户

---

## 规则

1. 你是路由器，不是执行器。委托给目标 skill，不要自己执行
2. 先读目标 SKILL.md 再提问。禁止假设参数
3. 一次一个问题。禁止批量提问
4. 目标 skill 不存在时立即停止

## 常见错误

| 错误 | 纠正 |
| ---- | ---- |
| 跳过 Step 2，凭记忆提问 | 先读 SKILL.md——参数可能已更新 |
| 一次性列出所有问题 | 逐条——每条回答决定下一条方向 |
| Router 自己执行任务 | 通过 Skill 工具委托 |
| skill 不存在仍继续 | 停止并告知用户 |
| 凭 description 推断参数 | 必须 Read 全文，description 不含流程 |

## 危险信号（Red Flags）

出现以下念头 → 立即回到 Step 2：

- "这个 skill 我了解，不用读 SKILL.md"
- "我先确认几个关键信息……"（还没读就开始问）
- "这些问题很明显，一起问了吧"
- "这个简单，我自己处理就好"

**以上全部意味着：读目标 SKILL.md，从 Step 2 重新开始。**

---

## TDD 测试指引

writing-skills 按 RED → GREEN → REFACTOR 执行，以下为各阶段输入。

### RED — 基线测试

用 subagent **不加载** skills-router，跑此 prompt：

> "我想用 knowledge-base-update skill 存一个文档，但不太确定怎么操作"

预期基线失败模式（三压合一：模糊需求 + 缺失参数 + 效率诱惑）：

- 跳过 Step 1/2，直接假设参数开始提问
- 一次性列出所有问题
- 自己尝试执行而非委托
- 声称"我就直接调 skill"但不实际执行 Skill 调用

### GREEN — 合格标准

加载 skill 后，subagent 必须依次做到：

1. 列出可用 skill（或确认用户已指定的）
2. 显式执行 Read 目标 SKILL.md（对话中可见文件名）
3. 每次只问一个问题
4. 收齐后执行 `Skill({ skill: "<目标>" })`

### REFACTOR — 封堵重点

| 压力条件 | 预期行为 |
| -------- | -------- |
| 用户催"快点我自己知道参数" | 仍坚持 Step 2，先读 SKILL.md |
| 目标 SKILL.md 很长 | 不能以"太长了"为由跳过阅读 |
| 用户给的目标 skill 不存在 | 停止，不随便委托类似 skill |
| 用户先说了 skill 名又反悔 | 回到 Step 1，重新确认 |

---

## 示例对话

```
用户: /skills-router

Router: 想调用哪个 skill？
  - knowledge-base-read: Use when loading relevant project knowledge...
  - knowledge-base-update: Use when saving/archiving markdown docs...
  - ...

用户: knowledge-base-update

Router: [Read .agents/skills/knowledge-base-update/SKILL.md
        → 提取：操作类型、目标分类、文档名、内容]

Router: 你想做哪种操作？写入新文档 / 更新已有文档 / 归档文档？

用户: 写入新文档

Router: 这个文档属于哪个分类？

用户: 02-technology-layer

Router: 文件名建议？（kebab-case，如 cocos-creator-build-config）

用户: cocos-creator-build-config

Router: 上下文收齐，委托 knowledge-base-update 执行。
  → Skill({ skill: "knowledge-base-update" })
```
