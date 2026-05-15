# 知识库维护技能体系设计

**日期**：2026-05-15
**状态**：design

---

## 目标

为项目知识库正文文档设计一套全新的技能体系，优先解决以下问题：

1. Agent 能按需读取、按边界调用、低误用地完成知识库任务。
2. 读、写、发布、治理四类动作职责分明，不把高风险结构操作和普通写文档混在一起。
3. 默认支持自动判断流程；只有在分类、对象或操作存在歧义时才停下来询问用户。
4. 体系只覆盖 `docs/00-project-knowledge-base/**` 下的正文文档，不把全仓库 Markdown 流程混进来。

---

## 范围与原则

### 范围

- 处理对象：知识库正文 Markdown 文档。
- 不处理对象：设计 spec、implementation plan、仓库根 README、分类 README、普通任意 Markdown。
- `README.md` 仍是索引文档，不视为正文文档。

### 设计原则

- **Agent 优先**：命名要像动作，职责要窄，避免一个 skill 同时负责生成内容和落盘。
- **默认只读优先**：不确定时先读取已有知识，再决定是否生成或发布。
- **发布与治理分离**：单篇文档落盘是发布问题；审计、去重、重组是治理问题。
- **配置驱动**：路径、分类、索引位置由 `.knowledge-base.yml` 决定。
- **正文与索引分离**：正文内容由正文 skill 处理；索引只作为导航和发布副作用维护。

---

## 总体方案

采用"薄入口 + 平级专职 skill"方案。

### 技能列表

1. `knowledge-base` — 轻量入口 skill，负责理解用户意图、自动路由到正确的专职 skill。

2. `knowledge-base-init` — 知识库脚手架初始化。生成 `.knowledge-base.yml` + 分类目录 + 各级索引空模板。知识库已存在时直接拒绝，不做任何覆盖或合并。

3. `knowledge-base-load` — 读取已有知识库正文文档。只读。

4. `knowledge-base-author` — 将代码、会话、用户输入或外部材料整理成知识库正文草稿。

5. `knowledge-base-publish` — 将正文草稿发布到知识库，负责分类匹配、命名、文件写入和索引更新。

6. `knowledge-base-govern` — 知识库治理：审计、去重、重组、索引修复。默认先产出报告，再执行变更。

### 为什么采用平级专职

- Agent 更容易根据任务意图选择正确 skill。
- 每个 skill 的 `description` 可以更锐利，减少误触发。
- 不同任务只加载必要规则，降低上下文负担。
- 高风险结构治理操作不会误混进普通写文档流程。

---

## 典型流程

- **初始化知识库**：`knowledge-base` → `knowledge-base-init`（一次性，已存在则拒绝）
- **查已有知识**：`knowledge-base` → `knowledge-base-load`
- **把代码分析整理成知识库正文**：外部上下文 → `knowledge-base-author` → `knowledge-base-publish`
- **续写已有正文**：`knowledge-base-load` 读取历史 → `knowledge-base-author` 生成修订稿 → `knowledge-base-publish` 更新
- **批量治理知识库**：`knowledge-base` → `knowledge-base-govern report-only` → 用户确认 → `knowledge-base-govern apply`

---

## 非目标

- 不把这套体系扩展成全仓库 Markdown 总线。
- 不让入口 skill 持有复杂正文规则或落盘规则。
- 不让发布层负责正文写作。
- 不让治理层默默直接改库。
- 不让 init 覆盖或修改已存在的知识库。

---

## 验收标准

新体系需要满足：

- Agent 能仅凭 skill 名称和 description 分辨初始化、读、写草稿、发布、治理五类动作。
- 普通知识库写作流程不需要加载治理规则。
- 只读任务不会误触发写入。
- 治理任务默认先报告，不默认直接改动。
- 正文文体规范、命名规范、配置规范分别归属明确，不再混在单一 skill 中。
