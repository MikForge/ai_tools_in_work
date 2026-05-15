---
name: knowledge-base-update
description: Use when initializing, writing, updating, archiving, or indexing Markdown documents in the project knowledge base. Triggers include "写入知识库", "save to KB", "归档文档", "archive this doc", "初始化知识库", "init knowledge base", "索引这个文档".
---

# Knowledge Base Update

## Overview

Config-driven skill for writing Markdown documents into the project knowledge base. All paths, categories, and index rules come from `.knowledge-base.yml` at the repo root. Never hardcode directory paths.

## When to Use

- User asks to write, save, archive, or update knowledge base documents
- User provides Markdown content to persist as project knowledge
- User wants to register an existing document in the knowledge base index
- User asks to initialize the project knowledge base

**NOT for:** reading/searching KB content (→ `knowledge-base-read`), writing design docs (→ `writing-plans`), managing project rules (→ `managing-project-rules`), recording ideas (→ `record-idea`).

## Principles

1. **Config is the single source of truth.** `.knowledge-base.yml` defines root, categories, index format, filename style. Read it first, always.
2. **Template is init-only.** `knowledge-base.yml.temp` is used ONLY when both `.knowledge-base.yml` AND the target KB directory are absent. Never overwrite existing config.
3. **Index is mandatory.** Every write, update, or archive must update the corresponding index file. Agents WILL forget this — it is your responsibility.
4. **Stop on uncertainty.** Missing config, ambiguous categories, file conflicts → stop and ask. Do not guess.
5. **Minimal change surface.** Modify only the target document and its index. Do not touch layer READMEs or config unless asked.

## Configuration

Read `.knowledge-base.yml` at the repo root. Full schema and default template are in [`knowledge-base-spec.md`](knowledge-base-spec.md).

Config discovery order:
1. User-specified config path (explicit in request)
2. `.knowledge-base.yml` at repo root

If neither exists and user is NOT requesting init → stop, show the default template, ask user to confirm.

## Workflow

```
User request
    │
    ▼
Read .knowledge-base.yml
    │
    ├── Config exists? ──No── Target dir exists? ──No── → INIT (step 3)
    │                          │
    │                          Yes → STOP: "config missing but directory exists — resolve this mismatch"
    │
    └── Config exists? ──Yes── → Proceed to operation
```

### Step 1: Read config

Read `.knowledge-base.yml` from repo root. Parse `root`, `categories`, `index_format`, `filename_style`.

### Step 2: Check if init is needed

Init is required ONLY when BOTH conditions are true:
- `.knowledge-base.yml` does not exist
- The default KB target directory (`docs/00-project-knowledge-base/`) does not exist

If only one is missing, it's an anomaly — stop and ask user to resolve.

### Step 3: Init (only when both conditions met)

1. Copy `knowledge-base.yml.temp` from skill directory to repo root as `.knowledge-base.yml`
2. Create directory structure per config: `root/` and all `categories[].path/`
3. Write root `README.md` as the entry point
4. Write layer `README.md` files as navigation (layer directories only)
5. Write leaf directory `README.md` files with empty document index
6. Report what was created, ask user if they want to continue with the original operation

### Step 4: Confirm operation type

Four operations:
- **add** — new document to a category
- **update** — modify existing document, preserve original content
- **archive** — move document out of active categories (only if archive path exists in config)
- **index-only** — register an existing file into the index without modifying it

Ask user if the operation is unclear.

### Step 5: Determine target location

Priority order:
1. User explicitly names a category, directory, or path
2. Match against `categories[].name` and `description` from config
3. **If ambiguous** → list candidate categories, ask user. Do NOT guess.

### Step 6: Determine filename

Priority order:
1. User-provided filename
2. Derive kebab-case filename from title/topic
3. **If target file exists** → ask whether to update or save as new file

### Step 7: Write or update document

- **add**: write new file to target directory
- **update**: read existing content first, make minimal changes per user intent
- **archive**: move file only if archive path is in config; otherwise ask user
- **index-only**: skip to Step 8, do not touch the document

Preserve user's original content. Only fix obvious Markdown formatting issues.

### Step 8: Update index

**This step is mandatory. Do NOT skip it.**

- If category has `index` configured → update category index
- Otherwise → update root index (`knowledge_base.index`)
- `markdown-list` format: linked list entries
- `markdown-table` format: `| Document | Summary |` table
- Sort entries alphabetically by filename
- If index file doesn't exist and path is from config → create a minimal index

### Step 9: Report

List every file modified (document + index), which config was used. Do not claim unverified results.

## Index Rules

**markdown-list:**
```markdown
## Documents

- [agent-workflow.md](agent-workflow.md): Agent workflow notes.
- [harness-engineering.md](harness-engineering.md): Harness engineering principles.
```

**markdown-table:**
```markdown
## Documents

| Document | Summary |
|---|---|
| [agent-workflow.md](agent-workflow.md) | Agent workflow notes. |
| [harness-engineering.md](harness-engineering.md) | Harness engineering principles. |
```

The `Summary` for a new entry comes from the first paragraph or heading of the document.

## Common Mistakes

| Mistake | Correct |
|---------|---------|
| Guessing KB location from directory names | Read `.knowledge-base.yml`. Only trust config. |
| Creating files without config | Stop, show default template, ask user to init. |
| Inventing unconfigured categories | Use only config categories. If ambiguous, ask user. |
| Writing doc but skipping index update | **Mandatory:** update the index after every write. |
| Auto-modifying `.knowledge-base.yml` | Never touch config unless user explicitly asks to update it. |
| Rewriting user's content heavily | Preserve original. Only fix obvious formatting issues. |
| Creating entire directory scaffold without asking | During init, create only what config specifies, then ask user to continue. |

## Constraint Documents

- [`knowledge-base-spec.md`](knowledge-base-spec.md) — `.knowledge-base.yml` full schema, field reference, and default template
