# Skill Lifecycle Router Path Root Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace ambiguous router package path handling with explicit `ROUTER_SKILL_DIR`, `TARGET_WORKSPACE`, and `TARGET_SKILL_DIR` roots.

**Architecture:** This is a documentation/instruction change inside `.agents/skills/00-skill-lifecycle-router`. The root router binds path roots and passes them to internal sub-skills. Sub-skills use explicit root variables instead of `THIS_SKILL_DIR` or `../docs/...`.

**Tech Stack:** Markdown skill instructions. Verification uses `rg`, `sed`, `git diff --check`, and git status checks.

---

## File Map

```text
.agents/skills/00-skill-lifecycle-router/
  SKILL.md                              # Modify: root path binding, stage status paths, sub-skill loading path
  zh-CN.md                              # Modify: Chinese mirror of root path binding and workflow wording
  skill-lifecycle-design/SKILL.md       # Modify: add Path Contract, write design doc to TARGET_WORKSPACE
  skill-lifecycle-plan/SKILL.md         # Modify: add Path Contract, read design doc and write plan doc from TARGET_WORKSPACE
  skill-lifecycle-task/SKILL.md         # Modify: add Path Contract, read plan from TARGET_WORKSPACE, write target skill files under TARGET_SKILL_DIR
  skill-lifecycle-test/SKILL.md         # Modify: add Path Contract, write test report to TARGET_WORKSPACE
  skill-lifecycle-review/SKILL.md       # Modify: add Path Contract, read constraints from ROUTER_SKILL_DIR, write report to TARGET_WORKSPACE
  skill-lifecycle-feedback/SKILL.md     # Modify: add Path Contract, read format constraint from ROUTER_SKILL_DIR, write feedback to TARGET_WORKSPACE
```

Do not modify `docs/00-project-knowledge-base/`.

---

### Task 1: Update Root Router Path Binding

**Files:**
- Modify: `.agents/skills/00-skill-lifecycle-router/SKILL.md`
- Modify: `.agents/skills/00-skill-lifecycle-router/zh-CN.md`

- [ ] **Step 1: Run baseline verification and confirm the old root name is present**

```bash
rg -n "THIS_SKILL_DIR|ROUTER_SKILL_DIR|TARGET_WORKSPACE|TARGET_SKILL_DIR" .agents/skills/00-skill-lifecycle-router/SKILL.md .agents/skills/00-skill-lifecycle-router/zh-CN.md
```

Expected output includes `THIS_SKILL_DIR` lines in both files and may not yet include `ROUTER_SKILL_DIR`:

```text
.agents/skills/00-skill-lifecycle-router/SKILL.md:16:Before any workflow step, bind `THIS_SKILL_DIR` ...
.agents/skills/00-skill-lifecycle-router/zh-CN.md:16:执行任何工作流步骤前，先将 `THIS_SKILL_DIR` ...
```

- [ ] **Step 2: Replace the English `## Path Binding` section**

In `.agents/skills/00-skill-lifecycle-router/SKILL.md`, replace the full `## Path Binding` section with:

```markdown
## Path Binding

Before any workflow step, bind `ROUTER_SKILL_DIR` to the absolute directory containing the root `skill-lifecycle-router/SKILL.md`.

The router uses three explicit path roots:

| Root | Bound to | Owns |
| ---- | -------- | ---- |
| `ROUTER_SKILL_DIR` | Absolute directory containing this root router `SKILL.md` | Router `SKILL.md`, `zh-CN.md`, internal sub-skills, router constraints |
| `TARGET_WORKSPACE` | User-specified workspace, or the current target repository root when unambiguous | Lifecycle reports under `docs/specs`, `docs/plans`, `docs/test`, and `docs/notes` |
| `TARGET_SKILL_DIR` | Directory of the skill being created or modified, once the target skill is known | Target skill `SKILL.md`, `zh-CN.md`, scripts, templates, and references |

`ROUTER_SKILL_DIR` is the only root for router-owned files:
- sub-skill files: `ROUTER_SKILL_DIR/skill-lifecycle-<stage>/SKILL.md`
- router constraint files: `ROUTER_SKILL_DIR/docs/constraints/*.md`
- any relative path inside a router sub-skill that points to router-owned files

`TARGET_WORKSPACE` binding rules:
- If the user explicitly names a workspace, bind `TARGET_WORKSPACE` to that absolute path.
- Otherwise bind `TARGET_WORKSPACE` to the current target repository root.
- If the current working directory is inside a repository, use that repository root instead of the nested current directory.
- If multiple plausible workspaces exist, ask one question before entering a stage.
- Do not bind `TARGET_WORKSPACE` to `ROUTER_SKILL_DIR` unless the router package itself is the target workspace.

Never resolve router-owned files from the current shell working directory, the project root, or `TARGET_WORKSPACE`. If a path could exist in both `ROUTER_SKILL_DIR` and the project workspace, use `ROUTER_SKILL_DIR` only when the instruction explicitly says `ROUTER_SKILL_DIR`.

Lifecycle output artifacts such as `TARGET_WORKSPACE/docs/specs/<skill-name>-design.md` and `TARGET_WORKSPACE/docs/plans/<skill-name>-plan.md` belong to the target workspace unless the user explicitly says otherwise.

Sub-skills inherit these bindings and must not reinterpret `ROUTER_SKILL_DIR` as their own directory.
```

- [ ] **Step 3: Replace the Chinese `## 路径绑定` section**

In `.agents/skills/00-skill-lifecycle-router/zh-CN.md`, replace the full `## 路径绑定` section with:

```markdown
## 路径绑定

执行任何工作流步骤前，先将 `ROUTER_SKILL_DIR` 绑定为根 `skill-lifecycle-router/SKILL.md` 所在目录的绝对路径。

router 使用三个显式路径根：

| 路径根 | 绑定到 | 归属 |
| ------ | ------ | ---- |
| `ROUTER_SKILL_DIR` | 当前根 router `SKILL.md` 所在目录的绝对路径 | router `SKILL.md`、`zh-CN.md`、内部子 skill、router 约束 |
| `TARGET_WORKSPACE` | 用户指定的工作区；如无歧义，则为当前目标仓库根目录 | `docs/specs`、`docs/plans`、`docs/test`、`docs/notes` 下的生命周期报告 |
| `TARGET_SKILL_DIR` | 已确定的正在创建或修改的目标 skill 目录 | 目标 skill 的 `SKILL.md`、`zh-CN.md`、scripts、templates、references |

`ROUTER_SKILL_DIR` 是 router 自有文件的唯一根目录：
- 子 skill 文件：`ROUTER_SKILL_DIR/skill-lifecycle-<stage>/SKILL.md`
- router 约束文件：`ROUTER_SKILL_DIR/docs/constraints/*.md`
- router 子 skill 中任何指向 router 自有文件的相对路径

`TARGET_WORKSPACE` 绑定规则：
- 如果用户明确指定 workspace，则绑定到该绝对路径。
- 否则绑定到当前目标仓库根目录。
- 如果当前工作目录位于某个仓库内部，使用该仓库根目录，而不是嵌套的当前目录。
- 如果存在多个可能的 workspace，进入阶段前只问一个问题。
- 除非 router package 本身就是目标工作区，否则不要把 `TARGET_WORKSPACE` 绑定为 `ROUTER_SKILL_DIR`。

禁止从当前 shell 工作目录、项目根目录或 `TARGET_WORKSPACE` 解析 router 自有文件。如果某个路径在 `ROUTER_SKILL_DIR` 和项目工作区中都可能存在，只有指令明确写 `ROUTER_SKILL_DIR` 时才使用 `ROUTER_SKILL_DIR`。

生命周期输出产物，例如 `TARGET_WORKSPACE/docs/specs/<skill-name>-design.md` 和 `TARGET_WORKSPACE/docs/plans/<skill-name>-plan.md`，默认属于目标工作区，除非用户明确另有说明。

子 skill 继承这些绑定，不能把 `ROUTER_SKILL_DIR` 重新解释为子 skill 自己的目录。
```

- [ ] **Step 4: Update root workflow references**

In `.agents/skills/00-skill-lifecycle-router/SKILL.md`, replace Step 5 with:

```markdown
Read `ROUTER_SKILL_DIR/skill-lifecycle-<stage>/SKILL.md`. Follow its instructions to execute the stage. Do NOT invoke it via Skill tool — execute it directly as the router.
```

In `.agents/skills/00-skill-lifecycle-router/zh-CN.md`, replace Step 5 with:

```markdown
读取 `ROUTER_SKILL_DIR/skill-lifecycle-<stage>/SKILL.md`，按其中指令执行。不要通过 Skill 工具调用——直接作为 router 执行。
```

- [ ] **Step 5: Update root artifact status tables to use `TARGET_WORKSPACE`**

In `.agents/skills/00-skill-lifecycle-router/SKILL.md`, replace the artifact table entries and feedback scan sentence with:

```markdown
| design | Done / Not started | `TARGET_WORKSPACE/docs/specs/<skill-name>-design.md` |
| plan | Done / Not started | `TARGET_WORKSPACE/docs/plans/<skill-name>-plan.md` |
| task | Done / Not started | Skill SKILL.md and related files under `TARGET_SKILL_DIR` |
| test | Done / Not started | `TARGET_WORKSPACE/docs/test/<skill-name>-test-report.md` |
| review | Done / Not started | `TARGET_WORKSPACE/docs/notes/<skill-name>-review.md` |
| feedback | Issues pending / None | `TARGET_WORKSPACE/docs/notes/<skill-name>-feedback.md` |

Also scan `TARGET_WORKSPACE/docs/notes/<skill-name>-feedback.md` for unresolved issues and show them.
```

In `.agents/skills/00-skill-lifecycle-router/zh-CN.md`, replace the same table entries and feedback scan sentence with:

```markdown
| design | 已完成 / 未开始 | `TARGET_WORKSPACE/docs/specs/<skill-name>-design.md` |
| plan | 已完成 / 未开始 | `TARGET_WORKSPACE/docs/plans/<skill-name>-plan.md` |
| task | 已完成 / 未开始 | `TARGET_SKILL_DIR` 下的 Skill SKILL.md 及相关文件 |
| test | 已完成 / 未开始 | `TARGET_WORKSPACE/docs/test/<skill-name>-test-report.md` |
| review | 已完成 / 未开始 | `TARGET_WORKSPACE/docs/notes/<skill-name>-review.md` |
| feedback | 有待处理问题 / 无 | `TARGET_WORKSPACE/docs/notes/<skill-name>-feedback.md` |

同时扫描 `TARGET_WORKSPACE/docs/notes/<skill-name>-feedback.md`，列出未解决的问题。
```

- [ ] **Step 6: Verify root files**

```bash
! rg -n "THIS_SKILL_DIR" .agents/skills/00-skill-lifecycle-router/SKILL.md .agents/skills/00-skill-lifecycle-router/zh-CN.md
rg -n "ROUTER_SKILL_DIR|TARGET_WORKSPACE|TARGET_SKILL_DIR" .agents/skills/00-skill-lifecycle-router/SKILL.md .agents/skills/00-skill-lifecycle-router/zh-CN.md
```

Expected:
- First command prints no matches and exits successfully.
- Second command prints matches in both root files.

- [ ] **Step 7: Commit root router changes**

```bash
git add .agents/skills/00-skill-lifecycle-router/SKILL.md .agents/skills/00-skill-lifecycle-router/zh-CN.md
git commit -m "docs(skill-lifecycle-router): bind explicit path roots"
```

---

### Task 2: Update Design, Plan, Task, And Test Sub-Skills

**Files:**
- Modify: `.agents/skills/00-skill-lifecycle-router/skill-lifecycle-design/SKILL.md`
- Modify: `.agents/skills/00-skill-lifecycle-router/skill-lifecycle-plan/SKILL.md`
- Modify: `.agents/skills/00-skill-lifecycle-router/skill-lifecycle-task/SKILL.md`
- Modify: `.agents/skills/00-skill-lifecycle-router/skill-lifecycle-test/SKILL.md`

- [ ] **Step 1: Run baseline verification and confirm old relative paths are present**

```bash
rg -n "\\.\\./docs|Path Contract|TARGET_WORKSPACE|TARGET_SKILL_DIR" \
  .agents/skills/00-skill-lifecycle-router/skill-lifecycle-design/SKILL.md \
  .agents/skills/00-skill-lifecycle-router/skill-lifecycle-plan/SKILL.md \
  .agents/skills/00-skill-lifecycle-router/skill-lifecycle-task/SKILL.md \
  .agents/skills/00-skill-lifecycle-router/skill-lifecycle-test/SKILL.md
```

Expected output includes `../docs/specs`, `../docs/plans`, and `../docs/test` matches.

- [ ] **Step 2: Add the shared Path Contract to all four files**

In each file, insert this section immediately after the `**Core principle:** ...` paragraph:

```markdown
## Path Contract

This sub-skill is executed by the root router. It inherits:

- `ROUTER_SKILL_DIR`: absolute path to the root `skill-lifecycle-router` package directory.
- `TARGET_WORKSPACE`: absolute path to the workspace where lifecycle artifacts live.
- `TARGET_SKILL_DIR`: absolute path to the skill being created or modified, when applicable.

Do not resolve router-owned files from the current working directory. Do not use `../docs/...` for router-owned files or lifecycle artifacts.
```

- [ ] **Step 3: Update design output path**

In `.agents/skills/00-skill-lifecycle-router/skill-lifecycle-design/SKILL.md`, replace Process step 5 with:

```markdown
5. Write the design doc to `TARGET_WORKSPACE/docs/specs/<skill-name>-design.md`
```

In the Self-Check section, replace:

```markdown
- [ ] Design document exists at the specified path
```

with:

```markdown
- [ ] Design document exists at `TARGET_WORKSPACE/docs/specs/<skill-name>-design.md`
```

- [ ] **Step 4: Update plan input and output paths**

In `.agents/skills/00-skill-lifecycle-router/skill-lifecycle-plan/SKILL.md`, replace Process step 1 and step 5 with:

```markdown
1. Read the design doc from `TARGET_WORKSPACE/docs/specs/<skill-name>-design.md`
5. Write the plan doc to `TARGET_WORKSPACE/docs/plans/<skill-name>-plan.md`
```

In the Self-Check section, replace:

```markdown
- [ ] Plan file exists
```

with:

```markdown
- [ ] Plan file exists at `TARGET_WORKSPACE/docs/plans/<skill-name>-plan.md`
```

- [ ] **Step 5: Update task input and output paths**

In `.agents/skills/00-skill-lifecycle-router/skill-lifecycle-task/SKILL.md`, replace the Process list with:

```markdown
1. Read the plan doc from `TARGET_WORKSPACE/docs/plans/<skill-name>-plan.md`
2. Execute each plan step in order
3. Produce artifacts under `TARGET_SKILL_DIR`: SKILL.md, zh-CN.md, scripts, templates as defined by the plan
4. Commit after each completed step (frequent commits)
5. Run self-check before declaring completion
```

In the Self-Check section, replace:

```markdown
- [ ] All produced files exist at their specified paths
```

with:

```markdown
- [ ] All produced files exist under `TARGET_SKILL_DIR` at their specified paths
```

- [ ] **Step 6: Update test output path**

In `.agents/skills/00-skill-lifecycle-router/skill-lifecycle-test/SKILL.md`, replace Process step 4 with:

```markdown
4. Write test report to `TARGET_WORKSPACE/docs/test/<skill-name>-test-report.md`
```

In the Self-Check section, replace:

```markdown
- [ ] Test report exists
```

with:

```markdown
- [ ] Test report exists at `TARGET_WORKSPACE/docs/test/<skill-name>-test-report.md`
```

- [ ] **Step 7: Verify execution sub-skills**

```bash
! rg -n "\\.\\./docs" \
  .agents/skills/00-skill-lifecycle-router/skill-lifecycle-design/SKILL.md \
  .agents/skills/00-skill-lifecycle-router/skill-lifecycle-plan/SKILL.md \
  .agents/skills/00-skill-lifecycle-router/skill-lifecycle-task/SKILL.md \
  .agents/skills/00-skill-lifecycle-router/skill-lifecycle-test/SKILL.md

rg -n "Path Contract|TARGET_WORKSPACE|TARGET_SKILL_DIR|ROUTER_SKILL_DIR" \
  .agents/skills/00-skill-lifecycle-router/skill-lifecycle-design/SKILL.md \
  .agents/skills/00-skill-lifecycle-router/skill-lifecycle-plan/SKILL.md \
  .agents/skills/00-skill-lifecycle-router/skill-lifecycle-task/SKILL.md \
  .agents/skills/00-skill-lifecycle-router/skill-lifecycle-test/SKILL.md
```

Expected:
- First command prints no matches and exits successfully.
- Second command prints the Path Contract and explicit root references in all four files.

- [ ] **Step 8: Commit execution sub-skill changes**

```bash
git add \
  .agents/skills/00-skill-lifecycle-router/skill-lifecycle-design/SKILL.md \
  .agents/skills/00-skill-lifecycle-router/skill-lifecycle-plan/SKILL.md \
  .agents/skills/00-skill-lifecycle-router/skill-lifecycle-task/SKILL.md \
  .agents/skills/00-skill-lifecycle-router/skill-lifecycle-test/SKILL.md
git commit -m "docs(skill-lifecycle-router): root execution artifacts explicitly"
```

---

### Task 3: Update Review And Feedback Sub-Skills

**Files:**
- Modify: `.agents/skills/00-skill-lifecycle-router/skill-lifecycle-review/SKILL.md`
- Modify: `.agents/skills/00-skill-lifecycle-router/skill-lifecycle-feedback/SKILL.md`

- [ ] **Step 1: Run baseline verification and confirm review/feedback still use ambiguous paths**

```bash
rg -n "\\.\\./docs|constraints/|Path Contract|ROUTER_SKILL_DIR|TARGET_WORKSPACE" \
  .agents/skills/00-skill-lifecycle-router/skill-lifecycle-review/SKILL.md \
  .agents/skills/00-skill-lifecycle-router/skill-lifecycle-feedback/SKILL.md
```

Expected output includes `../docs/constraints`, `../docs/notes`, and `constraints/<stage>-constraints.md`.

- [ ] **Step 2: Add the shared Path Contract to both files**

In both files, insert this section immediately after the `**Core principle:** ...` paragraph:

```markdown
## Path Contract

This sub-skill is executed by the root router. It inherits:

- `ROUTER_SKILL_DIR`: absolute path to the root `skill-lifecycle-router` package directory.
- `TARGET_WORKSPACE`: absolute path to the workspace where lifecycle artifacts live.
- `TARGET_SKILL_DIR`: absolute path to the skill being created or modified, when applicable.

Do not resolve router-owned files from the current working directory. Do not use `../docs/...` for router-owned files or lifecycle artifacts.
```

- [ ] **Step 3: Update review constraint and report paths**

In `.agents/skills/00-skill-lifecycle-router/skill-lifecycle-review/SKILL.md`, replace the Overview paragraph with:

```markdown
Structured review of lifecycle artifacts (design doc, plan doc, task output, test report). Reads the appropriate constraint checklist from `ROUTER_SKILL_DIR/docs/constraints/` based on artifact type. Each finding is categorized by severity and routed back to the correct stage via the feedback loop.
```

Replace Process step 2 and step 7 with:

```markdown
2. Read the corresponding constraint file from `ROUTER_SKILL_DIR/docs/constraints/`:
   - `design-constraints.md` for design doc
   - `plan-constraints.md` for plan doc
   - `task-constraints.md` for task output
   - `test-constraints.md` for test report
7. Write review report to `TARGET_WORKSPACE/docs/notes/<skill-name>-review.md`
```

In the Review Report Format block, replace:

```markdown
**Constraint checklist:** constraints/<stage>-constraints.md
```

with:

```markdown
**Constraint checklist:** ROUTER_SKILL_DIR/docs/constraints/<stage>-constraints.md
```

- [ ] **Step 4: Update feedback constraint and note paths**

In `.agents/skills/00-skill-lifecycle-router/skill-lifecycle-feedback/SKILL.md`, replace user-initiated Process step 5 with:

```markdown
5. Write feedback note to `TARGET_WORKSPACE/docs/notes/<skill-name>-feedback.md`
```

Replace auto-triggered Process steps 3 and 4 with:

```markdown
3. Format each issue per `ROUTER_SKILL_DIR/docs/constraints/feedback-note-constraints.md`
4. Append (not overwrite) to `TARGET_WORKSPACE/docs/notes/<skill-name>-feedback.md`
```

Replace the Output Format intro with:

```markdown
Follow `ROUTER_SKILL_DIR/docs/constraints/feedback-note-constraints.md`:
```

In the Self-Check section, replace:

```markdown
- [ ] Feedback note exists
```

with:

```markdown
- [ ] Feedback note exists at `TARGET_WORKSPACE/docs/notes/<skill-name>-feedback.md`
```

- [ ] **Step 5: Verify review and feedback sub-skills**

```bash
! rg -n "\\.\\./docs|\\bconstraints/<stage>-constraints\\.md\\b" \
  .agents/skills/00-skill-lifecycle-router/skill-lifecycle-review/SKILL.md \
  .agents/skills/00-skill-lifecycle-router/skill-lifecycle-feedback/SKILL.md

rg -n "Path Contract|ROUTER_SKILL_DIR/docs/constraints|TARGET_WORKSPACE/docs/notes" \
  .agents/skills/00-skill-lifecycle-router/skill-lifecycle-review/SKILL.md \
  .agents/skills/00-skill-lifecycle-router/skill-lifecycle-feedback/SKILL.md
```

Expected:
- First command prints no matches and exits successfully.
- Second command prints explicit router constraint paths and target workspace note paths.

- [ ] **Step 6: Commit review and feedback changes**

```bash
git add \
  .agents/skills/00-skill-lifecycle-router/skill-lifecycle-review/SKILL.md \
  .agents/skills/00-skill-lifecycle-router/skill-lifecycle-feedback/SKILL.md
git commit -m "docs(skill-lifecycle-router): root review artifacts explicitly"
```

---

### Task 4: Run Final Package Validation

**Files:**
- Verify: `.agents/skills/00-skill-lifecycle-router/**`

- [ ] **Step 1: Run negative path-root validation**

```bash
! rg -n "THIS_SKILL_DIR|\\.\\./docs|\\.agents/skills/skill-lifecycle-router" .agents/skills/00-skill-lifecycle-router
```

Expected:
- No output.
- Command exits successfully because `! rg` inverts `rg`'s no-match exit code.

- [ ] **Step 2: Run positive path-root validation**

```bash
rg -n "ROUTER_SKILL_DIR|TARGET_WORKSPACE|TARGET_SKILL_DIR" .agents/skills/00-skill-lifecycle-router
```

Expected output includes:

```text
.agents/skills/00-skill-lifecycle-router/SKILL.md:...:ROUTER_SKILL_DIR
.agents/skills/00-skill-lifecycle-router/SKILL.md:...:TARGET_WORKSPACE
.agents/skills/00-skill-lifecycle-router/SKILL.md:...:TARGET_SKILL_DIR
.agents/skills/00-skill-lifecycle-router/skill-lifecycle-review/SKILL.md:...:ROUTER_SKILL_DIR/docs/constraints
.agents/skills/00-skill-lifecycle-router/skill-lifecycle-feedback/SKILL.md:...:ROUTER_SKILL_DIR/docs/constraints/feedback-note-constraints.md
```

- [ ] **Step 3: Verify markdown edit cleanliness**

```bash
git diff --check -- .agents/skills/00-skill-lifecycle-router
```

Expected:
- No output.
- Exit code 0.

- [ ] **Step 4: Verify root English and Chinese docs mention the same path roots**

```bash
rg -n "ROUTER_SKILL_DIR|TARGET_WORKSPACE|TARGET_SKILL_DIR" \
  .agents/skills/00-skill-lifecycle-router/SKILL.md \
  .agents/skills/00-skill-lifecycle-router/zh-CN.md
```

Expected:
- All three root names appear in both files.

- [ ] **Step 5: Inspect changed files**

```bash
git status --short .agents/skills/00-skill-lifecycle-router
git log --oneline -3
```

Expected:
- `git status --short` shows no unstaged changes for files committed in Tasks 1-3.
- The last three commits correspond to Tasks 1, 2, and 3.

---

## Self-Review

**Spec coverage**

- `ROUTER_SKILL_DIR` replacing `THIS_SKILL_DIR`: Task 1.
- `TARGET_WORKSPACE` lifecycle report paths: Tasks 1, 2, and 3.
- `TARGET_SKILL_DIR` target skill outputs: Tasks 1 and 2.
- Parent artifact path override: implemented through root/sub-skill wording in Tasks 1-3.
- Review and feedback constraints rooted at `ROUTER_SKILL_DIR`: Task 3.
- Final negative and positive validation commands: Task 4.

**Placeholder scan**

- No placeholder markers are used as instructions.
- Every command includes expected output or expected exit behavior.
- Every file modification step names exact files and exact replacement text.

**Type and name consistency**

- The plan consistently uses `ROUTER_SKILL_DIR`, `TARGET_WORKSPACE`, and `TARGET_SKILL_DIR`.
- The router package path is consistently `.agents/skills/00-skill-lifecycle-router`.
- The validation target is consistently `.agents/skills/00-skill-lifecycle-router`.
