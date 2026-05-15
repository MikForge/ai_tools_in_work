# Resume Capability Redistribution Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redistribute reusable capability evidence from 《求生王》 into earlier Guangzhou A experience while keeping the resume project-based and truthful.

**Architecture:** Keep the current project-based resume structure. Add cross-project capability sedimentation to Guangzhou A work experience, strengthen overseas H5 and 《爱江山》 with non-Cocos reusable capabilities, and compress 《求生王》 to Cocos-specific framework preview content.

**Tech Stack:** Markdown resume editing; verification with `rg`, `sed`, and `wc`.

---

### Task 1: Update Guangzhou A Work Experience

**Files:**
- Modify: `job/简历-完整版.md`

- [ ] **Step 1: Replace the basic capability bullet**

Replace:

```markdown
- 主导或参与客户端基础能力建设，包括 UI 组件库、通用工具类、资源管理、网络通信、状态机、对象池、活动数据结构等。
```

with:

```markdown
- 在多项目迭代中沉淀 UI 组件、状态机、对象池、资源加载、事件管理等基础能力，并在后续 Cocos Creator 预研项目中复用到新项目骨架。
```

### Task 2: Strengthen Overseas H5 Capability Sedimentation

**Files:**
- Modify: `job/简历-完整版.md`

- [ ] **Step 1: Replace object-pool-only bullet with broader sedimentation bullet**

Replace:

```markdown
- 使用对象池管理高频节点，配合资源动态预加载与按需释放，降低运行时 GC 抖动和内存压力。
```

with:

```markdown
- 在长期迭代中沉淀场景状态管理、资源预加载、对象池和活动配置结构，减少玩法与活动模块的重复实现。
```

### Task 3: Strengthen 《爱江山》 Representation System

**Files:**
- Modify: `job/简历-完整版.md`

- [ ] **Step 1: Replace narrow makeup rendering bullet with layered system bullet**

Replace:

```markdown
- 实现妆容区域的精确渲染与过渡控制，处理不同妆容组合后的显示层级、叠加顺序和视觉一致性。
```

with:

```markdown
- 将角色表现拆分为状态控制、动画编排、资源组合和妆容渲染多层逻辑，降低换装、化妆与活动主题扩展之间的耦合。
```

### Task 4: Compress 《求生王》 Resource And Network Bullets

**Files:**
- Modify: `job/简历-完整版.md`

- [ ] **Step 1: Replace separate resource and network bullets with one combined bullet**

Replace these two bullets:

```markdown
- 封装资源管理器，按 bundle 管理资源加载与卸载，引入引用计数、预加载策略和 prefab 加载竞态保护，降低资源泄漏与重复加载风险。
- 搭建 Protobuf + WebSocket 长连接网络层，支持心跳检测、长静默超时、指数退避重连与异常恢复。
```

with:

```markdown
- 封装资源管理器与 Protobuf + WebSocket 网络层，支持资源引用计数、加载竞态保护、心跳检测、超时处理和重连恢复。
```

### Task 5: Verification

**Files:**
- Verify: `job/简历-完整版.md`
- Verify: `docs/superpowers/specs/2026-05-12-resume-capability-redistribution-design.md`

- [ ] **Step 1: Verify changed phrases exist**

Run:

```bash
rg -n "多项目迭代中沉淀 UI 组件|长期迭代中沉淀场景状态管理|角色表现拆分为状态控制|封装资源管理器与 Protobuf" job/简历-完整版.md
```

Expected: four matches.

- [ ] **Step 2: Verify risky wording is absent**

Run:

```bash
rg -n "10 状态|MacroCommand|Cocos bundle|负责搭建 Cocos Creator|近期完成" job/简历-完整版.md || true
```

Expected: no output.

- [ ] **Step 3: Verify project structure still exists**

Run:

```bash
rg -n "^### 广州A公司项目经历|^#### 海外 H5|^#### 《求生王》|^#### 《爱江山》|^### 广州B公司" job/简历-完整版.md
```

Expected: all five project headings are present.

- [ ] **Step 4: Verify line count**

Run:

```bash
wc -l job/简历-完整版.md
```

Expected: line count remains compact and not larger than the current resume.
