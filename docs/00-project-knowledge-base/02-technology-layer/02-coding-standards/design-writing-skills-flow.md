# Writing Skills 设计与流程

> **来源**：`.agents/skills/writing-skills/SKILL.md`
>
> **提取**：核心设计决策 + 完整工作流程

---

## 一、核心设计

### 1.1 根本理念

**Writing skills = TDD applied to process documentation。**

将测试驱动开发的 RED-GREEN-REFACTOR 循环完整映射到文档编写：

| TDD 概念 | Skill 创建 |
|----------|-----------|
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

---

## 二、设计决策

### 2.1 Description 格式约束（CSO）

**Description 只描述触发条件，不总结工作流。** 这是经过测试验证的设计决策：

| 做法 | 效果 |
|------|------|
| 描述总结工作流 | Agent 按 description 行动，跳过读取完整 skill 正文 |
| 描述仅含触发条件 | Agent 正确读取 skill 正文并遵循完整流程 |

格式：以 "Use when..." 开头，third-person，具体触发症状和场景。

### 2.2 Skill 类型划分

| 类型 | 特征 | 测试方法 |
|------|------|---------|
| **Discipline-Enforcing**（规则/约束） | 强制 agent 遵守规则 | 学术问题 + 压力场景 + 组合压力 |
| **Technique**（操作指南） | 具体步骤和方法 | 应用场景 + 边缘情况 + 缺失信息测试 |
| **Pattern**（心智模型） | 思维方式和判断 | 识别场景 + 应用场景 + 反例测试 |
| **Reference**（文档/API） | 参考信息 | 检索场景 + 应用场景 + 覆盖缺口测试 |

### 2.3 目录结构

```
skills/skill-name/
├── SKILL.md              # 主体（必需）
├── zh-CN.md              # 中文翻译（必需，自动生成）
└── supporting-file.*     # 仅在需要时
```

- **扁平命名空间**：所有 skill 在单一可搜索命名空间中
- **分离重度参考**（100+ 行 API 文档、综合语法）和可复用工具（脚本、模板）
- **内联保留**：原则/概念、代码模式（<50 行）

### 2.4 防规避机制

Skill 需抵抗 agent 的合理化规避。设计决策：

1. **显式关闭每个漏洞**：不仅陈述规则，还禁止具体的变通方案
2. **封堵"精神 vs 字面"论调**：前置声明 "违反规则的文字就是违反规则的精神"
3. **构建合理化表格**：从 baseline 测试中捕获 agent 的每个借口
4. **创建红旗列表**：让 agent 能在合理化时自我检查

### 2.5 搜索优化（CSO）

- Description 含具体触发关键词（错误消息、症状、工具名）
- 关键词语法覆盖（同义词、变体）
- 主动语态、动词优先命名（`creating-skills` 而非 `skill-creation`）
- 高频 skill 目标 <200 词

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
4. 同时生成 `zh-CN.md` 中文翻译（同结构，代码/标识符不翻译）
5. **加载 skill** 运行相同场景，验证合规

### 阶段三：REFACTOR — 关闭漏洞

```
发现新借口 → 添加显式反驳 → 重新测试 → 直到无漏洞
```

1. 从测试迭代中识别新合理化借口
2. 添加显式反驳（Discipline 类型）
3. 构建/更新合理化表格
4. 创建/更新红旗列表
5. 重复直到 bulletproof

### 阶段四：部署

```
提交 SKILL.md + zh-CN.md → git push → 考虑 PR 贡献
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
|----------|-----------|
| 技术对你不直观 | 一次性解决方案 |
| 会跨项目复用 | 其他地方已充分文档化的标准实践 |
| 模式广泛适用 | 项目特定约定（放 CLAUDE.md） |
| 他人也会受益 | 机械约束（可用 regex/validation 自动化） |

---

## 五、关键设计约束

1. **Description 绝不总结工作流**：总结 = 创建捷径，agent 会跳过正文
2. **一个优秀示例胜过多个平庸示例**：单一语言，来自真实场景
3. **流程图仅用于非显而易见的决策点**：线性指令用编号列表，参考材料用表格
4. **跨引用仅用 skill 名称 + 显式标记**：禁止 `@` 语法（强制加载，烧上下文）
5. **确保两个文件同步**：`SKILL.md` 和 `zh-CN.md` 必须一致
