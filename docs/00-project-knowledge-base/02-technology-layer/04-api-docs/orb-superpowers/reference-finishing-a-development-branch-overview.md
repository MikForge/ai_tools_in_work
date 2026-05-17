# finishing-a-development-branch — 完成开发分支

> **来源**：[obra/superpowers/skills/finishing-a-development-branch](https://github.com/obra/superpowers/tree/main/skills/finishing-a-development-branch)
>
> **提取**：核心设计决策 + 完整工作流程

---

## 一、核心设计

### 1.1 根本理念

通过呈现清晰选项并处理所选工作流来引导开发工作的完成。

**核心原则**：验证测试 → 检测环境 → 呈现选项 → 执行选择 → 清理。

**开始声明**："I'm using the finishing-a-development-branch skill to complete this work."

---

## 二、完整工作流程

### Step 1：验证测试

在呈现任何选项之前先验证测试通过：

```bash
npm test / cargo test / pytest / go test ./...
```

如测试失败，修复测试或记录已知失败。

### Step 2：检测环境

```bash
git rev-parse --git-common-dir 2>/dev/null | grep -q .git/worktrees
git log --oneline -1
```

### Step 3：呈现选项

| 环境 | 可用选项 |
| ---- | -------- |
| 普通分支 | 提交 → PR / 合并到主分支 |
| Git worktree | 提交 → PR / 合并回主仓库 |
| 裸仓库 | 提交 → PR |
| 无远程 | 仅本地提交 |

### Step 4：执行选择

按用户选择的选项执行对应命令。

### Step 5：清理

回到主分支，更新本地主分支，删除已合并的特性分支。

---

## 来源

| 资源 | URL |
|------|-----|
| SKILL.md | https://raw.githubusercontent.com/obra/superpowers/main/skills/finishing-a-development-branch/SKILL.md |
