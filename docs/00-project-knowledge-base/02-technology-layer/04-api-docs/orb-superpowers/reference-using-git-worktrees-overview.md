# using-git-worktrees — 使用 Git Worktrees

> **来源**：[obra/superpowers/skills/using-git-worktrees](https://github.com/obra/superpowers/tree/main/skills/using-git-worktrees)
>
> **提取**：核心设计决策 + 完整工作流程

---

## 一、核心设计

### 1.1 根本理念

确保工作在隔离工作区中执行。优先使用平台的原生 worktree 工具，回退到手动 git worktree。

**核心原则**：先检测现有隔离 → 然后使用原生工具 → 然后回退到 git。绝不与 harness 对抗。

---

## 二、工作流程

### Step 0：检测现有隔离

在创建任何新工作区之前，先检查是否已在隔离工作区中：

```bash
GIT_DIR=$(cd "$(git rev-parse --git-dir)" 2>/dev/null && pwd -P)
GIT_COMMON=$(cd "$(git rev-parse --git-common-dir)" 2>/dev/null && pwd -P)
BRANCH=$(git branch --show-current)
```

**子模块保护**：`GIT_DIR != GIT_COMMON` 在 git 子模块中也为 true。在承认"已在 worktree 中"之前，验证不在子模块中：

```bash
git rev-parse --show-superproject-working-tree 2>/dev/null
```

### Step 1：使用原生工具

优先使用平台级别的本地 worktree 管理工具。

### Step 2：回退到 git worktree

无原生工具时使用标准 git worktree：

```bash
git worktree add -b <branch-name> ../<repo-name>-<branch-name> main
```

### Step 3：在 worktree 内工作

切换到新 worktree，执行开发工作，提交更改。

---

## 来源

| 资源 | URL |
|------|-----|
| SKILL.md | https://raw.githubusercontent.com/obra/superpowers/main/skills/using-git-worktrees/SKILL.md |
