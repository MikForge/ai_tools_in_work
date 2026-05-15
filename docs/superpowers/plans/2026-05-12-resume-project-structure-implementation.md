# Resume Project Structure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite `job/简历-完整版.md` so project experience remains project-based while using the Guangzhou A company period as a truthful container for representative projects.

**Architecture:** Keep the normal resume section order. Under project experience, use `广州A公司项目经历（2020.09 - 2025.08）` as a company-stage heading, then list representative projects as subheadings: overseas H5, 《求生王》, and 《爱江山》. Keep Guangzhou B as a separate project.

**Tech Stack:** Markdown resume editing; verification via `rg`, `sed`, and manual structure review.

---

### Task 1: Keep Top Narrative Aligned

**Files:**
- Modify: `job/简历-完整版.md`

- [x] **Step 1: Keep `核心优势` focused on long-term experience plus recent framework preview**

Expected bullets:

```markdown
- 在广州A公司多款 H5 / 小游戏项目中参与多年持续迭代，覆盖多玩法、运营活动、多语言 / 本地化、性能优化和线上问题处理。
- 自研关卡编辑器、配置生成、图集打包等工具链，提升内容生产与资源构建效率。
- 近期完成 Cocos Creator 客户端框架预研，将长期项目中沉淀的 UI、资源、网络、状态机等能力迁移到新项目骨架。
- 连续两年获评公司年度优秀员工（2021、2022）。
```

### Task 2: Use Company Container With Project Subheadings

**Files:**
- Modify: `job/简历-完整版.md`

- [x] **Step 1: Use Guangzhou A company-stage heading**

Expected heading:

```markdown
### 广州A公司项目经历（2020.09 - 2025.08）
```

- [x] **Step 2: Add representative project subheadings**

Expected subheadings:

```markdown
#### 海外 H5 长线运营项目（家园 + 寻物 + 运营系统）（2021.09 - 2025.08）
#### 《求生王》Cocos Creator 框架预研（2025.03 - 2025.08）
#### 《爱江山》女性向换装 / 化妆休闲项目（2020.09 - 2021.09）
```

- [x] **Step 3: Keep each project with its own stack, role, context, and bullets**

Each representative project should remain independently readable and interviewable.

### Task 3: Keep Guangzhou B Independent

**Files:**
- Modify: `job/简历-完整版.md`

- [x] **Step 1: Keep Guangzhou B as a separate project**

Expected heading:

```markdown
### 广州B公司 MMORPG H5 商业项目（2018.06 - 2020.06）
```

- [x] **Step 2: Strengthen SDK encapsulation bullet**

Expected bullet:

```markdown
- 在统一 SDK 封装层上接入登录、支付、统计等能力，隔离渠道差异，减少业务模块对平台接口的直接依赖。
```

### Task 4: Verification

**Files:**
- Verify: `job/简历-完整版.md`
- Verify: `docs/superpowers/specs/2026-05-12-resume-project-weighting-design.md`

- [x] **Step 1: Check headings**

Run:

```bash
rg -n "^##|^###|^####" job/简历-完整版.md
```

Expected order:

```text
## 📌 求职意向
## 👤 个人定位
## ✨ 核心优势
## 🛠️ 专业技能
## 💼 工作经历
## 🧩 项目经验
### 广州A公司项目经历（2020.09 - 2025.08）
#### 海外 H5 长线运营项目（家园 + 寻物 + 运营系统）（2021.09 - 2025.08）
#### 《求生王》Cocos Creator 框架预研（2025.03 - 2025.08）
#### 《爱江山》女性向换装 / 化妆休闲项目（2020.09 - 2021.09）
### 广州B公司 MMORPG H5 商业项目（2018.06 - 2020.06）
## 🎓 教育背景
## 🏆 荣誉
```

- [x] **Step 2: Check removed article-like module headings and over-specific wording**

Run:

```bash
rg -n "长线运营与玩法系统|工程化工具链与配置体系|性能优化与基础能力沉淀|广州A公司 H5 /（|10 状态|MacroCommand|《求生王》——" job/简历-完整版.md || true
```

Expected: no output.

- [x] **Step 3: Check line count**

Run:

```bash
wc -l job/简历-完整版.md
```

Expected: full resume remains compact enough to scan.
