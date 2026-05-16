# Verification Before Completion 分析

## 概述

`verification-before-completion` 是一个 discipline-enforcing skill，强制 agent 在声称"完成/修复/通过"之前必须执行验证命令并确认输出。违规被视为撒谎而非疏忽。

核心机制：五步 Gate Function（识别→执行→读取→验证→声明），跳过任何一步即为未验证。

## 问题场景

两类触发场景：

- **假完成**：Agent 声称 "Tests pass" 但测试未执行。"Should work now" 推断代替证据。
- **信任链断裂**：该 skill 记录了 24 条失败记忆，包括用户表达 "I don't believe you"、未定义函数被交付、缺失需求被交付。

## Gate Function

```
IDENTIFY → RUN → READ → VERIFY → ONLY THEN claim
```

| 步骤 | 动作 |
|------|------|
| 1. IDENTIFY | 什么命令能证明这个声明？ |
| 2. RUN | 完整执行命令（新执行，不用缓存） |
| 3. READ | 读取完整输出，检查退出码，统计失败数 |
| 4. VERIFY | 输出是否确认声明？否→报告实际状态；是→带证据声明 |
| 5. CLAIM | 此时才能声明 |

## 防合理化借口机制

该 skill 采用三层防御：

### 第一层：Red Flags 列表

Agent 看到以下信号时必须停止：
- 使用 "should"、"probably"、"seems to"
- 在验证前表达满意（"Great!"、"Perfect!"、"Done!"）
- 即将 commit/push/PR 但未验证
- 信任 agent 的成功报告
- 疲劳并想结束工作

### 第二层：Rationalization Prevention 表格

| 借口 | 现实 |
|------|------|
| "Should work now" | 执行验证 |
| "I'm confident" | 信心 ≠ 证据 |
| "Just this once" | 没有例外 |
| "Linter passed" | Linter ≠ 编译器 |
| "Agent said success" | 独立验证 |
| "I'm tired" | 疲劳 ≠ 借口 |
| "Partial check is enough" | 部分证明不了什么 |

### 第三层：Iron Law 表述

"Violating the letter of this rule is violating the spirit of this rule." — 封堵"遵循精神而非字面"类合理化借口。

## 验证范围定义

该 skill 通过 "Common Failures" 表定义了各类声明的验证要求：

| 声明 | 要求 | 不够 |
|------|------|------|
| Tests pass | 测试命令输出：0 failures | 上一次运行、"应该能过" |
| Linter clean | Linter 输出：0 errors | 部分检查、外推 |
| Build succeeds | Build 命令：exit 0 | Linter 过了、日志看起来正常 |
| Bug fixed | 测试原始症状：通过 | 代码改了、推测修复了 |
| Agent completed | VCS diff 显示变更 | Agent 报告 "success" |
| Requirements met | 逐行检查清单 | 测试通过 |

## 设计要点

- **不定义验证内容**：skill 只强制"必须验证"，不规定验证什么。验证范围由调用方决定。
- **不提供自动化**：无 hook、无脚本。依赖 agent 自觉遵守——对应的是"信任但验证"模式。
- **绝对规则，零例外**：与软性建议不同，该 skill 将违规等同于不诚实，不给 agent 留谈判空间。

## 作为 discipline-enforcing skill 的参考价值

该 skill 可作为同类 skill 的设计模板：

- `Red Flags` → 给 agent 自检信号
- `Rationalization Prevention 表格` → 从基线测试中收集的常见借口
- `Iron Law 表述` → 封堵"字面 vs 精神"漏洞
- `Common Failures 表` → 定义每种声明的验证门槛

## 相关文件

- [SKILL.md](../../.agents/skills/verification-before-completion/SKILL.md) — 源文件，140 行
- 目录仅含 `SKILL.md`，无 zh-CN.md、无子文件、无 agents/openai.yaml
