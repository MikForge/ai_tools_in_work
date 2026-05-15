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
| ----- | -------- | ----- |
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

## Index Model

### Hierarchy

```text
.knowledge-base.yml
  → {root}/{index}                               # root index
    → {root}/{layer}/README.md                   # layer index
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

```text
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
| ---- | ---------- | ---------------- |
| Content Drift | Content description inconsistent with repo, config, or actual files | Report evidence; route to author for draft revision |
| Content Quality | Vague title, missing summary, disorganized structure, unclear sourcing | Report quality issues; route to author for draft rewrite |
| Duplicate | Multiple documents covering the same topic or with conflicting conclusions | Report duplicate relationship; wait for user confirmation |
| Stale | References to old directories, commands, or skill names | Report stale references; wait for confirmation to fix |
| Orphan | Content exists under a category path but is not referenced by the category index | Report orphan; wait for confirmation to index or archive |
| Misclassified | Content does not match its current category | Report classification suggestion; wait for migration confirmation |
