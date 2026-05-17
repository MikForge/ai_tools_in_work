# Writing Skills 设计与流程

> **来源**：[obra/superpowers/skills/writing-skills](https://github.com/obra/superpowers/tree/main/skills/writing-skills)
>
> **提取**：核心设计决策 + 完整工作流程

---

## 一、核心设计

### 1.1 根本理念

**Writing skills = TDD applied to process documentation。**

将测试驱动开发的 RED-GREEN-REFACTOR 循环完整映射到文档编写：

| TDD 概念 | Skill 创建 |
| -------- | --------- |
| **Test case** | 带 subagent 的压力场景 |
| **Production code** | Skill 文档（SKILL.md） |
| **Test fails (RED)** | Agent 无 skill 时违反规则（baseline） |
| **Test passes (GREEN)** | Agent 有 skill 后遵守规则 |
| **Refactor** | 关闭漏洞，维持合规 |
| **Write test first** | 写 skill 前先跑 baseline 场景 |
| **Watch it fail** | 记录 agent 使用的确切借口 |
| **Minimal code** | 只针对已观察到的违规写 skill |
| **Watch it pass** | 验证 agent 现在合规 |
| **Refactor cycle** | 发现新借口 → 堵上 → 重新验证 |

### 1.2 铁律

```
NO SKILL WITHOUT A FAILING TEST FIRST
```

此规则适用于**新建**和**编辑**已有 skill，无例外：

- 不允许"简单补充"
- 不允许"只加一节"
- 不允许"文档更新"
- 不允许保留未测试的变更作为"参考"
- 不允许在运行测试时"适配"

### 1.3 设计原则

**如果在没有 skill 的情况下没有观察到 agent 失败，就无法知道 skill 是否教了正确的东西。** 这是驱动整个流程的硬约束。

前置知识要求：`**REQUIRED BACKGROUND:** superpowers:test-driven-development` — 定义 RED-GREEN-REFACTOR 基础循环。

---

## 二、设计决策

### 2.1 Description 格式约束（CSO）

**Description 只描述触发条件，不总结工作流。** 这是经过测试验证的设计决策：

| 做法 | 效果 |
| ---- | ---- |
| 描述总结工作流 | Agent 按 description 行动，跳过读取完整 skill 正文 |
| 描述仅含触发条件 | Agent 正确读取 skill 正文并遵循完整流程 |

格式：以 "Use when..." 开头，third-person，含具体触发症状和场景。绝不总结 skill 的流程或步骤。

**实际案例**：description 写 "code review between tasks" 导致 agent 只做一次 review，而 skill 流程图明确要求两次 review（spec compliance → code quality）。改为纯触发条件 "Use when executing implementation plans with independent tasks" 后，agent 正确遵循两阶段流程。

### 2.2 Skill 类型与测试策略

上游将 skill 分为 3 种基本类型，测试时额外区分 Discipline 类型：

| 类型 | 特征 | 示例 |
| ---- | ---- | ---- |
| **Technique**（操作指南） | 具体步骤和方法 | condition-based-waiting, root-cause-tracing |
| **Pattern**（心智模型） | 思维方式和判断 | flatten-with-flags, test-invariants |
| **Reference**（文档/API） | 参考信息 | office docs, API 参考 |

测试时每种类型的验证方式不同：

| 测试维度 | Technique | Pattern | Reference | Discipline |
| -------- | --------- | ------- | --------- | ---------- |
| 核心场景 | 正确应用技术 | 识别适用时机 | 检索正确信息 | 学术理解 + 压力合规 |
| 边缘场景 | 处理边缘情况 | 反例：何时不用 | 应用找到的信息 | 组合压力（时间+沉没成本+疲劳） |
| 缺口测试 | 指令是否有漏洞 | 应用心智模型 | 常见用例覆盖 | 识别并堵住合理化借口 |
| 成功标准 | 应用到新场景 | 正确判断适用性 | 找到并正确应用 | 最大压力下仍遵守规则 |

### 2.3 目录结构

```
skills/skill-name/
├── SKILL.md              # 主体（必需）
└── supporting-file.*     # 仅在需要时
```

- **扁平命名空间**：所有 skill 在单一可搜索命名空间中
- **分离重度参考**（100+ 行 API 文档、综合语法）和可复用工具（脚本、模板）
- **内联保留**：原则/概念、代码模式（<50 行）

三种文件组织模式：

| 模式 | 结构 | 适用 |
| ---- | ---- | ---- |
| **Self-Contained** | 仅 SKILL.md | 内容适中，无重度参考 |
| **Skill + Tool** | SKILL.md + 可复用代码文件 | 工具是可复用代码 |
| **Skill + Reference** | SKILL.md + 引用文件 + scripts/ | 参考材料过大无法内联 |

### 2.4 防规避机制

Skills 需抵抗 agent 的合理化规避。四层防御设计：

1. **显式关闭每个漏洞**：不仅陈述规则，还列举禁止的具体变通方案
2. **封堵"精神 vs 字面"论调**：前置声明 "Violating the letter of the rules is violating the spirit of the rules"
3. **构建合理化表格**：从 baseline 测试中捕获 agent 的每个借口（8 种常见借口见上游文档）
4. **创建红旗列表**：让 agent 能在合理化时自我检查（如 "This is different because..."）

### 2.5 搜索优化（CSO）

- Description 含具体触发关键词（错误消息、症状、工具名）
- 关键词语法覆盖（同义词、变体）
- 主动语态、动词优先命名（`creating-skills` 而非 `skill-creation`）
- 高频 skill 目标 <200 词，其他 <500 词
- 跨引用使用 skill 名称 + 显式标记（`REQUIRED BACKGROUND`），禁止 `@` 语法

---

## 三、完整工作流程

### 阶段一：RED — 写失败测试

```
压力场景（无 skill）→ 记录 baseline 行为 → 识别合理化模式
```

1. 创建压力场景（Discipline 类型需 3+ 组合压力）
2. **不加载 skill** 运行场景
3. 逐字记录 agent 的选择和合理化借口
4. 识别哪些压力触发了违规

### 阶段二：GREEN — 写最小 Skill

```
针对特定违规编写 → 仅覆盖观察到的问题 → 不添加假设内容
```

1. 编写 YAML frontmatter（`name` + `description`，最多 1024 字符）
2. Description 以 "Use when..." 开头，仅含触发条件
3. 正文针对 RED 阶段识别出的具体失败
4. **加载 skill** 运行相同场景，验证合规

### 阶段三：REFACTOR — 关闭漏洞

```
发现新借口 → 添加显式反驳 → 重新测试 → 直到无漏洞
```

1. 从测试迭代中识别新合理化借口
2. 添加显式反驳
3. 构建/更新合理化表格
4. 创建/更新红旗列表
5. 重复直到 bulletproof

### 阶段四：部署

```
git commit → push to fork → 考虑向上游 PR 贡献
```

**强制约束**：
- 每个 skill 独立测试，禁止批量创建
- 完成当前 skill 部署前不得开始下一个
- 跳过测试部署 = 违反质量标准

---

## 四、流程控制约束

### 停止规则

写完 **任何** skill 后必须停止并完成部署流程。不得：
- 批量创建多个 skill 而不逐个测试
- 在当前 skill 验证前移至下一个
- 以"批处理更高效"为由跳过测试

### 创建时机

| 应该创建 | 不应该创建 |
| -------- | ---------- |
| 技术对你不直观 | 一次性解决方案 |
| 会跨项目复用 | 其他地方已充分文档化的标准实践 |
| 模式广泛适用 | 项目特定约定（放 CLAUDE.md） |
| 他人也会受益 | 机械约束（可用 regex/validation 自动化） |

### 反模式

| 反模式 | 说明 |
| ------ | ---- |
| 叙事式示例 | "In session 2025-10-03..." — 太具体，不可复用 |
| 多语言稀释 | 同一示例提供 JS/Python/Go 版本 — 质量平庸，维护负担 |
| 流程图中放代码 | 无法复制粘贴，难以阅读 |
| 无意义标签 | `helper1`、`step3` — 标签应有语义含义 |

---

## 五、关键设计约束

1. **Description 绝不总结工作流**：总结 = 创建捷径，agent 会跳过正文
2. **一个优秀示例胜过多个平庸示例**：单一语言，来自真实场景，完整可运行
3. **流程图仅用于非显而易见的决策点**：线性指令用编号列表，参考材料用表格
4. **跨引用仅用 skill 名称 + 显式标记**：禁止 `@` 语法（强制加载，烧上下文），用 `REQUIRED BACKGROUND` 或 `REQUIRED SUB-SKILL`
5. **Skill 是参考指南，非叙事**：记录可复用的技术/模式/工具，不是"我是如何解决某问题"的故事
