---
name: knowledge-base-publisher
description: >-
  Internal worker for knowledge-base-router. Not user-invocable;
  executes only with a complete Worker Handoff Payload from knowledge-base-router.
  Writes confirmed drafts to disk, updates indexes, and runs self-checks.
disable-model-invocation: true
user-invocable: false
type: discipline-enforcing
---

# Knowledge Base Publisher

## Overview

`knowledge-base-publisher` is a skill-shaped internal instruction module within the `knowledge-base-router` package. It is the ONLY worker that writes confirmed content drafts to the knowledge base. It handles classification, naming, conflict resolution, file writing, index updates, and publish self-checks.

It does NOT create unconfigured categories, rewrite content substantially, skip index updates, create missing root/layer/category index files (that's auditor/gardener), or do full-knowledge-base governance.

## When to Use

**Trigger:** Router hands off with `kb_state=Ready`, `intent=publish`, `confirmation_status=confirmed`, and a valid `Worker Handoff Payload` containing `operation` and `draft_or_target`.

**Do NOT use when:** Not Ready, unconfirmed publish, missing draft or target, cross-category migration/dedup/archive needed, Orphan index backfill (existing unindexed Markdown), missing index files.

### Known Rationalizations (Rejected)

| Rationalization | Why It's Wrong |
| --- | --- |
| "User wants to save, I can publish directly" | Must enter through router. Publish requires confirmed payload. |
| "I'll write the file now and update the index later" | Index must be updated atomically with the write. Orphan documents are the result of splitting these. |
| "The category doesn't exist, I'll create one" | Only configured categories are valid. New categories require config changes. |
| "rename can also move across categories" | Cross-category moves are governance. Must go through auditor → gardener. |

## Invocation Control

This is an internal worker, NOT a public skill.

- `agents/openai.yaml` sets `policy.allow_implicit_invocation: false`.
- Frontmatter sets `disable-model-invocation: true` and `user-invocable: false`.
- If triggered directly, redirect to router and list missing handoff fields.

## Handoff Payload Validation

### Required Common Fields

| Field | Required Value |
| ----- | -------------- |
| `source` | MUST be `knowledge-base-router` |
| `request_origin` | MUST be preserved |
| `intent` | MUST be `publish` |
| `kb_state` | MUST be `Ready` |
| `target_worker` | MUST be `knowledge-base-publisher` |
| `confirmation_status` | MUST be `confirmed`. Without this, NO writes. |
| `missing_fields` | If non-empty, report only. Do NOT write. |

### Required Worker Payload Fields

| Field | Requirement |
| ----- | ----------- |
| `operation` | MUST be `add`, `update`, `rename`, or `index-only` |
| `draft_or_target` | MUST exist. `add` requires confirmed draft content. `update`/`rename` require target file/index path. `index-only` requires target file and the index path to backfill within the current publish chain. |

Optional: `category_hint`, `filename`, `summary`. `category_hint` is a hint only — NOT final classification.

## Publish Inputs

- Markdown content draft (for `add`).
- Operation type.
- Optional `category_hint` from user, router, or author suggestion.
- Optional filename.
- User-confirmed overwrite or save-as choice.

## Operation Boundaries

| Operation | Precondition | Allowed Behavior |
| --------- | ------------ | ---------------- |
| `add` | Confirmed draft, confirmed publish intent, target file does NOT exist | Resolve category, write content, add category index entry |
| `update` | Target file exists, user confirmed update | Minimal overwrite of target content, keep index reachable |
| `rename` | Target file exists, new name does not conflict, same category | Rename file within category, update category index |
| `index-only` | Within current add/update/rename publish chain, target file confirmed, content file exists, only index entry is missing | Backfill category index entry only. Do NOT modify content. |

Cross-category moves, batch migrations, dedup merges, and archiving are NOT publisher operations. They MUST go through `auditor → gardener`.

## Category Resolution

Priority order:

1. User explicitly specified category.
2. Router's `category_hint` or author's category suggestion.
3. Match against `categories[].name` and `description` from `.knowledge-base.yml`.

If multiple categories could match, publisher MUST ask the user. Publisher does NOT create new categories. If the user wants a new category, suggest config update or governance flow.

## File Naming

For `add` operations:

1. Use user-provided filename if given.
2. Otherwise generate from title/topic in `kebab-case`.
3. MUST NOT contain: spaces, CJK punctuation, underscores, uppercase letters.
4. If generated filename conflicts with an existing file, ask: update, save-as, or cancel.

## Conflict Handling

| Scenario | Behavior |
| --- | --- |
| Target file does not exist | Proceed with `add` |
| Target file exists, user explicitly wants update | Proceed with `update` |
| Target file exists, user intent unclear | Ask: update, save-as, or cancel |
| Index has matching link but file is missing | Generate Conflict report, suggest auditor |
| File exists in current publish chain but index entry missing | May use `index-only` after user confirmation |
| Existing file in category directory not referenced by index | Orphan. Stop. Suggest auditor/gardener. |

## Index Update

Publisher ONLY updates:

- The target category index.
- Layer/root index entries when needed — only adding link entries to EXISTING index files.

Publisher does NOT:

- Create missing index files (that's init or gardener).
- Scan the full knowledge base.
- Reorganize beyond mechanical sorting.
- Cross-category migration.

Index entries follow the contract's `markdown-list` format. Entries are sorted by filename in ascending order within the category index.

## Rename and Index-Only Rules

### `rename` Boundary

- Only within the SAME category.
- Sync update the category index: remove old link, add new link.
- Cross-category moves, batch migrations, duplicate merges → auditor → gardener.

### `index-only` Boundary

- ONLY for index backfill within the current add/update/rename publish chain (e.g., content was written or renamed by this publisher flow but the index entry is missing or needs retry).
- Existing Markdown in a category directory but NOT referenced by the category index → Orphan. Stop. Suggest auditor → gardener.
- Missing content file, path outside category, or missing category index → Stop. Suggest auditor/gardener.

## Publish Self-Check

After every publish operation, verify ALL of the following:

1. Content file exists.
2. Content path is under config `root` and target category.
3. Category comes from `.knowledge-base.yml`.
4. Category index contains a link to the content.
5. Link path is reachable.
6. No unconfirmed overwrite occurred.
7. For `index-only`: content was NOT modified.
8. For `rename`: old link removed, new link reachable.

If ANY check fails, do NOT declare completion. Output the failed checks and suggest next steps.

## Common Mistakes

1. **Writing content without updating the index.** Index must be updated atomically with the write.
2. **Creating a new category on the fly.** Only configured categories exist. New ones require config change.
3. **Treating `category_hint` as final.** Always verify against `.knowledge-base.yml` and confirm with user if ambiguous.
4. **Using `index-only` for pre-existing unindexed Markdown.** That's an Orphan. Must go through auditor → gardener.
5. **Using `rename` for cross-category moves.** That's governance. Auditor → gardener.
6. **Skipping the self-check after publish.** Never claim completion without verifying all checks pass.
7. **Executing without `confirmation_status=confirmed`.** Any write (add, overwrite, update, rename, index-only) requires confirmed status.

## Contract References

- [Configuration Contract](../references/contract.md#configuration-contract)
- [Index Model](../references/contract.md#index-model)
- [Audit Report Protocol](../references/contract.md#audit-report-protocol)
- [Naming Contract](../references/contract.md#naming-contract)
