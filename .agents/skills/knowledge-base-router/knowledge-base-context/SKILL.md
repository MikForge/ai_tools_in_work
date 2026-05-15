---
name: knowledge-base-context
description: >-
  Internal worker for knowledge-base-router. Not user-invocable;
  executes only with a complete Worker Handoff Payload from knowledge-base-router.
  Reads knowledge-base content on demand through the index chain, never by scanning directories.
disable-model-invocation: true
user-invocable: false
type: technique
---

# Knowledge Base Context

## Overview

`knowledge-base-context` is a skill-shaped internal instruction module within the `knowledge-base-router` package. Its sole responsibility is loading project knowledge-base content on demand through the configured index chain. It solves the problem of "the agent doesn't know what to read or how to find it."

It does NOT write files, scan directories directly, load unlimited documents, or fabricate non-existent content.

## When to Use

**Trigger:** Router hands off with `kb_state=Ready` and `intent=read`, with a valid `Worker Handoff Payload` specifying a mode and any required parameters.

**Do NOT use when:** Empty, Partial, Broken state; write/publish/maintain requests; no valid handoff payload.

### Known Rationalizations (Rejected)

| Rationalization | Why It's Wrong |
| --- | --- |
| "It's just a read, no need for the router" | Even reads need Bootstrap Gate. A Partial index means documents may be undiscoverable. |
| "The index might be incomplete, I'll just find/ls the directory" | Content discovery MUST go through indexes. Directory scanning bypasses the contract. |
| "Let me load more full documents to be safe" | `max_full_documents` caps at 3. Overloading context with full documents is exactly what this cap prevents. |
| "The file is in the category directory, I can read it directly" | Only index-referenced documents are valid. Unreferenced files are Orphans and must go through auditor. |

## Invocation Control

This is an internal worker, NOT a public skill.

- `agents/openai.yaml` sets `policy.allow_implicit_invocation: false`.
- Frontmatter sets `disable-model-invocation: true` and `user-invocable: false`.
- If triggered directly (without a valid `Worker Handoff Payload` from `knowledge-base-router`), the ONLY allowed behavior is to explain that the request must enter through `knowledge-base-router` and list the missing handoff fields.

## Handoff Payload Validation

Context MUST validate the `Worker Handoff Payload` before any read.

### Required Common Fields

| Field | Required Value |
| ----- | -------------- |
| `source` | MUST be `knowledge-base-router` |
| `request_origin` | MUST be preserved; context MUST NOT overwrite |
| `intent` | MUST be `read` |
| `kb_state` | MUST be `Ready` |
| `target_worker` | MUST be `knowledge-base-context` |
| `confirmation_status` | MUST be `not_required` or `confirmed`; if `required`, halt |
| `missing_fields` | If non-empty, report missing fields only |

### Required Worker Payload Fields

| Field | Required Value |
| ----- | -------------- |
| `mode` | MUST be `browse`, `search`, `category-search`, or `exact-path` |

Mode-specific requirements:
- `search`: requires `query`
- `category-search`: requires `query` AND `category`
- `exact-path`: requires `path`
- `browse`: no additional required fields

`max_full_documents` defaults to 3 and MUST NOT exceed 3.

## Read-Only Contract

Context has strict read-only boundaries:

- Read: `.knowledge-base.yml`, root index, layer indexes, category indexes, content documents referenced by category indexes.
- NEVER: write files, scan directories with `find`/`ls` for content discovery, load more than `max_full_documents` full documents, fabricate or guess document content.
- Content documents are valid ONLY if they pass all [Document Boundaries](../references/contract.md#document-boundaries) checks and are referenced by their category index.
- If a path exists in a category directory but is NOT referenced by the category index, it is an Orphan. Do NOT read it directly; suggest auditor.

## Browse Mode

Triggered when `mode=browse` with no `query`, `category`, or `path`.

1. Read `.knowledge-base.yml`.
2. Read root index at `{root}/{index}`.
3. Display the layers listed in the root index.
4. Wait for user selection.
5. On layer selection, read the layer index at `{root}/{layer}/README.md`.
6. Display the categories listed in the layer index.
7. On category selection, read the category index.
8. Display document titles, paths, and summaries from the category index.

Each step shows ONE level only. Wait for user choice before descending.

## Search Mode

### Search (`mode=search` with `query`)

1. Read `.knowledge-base.yml`.
2. Read root index.
3. Match `query` against `categories[].name` and `categories[].description` to find candidate categories.
4. If multiple categories match and the user's intent requires precise classification, list candidates for user selection.
5. If no category matches or the query is more topical, iterate all configured category indexes for index-level search.
6. For each candidate category, read and verify the layer index (first segment of `categories[].path`).
7. Read the category index.
8. Match documents in the category index by filename, link text, and summary.
9. Load full text of the most relevant 1–3 documents (capped by `max_full_documents`).
10. Return titles, paths, and summaries for remaining hits.

### Category-Search (`mode=category-search` with `query` and `category`)

Skip category matching. Read only the specified category's index and match within it.

## Exact Path Mode

Triggered when `mode=exact-path` with `path`.

1. Verify `path` is under `.knowledge-base.yml` `root`.
2. Verify `path` is under a configured category path.
3. Verify `path` is referenced by the category index.
4. If all checks pass, read and return the full document.
5. If any check fails: for path escapes, refuse. For unindexed files, report Orphan and suggest auditor. For broken links, report broken link evidence and suggest auditor.

## Output Format

### Search Results

```markdown
## Knowledge Base Results: "<query>"

### Loaded Documents

- `<path>` — `<category>`

<document excerpt or full content>

### Other Matches

- `<path>`: <summary>
```

### No Results

```markdown
No knowledge base documents matched "<query>".
```

### Browse Mode

Show one level at a time. Wait for user selection before descending.

## Failure Handoffs

| Scenario | Behavior |
| --- | --- |
| Config missing | Return bootstrap failure to router |
| Category not found | List available categories from config |
| Category index missing | Output Audit Report Protocol candidate, suggest auditor |
| Document link broken | Output broken link evidence, suggest auditor |
| Multiple category matches | Ask ONE category selection question |
| `path` not referenced by category index | Refuse direct read, suggest auditor report Orphan |
| `path` outside config root | Refuse. Report path escape. |

## Common Mistakes

1. **Scanning directories with `find`/`ls` to discover documents.** All discovery goes through the index chain.
2. **Loading more than `max_full_documents` full documents.** The cap is 3. Router MUST NOT inflate it.
3. **Reading a file just because it's in a category directory.** Only index-referenced documents are valid. Unreferenced files are Orphans.
4. **Auto-selecting a category when multiple match.** Ask the user. One question.
5. **Fabricating content when a link is broken.** Report the broken link and suggest auditor.
6. **Executing without a valid handoff payload.** Redirect to router.

## Contract References

All rules from the shared contract at `../references/contract.md` apply. Key sections:

- [Configuration Contract](../references/contract.md#configuration-contract)
- [Index Model](../references/contract.md#index-model)
- [Document Boundaries](../references/contract.md#document-boundaries)
- [Audit Report Protocol](../references/contract.md#audit-report-protocol)
