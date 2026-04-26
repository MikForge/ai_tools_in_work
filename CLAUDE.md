# Claude Code Project Instructions

## 项目性质

这是一个 **agent skill 收集仓库**(不是常规代码项目),用于集中管理 Claude Code / Codex 等 agent 可复用的 skill 包。没有构建、测试或 lint 流程。

## 目录布局

- [.agents/skills/](.agents/skills/) — skill 源目录,所有 skill 的实际存放位置。每个 skill 一个子目录,内含 `SKILL.md`。
- [.claude/skills](.claude/skills) → symlink 指向 `../.agents/skills`(Claude Code 读取路径)
- [.codex/skills](.codex/skills) → symlink 指向 `../.agents/skills`(Codex 读取路径)
- [setup-skills-links.sh](setup-skills-links.sh) / [setup-skills-links.bat](setup-skills-links.bat) — 克隆后首次使用需跑一次,建立上述 symlink
- [.gitignore](.gitignore) 已忽略 `.codex/skills`,只追踪 `.agents/skills/` 下的实体文件

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

安装后 skill 会落在 `.agents/skills/<skill-name>/`(目录索引见 [.agents/skills/](.agents/skills/)),通过已有的 symlink 自动对 Claude Code / Codex 生效。

### 安装后必须更新索引

**每次 `npx skills add` 成功后,必须往 [.agents/skills/README.md](.agents/skills/README.md) 追加一个 `##` 小节**,按字母序插入到已有小节之间,格式:

```markdown
## <skill-name>

- 来源:`owner/repo`
- 安装:`npx skills add owner/repo@skill -y`
- 用途:一句话(≤40 字),从 SKILL.md 的 `description` 意译
- 链接:<https://skills.sh/owner/repo/skill>
```

删除 skill 时同步删掉对应小节。忘了就等于没装——README 是本仓库的唯一入口清单。

## 工作约定

- 新增 skill 前先查重:看 [.agents/skills/](.agents/skills/) 是否已存在同类能力
- 评估 skill 质量:优先选 install 数高(1K+)、来源可信(`vercel-labs`、`anthropics` 等官方源)的
- skill 目录结构由上游仓库决定,**不要手改** `SKILL.md`;要定制请在本仓库新建独立 skill
- 自建 skill 用 `npx skills init <name>`,在 `.agents/skills/` 下生成骨架

## 当前已收录 skill

完整清单(含来源、安装命令、中文描述)见 [.agents/skills/README.md](.agents/skills/README.md)。
