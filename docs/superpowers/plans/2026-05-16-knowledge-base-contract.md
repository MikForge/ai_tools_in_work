# Knowledge Base Shared Contract Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 contract-design spec 落成 `.agents/skills/knowledge-base-router/references/contract.md`，作为所有知识库 skill 的共享契约 reference 文件。

**Architecture:** 单文件 reference document（非 skill，无 SKILL.md），从 spec 中提取配置结构、正文边界、索引模型、命名契约、Audit Report Protocol 和文档异常分类六部分，供 router 和所有 internal worker 引用。

**Tech Stack:** Markdown only，无代码依赖。

**Parent spec:** [knowledge-base-skill-architecture-design](../../docs/superpowers/specs/2026-05-15-knowledge-base-skill-architecture-design.md)
**Source spec:** [knowledge-base-contract-design](../../docs/superpowers/specs/2026-05-15-knowledge-base-contract-design.md)

---

### Task 1: Create directory structure

**Files:**
- Create: `.agents/skills/knowledge-base-router/references/` (directory)

- [ ] **Step 1: Create directories**

```bash
mkdir -p .agents/skills/knowledge-base-router/references
```

- [ ] **Step 2: Verify structure**

```bash
ls -d .agents/skills/knowledge-base-router/references/
```
Expected: `.agents/skills/knowledge-base-router/references/`

- [ ] **Step 3: Commit**

```bash
git add .agents/skills/knowledge-base-router/
git commit -m "$(cat <<'EOF'
feat: scaffold knowledge-base-router references directory
EOF
)"
```

---

### Task 2: Write contract.md — header, config contract, document boundaries

**Files:**
- Create: `.agents/skills/knowledge-base-router/references/contract.md`

- [ ] **Step 1: Write header + config contract + document boundaries sections**

Write to `.agents/skills/knowledge-base-router/references/contract.md`:

```markdown
# Knowledge Base Shared Contract

> **Referenced by:** `knowledge-base-router` and all internal workers (`knowledge-base-init`, `knowledge-base-context`, `knowledge-base-author`, `knowledge-base-publisher`, `knowledge-base-auditor`, `knowledge-base-gardener`)
> **Source spec:** `docs/superpowers/specs/2026-05-15-knowledge-base-contract-design.md`
> **Parent spec:** `docs/superpowers/specs/2026-05-15-knowledge-base-skill-architecture-design.md`
>
> This file is the canonical shared contract. All workers MUST reference this file for configuration, index, naming, and audit report rules. No worker may redefine these rules independently.

## Configuration Contract

### File Location

`.knowledge-base.yml` at the repository root. No other location is valid.

### Schema

```yaml
knowledge_base:
  root: docs/00-project-knowledge-base          # required — relative to repo root
  index: README.md                               # required — root index filename
  filename_style: kebab-case                     # required — only kebab-case in phase 1
  index_format: markdown-list                    # required — only markdown-list in phase 1
  categories:                                    # required — at least one category
    - name: architecture                         # required — unique stable identifier
      path: 01-project-layer/03-architecture     # required — relative to root
      index: README.md                           # required — category index filename
      description: >-                            # required — human-readable, used for matching
        Architecture, module relationships, and layering.
```

### Field Rules

| Field | Required | Notes |
|-------|----------|-------|
| `knowledge_base.root` | yes | Relative path from repo root to knowledge base root |
| `knowledge_base.index` | yes | Root index filename, defaults to `README.md` |
| `knowledge_base.filename_style` | yes | Phase 1: only `kebab-case` |
| `knowledge_base.index_format` | yes | Phase 1: only `markdown-list` |
| `knowledge_base.categories[].name` | yes | Must be unique across categories |
| `knowledge_base.categories[].path` | yes | Relative to `root`; must not overlap or point to same directory as another category |
| `knowledge_base.categories[].index` | yes | Category index filename, defaults to `README.md` |
| `knowledge_base.categories[].description` | yes | Used for classification matching |

### Configuration Constraints

1. Skills MUST NOT guess the knowledge base location from common directory names.
2. Existing config takes precedence over default templates.
3. Only `knowledge-base-init` (in Empty or init-compatible Partial state) and `knowledge-base-gardener` (within confirmed audit scope) may create or modify `.knowledge-base.yml`. All other workers MUST NOT touch it.
4. `categories` is the sole source of truth for publishing and retrieval. Unconfigured categories MUST NOT be auto-created.
5. All `root`, `index`, `categories[].path`, and `categories[].index` values MUST be relative paths. Absolute paths and `..` are forbidden.
6. `categories[].name` MUST be unique.
7. `categories[].path` MUST NOT be nested within or point to the same directory as another category's path.

## Document Boundaries

A document is a valid knowledge base entry only if ALL of the following are true:

1. Located under `.knowledge-base.yml` `root`.
2. Located under a configured category `path`.
3. Filename is NOT the category's `index`.
4. Discoverable via the category index.

### Non-Documents

The following are explicitly NOT knowledge base content, even if they are Markdown files:

- `README.md` index files (root, layer, category).
- `docs/superpowers/specs/**`.
- `docs/superpowers/plans/**`.
- Repository root README.
- Skill repository indexes.
- Any Markdown not governed by `.knowledge-base.yml`.

### Orphan Documents

A Markdown file located under a category path but NOT referenced by the category index is an **Orphan** candidate. Only `knowledge-base-auditor` may report orphans; only `knowledge-base-gardener` may add them to an index or archive them after user confirmation.
```

- [ ] **Step 2: Commit**

```bash
git add .agents/skills/knowledge-base-router/references/contract.md
git commit -m "$(cat <<'EOF'
feat: add contract.md header, config contract, and document boundaries
EOF
)"
```

---

### Task 3: Write index model and naming contract sections

**Files:**
- Modify: `.agents/skills/knowledge-base-router/references/contract.md` (append)

- [ ] **Step 1: Append index model and naming contract sections**

Append to `.agents/skills/knowledge-base-router/references/contract.md`:

```markdown
## Index Model

### Hierarchy

```text
.knowledge-base.yml
  → {root}/{index}                          # root index
    → {root}/{layer}/README.md              # layer index
      → {root}/{category.path}/{category.index}  # category index
        → content documents
```

- A **layer** is the first segment of `categories[].path`. For `01-project-layer/03-architecture`, the layer is `01-project-layer`.
- A **layer index** is always `{root}/{layer}/README.md`.
- A **category index** is `{root}/{categories[].path}/{categories[].index}`.

### Discovery Rules

1. `knowledge-base-context` MUST discover documents through the index chain, never by scanning directories directly.
2. `knowledge-base-publisher` MUST update the category index after writing a content document.
3. `knowledge-base-auditor` MAY scan config, indexes, and content to detect anomalies, but defaults to report-only.
4. `knowledge-base-gardener` MAY repair indexes within confirmed scope, but MUST NOT expand the scope beyond the audit report.

### Index Entry Format

```markdown
## Documents

- [agent-skill-harness.md](agent-skill-harness.md): Agent skill harness architecture notes.
```

### Index Entry Rules

1. Link paths MUST be relative to the current index file.
2. The summary after the colon SHOULD come from: the document's opening paragraph, author's suggested summary, or user-provided summary — in that order.
3. Publisher MUST NOT fabricate summaries without basis. If none of the above sources are available, use the document title or leave the summary empty and report the omission.
4. Entries within a category index MUST be sorted by filename in ascending order. Re-sorting is a mechanical fix that `knowledge-base-gardener` may perform after confirmation.

## Naming Contract

### Phase 1: kebab-case Only

All content document filenames MUST use `kebab-case`:

```
✓ agent-skill-harness.md
✓ knowledge-base-router-bootstrap.md
✗ agent_skill_harness.md
✗ AgentSkillHarness.md
✗ agent skill harness.md
✗ 智能体技能.md
```

### Filename Generation Priority

1. User-explicitly-provided filename (highest priority).
2. Generated from title or topic if no user input.
3. MUST NOT contain: spaces, CJK punctuation, underscores, uppercase letters.

### Conflict Handling

If the generated filename already exists in the target category, STOP and ask the user: update existing, save under a different name, or cancel.
```

- [ ] **Step 2: Commit**

```bash
git add .agents/skills/knowledge-base-router/references/contract.md
git commit -m "$(cat <<'EOF'
feat: add index model and naming contract to contract.md
EOF
)"
```

---

### Task 4: Write Audit Report Protocol and Document Anomaly Classification

**Files:**
- Modify: `.agents/skills/knowledge-base-router/references/contract.md` (append)

- [ ] **Step 1: Append audit report protocol and anomaly classification sections**

Append to `.agents/skills/knowledge-base-router/references/contract.md`:

```markdown
## Audit Report Protocol

`knowledge-base-auditor` MUST produce reports in this fixed structure. Free-form prose describing "something feels off" is not acceptable. Every Partial, Broken, Conflict, or Document Anomaly MUST use this template.

### Report Template

```markdown
# Knowledge Base Audit Report

## Status
Partial | Broken | Conflict | Content Drift | Content Quality | Duplicate | Stale | Orphan | Misclassified | Warning

## Severity
blocking | warning | info

## Summary
One sentence explaining why the current state cannot proceed with normal read/write, or why the document needs attention.

## Evidence
- Expected: <expected state>
- Actual: <actual state>
- Files:
  - `<path>`
- Config source: `.knowledge-base.yml`

## Impact
The risk caused by this anomaly: broken index chain, unreachable documents, overwrite risk, unclassifiable category, factual error.

## Recommended Fix
Suggested action. This is a recommendation only — it does NOT represent that the fix has been applied.

## Suggested Next Skill
knowledge-base-init | knowledge-base-gardener | knowledge-base-author | user-manual-fix | none

## Requires Confirmation
yes | no

## Suggested Gardener Scope
When Suggested Next Skill is `knowledge-base-gardener`: list the files and action scope the gardener is permitted to modify. Otherwise: `n/a`.
```

### Protocol Rules

1. **Evidence** MUST cite actual paths, config fields, index links, or content fragment locations. Subjective judgment alone is not sufficient.
2. **Recommended Fix** is a suggestion only. The report does not mean the fix has been applied.
3. **Suggested Next Skill** MUST be consistent with the anomaly type:
   - init-compatible Partial → `knowledge-base-init`
   - Semantic rewrite needed → `knowledge-base-author`
   - Structural repair needed → `knowledge-base-gardener`
4. **Suggested Next Skill** is a routing recommendation, NOT an execution authorization. Only `knowledge-base-router` may generate a new `Worker Handoff Payload` after re-checking the Bootstrap Gate, user confirmation, and required fields.
5. **Suggested Gardener Scope** is the upper bound for `knowledge-base-gardener` execution. Gardener MUST NOT expand this scope.
6. **Severity levels:**
   - `blocking` — Router, publisher, and context MUST stop normal read/write.
   - `warning` — Normal reads may continue; publishing or governance requires confirmation.
   - `info` — Non-blocking, maintenance hint only.
7. **Status types:**
   - Structural: `Partial`, `Broken`, `Conflict`, `Warning`
   - Content: `Content Drift`, `Content Quality`, `Duplicate`, `Stale`, `Orphan`, `Misclassified`
8. When the recommended fix involves factual rewrites, merging, archiving, or migration, **Requires Confirmation** MUST be `yes`.

## Document Anomaly Classification

| Type | Definition | Default Handling |
|------|------------|------------------|
| Content Drift | Content description inconsistent with repo, config, or actual files | Report evidence; route to author for draft revision |
| Content Quality | Vague title, missing summary, disorganized structure, unclear sourcing | Report quality issues; route to author for draft rewrite |
| Duplicate | Multiple documents covering the same topic or with conflicting conclusions | Report duplicate relationship; wait for user confirmation |
| Stale | References to old directories, commands, or skill names | Report stale references; wait for confirmation to fix |
| Orphan | Content exists under a category path but is not referenced by the category index | Report orphan; wait for confirmation to index or archive |
| Misclassified | Content does not match its current category | Report classification suggestion; wait for migration confirmation |
```

- [ ] **Step 2: Commit**

```bash
git add .agents/skills/knowledge-base-router/references/contract.md
git commit -m "$(cat <<'EOF'
feat: add audit report protocol and document anomaly classification to contract.md
EOF
)"
```

---

### Task 5: Verification — cross-check contract.md against spec

**Files:**
- Read: `.agents/skills/knowledge-base-router/references/contract.md`
- Read: `docs/superpowers/specs/2026-05-15-knowledge-base-contract-design.md`

- [ ] **Step 1: Verify all spec sections are covered**

Checklist (manual verification):

| Spec Section | contract.md Coverage |
|---|---|
| 配置契约 — schema fields | Configuration Contract > Schema + Field Rules |
| 配置契约 — constraints | Configuration Contract > Configuration Constraints (items 1-7) |
| 正文边界 — valid document criteria | Document Boundaries (4 conditions) |
| 正文边界 — non-documents list | Document Boundaries > Non-Documents |
| 正文边界 — orphan definition | Document Boundaries > Orphan Documents |
| 索引模型 — hierarchy | Index Model > Hierarchy |
| 索引模型 — discovery rules | Index Model > Discovery Rules (items 1-4) |
| 索引模型 — entry format + rules | Index Model > Index Entry Format + Rules (items 1-4) |
| 命名契约 — kebab-case + generation + conflict | Naming Contract (all 3 subsections) |
| Audit Report Protocol — template fields | Audit Report Protocol > Report Template |
| Audit Report Protocol — all 8 rules | Audit Report Protocol > Protocol Rules (items 1-8) |
| 文档异常分类 — 6 types | Document Anomaly Classification table |
| 使用方式 — contract location | Header reference block |
| 使用方式 — no independent skill | (implicit: file is reference, not skill) |

- [ ] **Step 2: Verify no placeholders or TBDs in contract.md**

```bash
grep -in 'TBD\|TODO\|FIXME\|...\|xxx' .agents/skills/knowledge-base-router/references/contract.md || echo "NO_PLACEHOLDERS_FOUND"
```
Expected: `NO_PLACEHOLDERS_FOUND`

- [ ] **Step 3: Verify contract.md is not a skill (no SKILL.md, no frontmatter)**

```bash
test -f .agents/skills/knowledge-base-router/references/SKILL.md && echo "ERROR: SKILL.md exists" || echo "OK: no SKILL.md"
head -5 .agents/skills/knowledge-base-router/references/contract.md | grep -q '^---$' && echo "ERROR: frontmatter found" || echo "OK: no frontmatter"
```
Expected: `OK` for both checks.

- [ ] **Step 4: Commit verification result (if any fixes needed) or confirm complete**

```bash
git status
```
If clean after verification, no commit needed. If fixes were applied:

```bash
git add .agents/skills/knowledge-base-router/references/contract.md
git commit -m "$(cat <<'EOF'
fix: verify contract.md completeness against spec
EOF
)"
```
```

---

## Self-Review

### 1. Spec Coverage

| Spec requirement | Task | Status |
|---|---|---|
| `.knowledge-base.yml` schema + field rules | Task 2 | Covered |
| Configuration constraints (7 items) | Task 2 | Covered |
| Document boundaries (4 conditions) | Task 2 | Covered |
| Non-documents list | Task 2 | Covered |
| Orphan definition | Task 2 | Covered |
| Index hierarchy | Task 3 | Covered |
| Index discovery rules (4 items) | Task 3 | Covered |
| Index entry format + rules (4 items) | Task 3 | Covered |
| Naming contract (kebab-case, generation priority, conflict) | Task 3 | Covered |
| Audit Report Protocol template (all fields) | Task 4 | Covered |
| Protocol rules (8 items) | Task 4 | Covered |
| Document anomaly classification (6 types) | Task 4 | Covered |
| Usage: file location at `references/contract.md` | Task 1-2 | Covered |
| Usage: not a skill, no SKILL.md | Task 5 verification | Covered |
| Usage: no independent contract skill | Implicit (file is reference) | Covered |

### 2. Placeholder Scan

No TBD, TODO, FIXME, or placeholder patterns in any task content. All markdown content is complete and concrete.

### 3. Type Consistency

N/A — no code types, functions, or method signatures. Contract field names match the spec exactly.

---

## Execution Handoff

Plan complete. This is a single-file documentation task with 5 sequential tasks. Two execution options:

**1. Inline Execution (适合此任务)** — 单文件、5 个 task、无测试依赖，在当前 session 直接执行最快

**2. Subagent-Driven** — 每个 task 派发独立 subagent，适合并行但本任务各 task 有顺序依赖

推荐 inline execution。
