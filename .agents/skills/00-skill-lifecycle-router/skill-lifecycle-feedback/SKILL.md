---
name: skill-lifecycle-feedback
description: 生命周期子 skill —— 记录问题及其严重度和回流路由。内部使用，由 skill-lifecycle-router 调用（用户可选或由 review/test 自动触发）。
disable-model-invocation: true
---

# Skill 生命周期 — 反馈

## 概述

记录 review 或 test 阶段发现的问题，标注严重度和回流目标阶段，并触发修复循环。两种入口路径：用户选择 "feedback" 阶段，或路由器在 review/test 发现问题后自动触发。

**核心原则:** 反馈是信号路由器 —— 它将问题路由回正确的阶段进行修复，而非倾倒抱怨的垃圾场。

## 路径约定

此子 skill 由根路由器执行。它继承：

- `ROUTER_SKILL_DIR`：根 `skill-lifecycle-router` 包目录的绝对路径。
- `TARGET_WORKSPACE`：生命周期产物所在工作区的绝对路径。
- `TARGET_SKILL_DIR`：正在创建或修改的 skill 所在目录的绝对路径（如适用）。

不要从当前工作目录解析路由器拥有的文件。不要对路由器拥有的文件或生命周期产物使用父级相对 docs 路径。

## 入口

- **用户发起：** 用户在路由器中选择 feedback 阶段。路由器询问："针对哪个 skill？关于哪个阶段？什么问题？"
- **自动触发：** 路由器检测到 review/test 报告中问题章节非空 → 调用 feedback 生成结构化反馈记录。

## 流程

### 用户发起
1. 路由器询问此反馈针对哪个 skill
2. 路由器询问问题目标阶段（design / plan / task / test）
3. 用户描述问题
4. 路由器根据用户描述分配严重度（Critical / Important / Minor）
5. 将反馈记录写入 `TARGET_WORKSPACE/docs/notes/<skill-name>-feedback.md`

### 自动触发
1. 路由器将 review/test 报告传递给 feedback 子 skill
2. 从报告的问题章节中提取每个问题
3. 按照 `ROUTER_SKILL_DIR/docs/constraints/feedback-note-constraints.md` 格式化每个问题
4. 追加（非覆盖）到 `TARGET_WORKSPACE/docs/notes/<skill-name>-feedback.md`

## 输出格式

遵循 `ROUTER_SKILL_DIR/docs/constraints/feedback-note-constraints.md`：

```markdown
# 反馈记录: <skill-name>

## 问题

### <问题标题>
- **严重度:** Critical | Important | Minor
- **来源:** review | test | self-check | user
- **回流目标阶段:** design | plan | task | test
- **描述:** <发现了什么以及为什么重要>
- **文件:** <path:line（如适用）>
```

## 路由器交接

反馈记录写入后，路由器展示：
- 按严重度分类的问题数量
- 问题回流到哪个阶段
- "回到 <stage> 修，还是接受继续？"

## 自检

- [ ] 反馈记录存在于 `TARGET_WORKSPACE/docs/notes/<skill-name>-feedback.md`
- [ ] 每条问题标注了严重度
- [ ] 每条问题标注了回流目标阶段
- [ ] 来源已标注

## 输出

反馈记录以自检声明结尾：

```markdown
## 自检
- [x] 每条问题标注了严重度
- [x] 每条问题标注了回流目标阶段
- [x] 来源已标注
```
