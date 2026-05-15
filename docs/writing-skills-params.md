# Writing Skills — 所需参数

使用 writing-skills 创建新 skill 前，准备好以下信息。

## 必填

| 参数 | 说明 |
|------|------|
| **Skill 名称** | 只用字母、数字、连字符，动词开头用 -ing 形式（如 `creating-skills`、`condition-based-waiting`） |
| **Skill 类型** | 四种之一：**Technique**（步骤方法）、**Pattern**（思维模型）、**Reference**（API/文档）、**Discipline-enforcing**（规则约束） |
| **触发条件** | description 字段核心——"什么时候该用这个 skill？"（只写触发场景，不写内部流程） |
| **要解决的具体问题** | 解决什么痛点？什么失败/错误/困惑会让 agent 需要它？ |

## 可选但建议准备

| 参数 | 说明 |
|------|------|
| **反面案例** | 什么时候**不该**用这个 skill |
| **已知 rationalization** | agent 可能会用什么借口绕开规则？（规则类 skill 尤其需要） |
| **代码示例场景** | 一个真实、可运行的场景（一个高质量示例即可，不要多语言） |
