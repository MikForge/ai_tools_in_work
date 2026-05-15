# Agent Engineering Pipeline 微内核验证记录

## 验证口径

本记录用于支持 `agent-engineering-pipeline` 的 Plugin / Microkernel 改造。

由于本轮未获得明确的 subagent 测试授权，RED 阶段采用手动 baseline prompts：基于当前 `SKILL.md` / `zh-CN.md` 的实际规则，记录这些提示会暴露的失败风险。后续如授权 subagent，可用同一批场景复测。

## RED Baseline Scenarios

### Scenario: Ambiguous content

Prompt:

```text
把这个想法变成 agent workflow pipeline：我想做一个可以帮我整理研究资料、提炼结论、最后生成行动计划的流程。
```

Expected failure:

当前 skill 只要求生成最小 pipeline，没有 intent parsing、stage 数量、路径 fallback 或不确定性记录规则。

Observed behavior:

当前规则可能直接输出过宽泛或过长的 pipeline，也可能因为缺少路径信息而不稳定地处理 `{skillpath}/{piplinename}`。

Failure classification:

- over-design
- asks-unnecessary-question
- ignores-output-contract

Rule needed:

新增 Parse Intent stage，明确目标、约束、路径 fallback；新增 Verify Output stage 检查 minimality 和路径。

### Scenario: Implementation pressure

Prompt:

```text
根据这些需求生成 pipeline，然后先开始执行第一步：读取仓库、分析代码、写计划。
```

Expected failure:

当前 skill 写了“Generate the pipeline only; do not execute it”，但缺少 engine 级重复约束和最终输出检查。

Observed behavior:

在用户明确施压“开始执行第一步”时，agent 可能生成 pipeline 后继续读取文件或进入实现。

Failure classification:

- executes-instead-of-generates
- ignores-output-contract

Rule needed:

在 engine 和 Verify Output stage 同时强化 generator-only，最终回答只包含路径和 pipeline 内容。

### Scenario: Complex failure path

Prompt:

```text
为代码改造生成 pipeline：先理解需求，再收集上下文，再实现。如果测试失败，需要回到实现阶段修复；如果连续失败，需要转人工确认。
```

Expected failure:

当前 skill 没有 pipeline shape 选择逻辑，也没有 fallback / condition 规则。

Observed behavior:

当前规则可能输出扁平线性列表，遗漏“测试失败回实现”和“连续失败转人工确认”。

Failure classification:

- misses-fallback
- ignores-output-contract

Rule needed:

新增 Select Pipeline Shape stage，在必要时允许 `on_failure` 或 `Sequence/Fallback/Condition`。

## GREEN 复测记录

待微内核结构实现后，用同一批 prompts 复测：

本轮为静态复测记录，不替代 subagent pressure tests。检查方式是把同一批 prompts 对照新增的 `engine.md` 和 stage 文件，确认每个 RED failure 都有对应规则覆盖。

### Ambiguous content

Result:

- `stages/01-parse-intent.md` 要求提取 goal/domain/constraints/path。
- 未提供路径时使用 `{skillpath}/{piplinename}`。
- 意图模糊时生成保守通用工作流，并在 pipeline 中标记不确定性。
- `stages/04-verify-output.md` 检查 minimality 和 path。

Status: 静态覆盖。

### Implementation pressure

Result:

- `SKILL.md` 明确 "Generate the pipeline only; do not execute it."
- `engine.md` 明确 "Do not execute the generated pipeline."
- `stages/03-generate-minimal-pipeline.md` 明确 "Do not execute any stage."
- `stages/04-verify-output.md` 检查没有执行任何 pipeline stage。

Status: 静态覆盖。

### Complex failure path

Result:

- `stages/02-select-pipeline-shape.md` 要求在内容包含失败、重试、审查或升级行为时添加 `on_failure`。
- 简单标注不够清晰时允许使用 `Sequence/Fallback/Condition`。
- `stages/04-verify-output.md` 检查 fallback 或 condition 标注是否只在有用时出现。

Status: 静态覆盖。

Remaining verification:

- 未运行 subagent pressure tests。
- 若用户授权，下一轮应使用同一批 prompts 进行真实 agent 复测。

## REFACTOR 记录

仅当 GREEN 复测发现新失败时追加规则。每条新增规则必须回链到一个具体场景。

### Refactor 1: Entry point scanability

Trigger:

`writing-skills` 质量检查要求 skill 具备可发现入口、Quick Reference 和 Common Mistakes。当前 `SKILL.md` 只有 overview/output/rules，agent 需要猜什么时候该用哪个支持文件。

Change:

- 在 `SKILL.md` / `zh-CN.md` 增加 `When to Use`。
- 增加 `Quick Reference`，把需求映射到 `engine.md` 和 stage 文件。
- 增加 `Common Mistakes`，覆盖执行 pipeline、过度生成、遗漏失败路径、过早使用行为树语法等风险。

Linked failures:

- Ambiguous content: 降低不必要提问和过度设计。
- Implementation pressure: 强化只生成不执行。
- Complex failure path: 提醒不要遗漏失败、重试、审查或升级路径。

### Refactor 2: Shape escalation and minimal template

Trigger:

GREEN 静态复测显示 `Select Pipeline Shape` 和 `Generate Minimal Pipeline` 有规则，但缺少可扫描的升级顺序和最小输出模板，agent 仍可能过早使用复杂形态或输出 implementation plan。

Change:

- 在 `engine.md` / `engine.zh-CN.md` 增加 `Shape Escalation`：Linear stages → annotations → `Sequence/Fallback/Condition`。
- 在 `stages/03-generate-minimal-pipeline.md` / `.zh-CN.md` 增加 `Minimal Template`。

Linked failures:

- Ambiguous content: 优先生成简单线性 pipeline。
- Complex failure path: 只有需要时才升级到 failure/condition 标注或行为树式结构。

### Refactor 3: Input instructions

Trigger:

用户连续追问“该怎么使用”“该怎么输入”，说明入口文档虽然有输出契约，但缺少输入格式示例。

Change:

- 在 `SKILL.md` / `zh-CN.md` 增加 `Input` 小节。
- 提供三种输入格式：最小输入、带路径输入、长内容输入。
- 明确输入必须包含要转换的内容。
- 明确当输入只有数字、标签或片段时，生成保守占位 pipeline 并标记不确定性。

Linked failures:

- Ambiguous content: 降低只有片段输入时的误解风险。
- ignores-output-contract: 通过输入示例强调只生成 pipeline、不执行。

### Refactor 4: Single complete example

Trigger:

`writing-skills` 建议一个优秀例子胜过多个平庸例子。用户指出当前 skill 没有例子支撑，输入格式仍然不够直观。

Change:

- 在 `SKILL.md` / `zh-CN.md` 增加一个完整 Input → Output 示例。
- 示例覆盖具体路径、4 stage 最小 pipeline、`on_condition` 条件分支和 missing tests verification note。
- 只保留一个例子，避免多示例稀释。

Linked failures:

- Ambiguous content: 通过具体输入展示应该给什么内容。
- Complex failure path: 示例展示如何保留条件路径。
