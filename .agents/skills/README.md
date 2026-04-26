# Repository Skills

本目录存放仓库级的 agent skills(Claude Code / Codex / GitHub Copilot 通用)。每个 skill 一个子目录,内含 `SKILL.md`。

## 维护约定

新增 / 删除 skill 后,**必须同步更新下面的清单**(规则见 [../../CLAUDE.md](../../CLAUDE.md) "安装后必须更新索引" 一节)。

每个 skill 用二级标题列出,固定三行:

- **来源**:`owner/repo`
- **安装**:完整 `npx skills add ... -y` 命令
- **用途**:一句话中文描述,≤40 字,从 SKILL.md 的 `description` 意译

---

## brainstorming

- 来源:`obra/superpowers`
- 安装:`npx skills add obra/superpowers@brainstorming -y`
- 用途:做任何创意工作(新功能、组件、行为修改)前,先梳理意图、需求、设计
- 链接:<https://skills.sh/obra/superpowers/brainstorming>

## dispatching-parallel-agents

- 来源:`obra/superpowers`
- 安装:`npx skills add obra/superpowers@dispatching-parallel-agents -y`
- 用途:2+ 个独立、无共享状态 / 顺序依赖的任务,并行分发给多个 agent
- 链接:<https://skills.sh/obra/superpowers/dispatching-parallel-agents>

## docx

- 来源:`anthropics/skills`
- 安装:`npx skills add anthropics/skills@docx -y`
- 用途:创建、读取、编辑 Word(.docx)文档;含目录、页码、图片、查找替换等
- 链接:<https://skills.sh/anthropics/skills/docx>

## executing-plans

- 来源:`obra/superpowers`
- 安装:`npx skills add obra/superpowers@executing-plans -y`
- 用途:拿已有实现计划在独立会话里执行,带评审检查点
- 链接:<https://skills.sh/obra/superpowers/executing-plans>

## find-skills

- 来源:`vercel-labs/skills`
- 安装:`npx skills add vercel-labs/skills@find-skills -y`
- 用途:帮用户在开放 skill 生态里发现并安装合适的 skill
- 链接:<https://skills.sh/vercel-labs/skills/find-skills>

## finishing-a-development-branch

- 来源:`obra/superpowers`
- 安装:`npx skills add obra/superpowers@finishing-a-development-branch -y`
- 用途:实现完成、测试通过后,结构化收尾(合并 / PR / 清理)
- 链接:<https://skills.sh/obra/superpowers/finishing-a-development-branch>

## game-development

- 来源:`sickn33/antigravity-awesome-skills`
- 安装:`npx skills add sickn33/antigravity-awesome-skills@game-development -y`
- 用途:游戏开发入口,按项目需求路由到具体平台子 skill
- 链接:<https://skills.sh/sickn33/antigravity-awesome-skills/game-development>

## receiving-code-review

- 来源:`obra/superpowers`
- 安装:`npx skills add obra/superpowers@receiving-code-review -y`
- 用途:收到 code review 反馈时要技术严谨、先验证,不无脑附和
- 链接:<https://skills.sh/obra/superpowers/receiving-code-review>

## requesting-code-review

- 来源:`obra/superpowers`
- 安装:`npx skills add obra/superpowers@requesting-code-review -y`
- 用途:完成任务、大功能、合并前,请求评审校验需求
- 链接:<https://skills.sh/obra/superpowers/requesting-code-review>

## subagent-driven-development

- 来源:`obra/superpowers`
- 安装:`npx skills add obra/superpowers@subagent-driven-development -y`
- 用途:在当前会话里用 subagent 分任务执行实现计划
- 链接:<https://skills.sh/obra/superpowers/subagent-driven-development>

## systematic-debugging

- 来源:`obra/superpowers`
- 安装:`npx skills add obra/superpowers@systematic-debugging -y`
- 用途:遇到 bug / 测试失败 / 异常行为,先系统排查再提修复方案
- 链接:<https://skills.sh/obra/superpowers/systematic-debugging>

## test-driven-development

- 来源:`obra/superpowers`
- 安装:`npx skills add obra/superpowers@test-driven-development -y`
- 用途:任何功能 / bug fix 实现前,先写测试
- 链接:<https://skills.sh/obra/superpowers/test-driven-development>

## using-git-worktrees

- 来源:`obra/superpowers`
- 安装:`npx skills add obra/superpowers@using-git-worktrees -y`
- 用途:开始需要隔离的新功能或执行实现计划前,创建 git worktree
- 链接:<https://skills.sh/obra/superpowers/using-git-worktrees>

## using-superpowers

- 来源:`obra/superpowers`
- 安装:`npx skills add obra/superpowers@using-superpowers -y`
- 用途:会话开头约定怎么发现和调用其他 skill(调用前先用 Skill 工具触发)
- 链接:<https://skills.sh/obra/superpowers/using-superpowers>

## verification-before-completion

- 来源:`obra/superpowers`
- 安装:`npx skills add obra/superpowers@verification-before-completion -y`
- 用途:声称"完成 / 修好 / 通过"前,先跑验证命令确认输出
- 链接:<https://skills.sh/obra/superpowers/verification-before-completion>

## writing-plans

- 来源:`obra/superpowers`
- 安装:`npx skills add obra/superpowers@writing-plans -y`
- 用途:拿到规格 / 需求且是多步任务时,动代码前先写实现计划
- 链接:<https://skills.sh/obra/superpowers/writing-plans>

## writing-skills

- 来源:`obra/superpowers`
- 安装:`npx skills add obra/superpowers@writing-skills -y`
- 用途:创建 / 编辑 / 验证新 skill 时使用
- 链接:<https://skills.sh/obra/superpowers/writing-skills>

---

> 早期已安装的 skill 源没有在本地留下 manifest,"来源"按 `npx skills find <name>` 的最高匹配推断。若有误,改对应段即可。
