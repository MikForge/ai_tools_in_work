# Repository Expectations

## 仓库性质

这是一个 **agent skill 收集仓库**(不是常规代码项目),集中管理 Codex / Claude Code 等 agent 可复用的 skill 包。没有构建、测试或 lint 流程。

## 目录布局

- `.agents/skills/` — skill 源目录,所有 skill 的实际存放位置。每个 skill 一个子目录,内含 `SKILL.md`。
- `.codex/skills` → symlink 指向 `../.agents/skills`(Codex 读取路径)
- `.claude/skills` → symlink 指向 `../.agents/skills`(Claude Code 读取路径)
- `setup-skills-links.sh` / `setup-skills-links.bat` — 克隆后首次使用需跑一次,建立上述 symlink
- `.gitignore` 已忽略 `.codex/skills`,只追踪 `.agents/skills/` 下的实体文件

## 添加 / 删除 skill 的规范

**必须装到项目级,不要用 `-g`**(全局会污染其他项目):

```bash
# 添加
npx skills add <owner/repo@skill> -y

# 删除
npx skills remove -s <skill-name> -y

# 查找
npx skills find <query>

# 列出已装
npx skills list
```

安装后 skill 会落在 `.agents/skills/<skill-name>/`,通过已有的 symlink 自动对 Codex / Claude Code 生效。

## 工作约定

- 新增 skill 前先查重:看 `.agents/skills/` 是否已存在同类能力
- 评估 skill 质量:优先选 install 数高(1K+)、来源可信(`vercel-labs`、`anthropics` 等官方源)的
- skill 目录结构由上游仓库决定,**不要手改** `SKILL.md`;要定制请在本仓库新建独立 skill
- 自建 skill 用 `npx skills init <name>`,在 `.agents/skills/` 下生成骨架

## 子目录覆盖

如某个 skill 或子目录有特殊规则,在该子目录新建 `AGENTS.md` 或 `AGENTS.override.md`。
