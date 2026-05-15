---
name: knowledge-base-read
description: Use when needing to load relevant project knowledge from the knowledge base into context — search docs, find background info, or understand project conventions before starting work. Pure read, no side effects.
---

# Knowledge Base Read

## Overview

Config-driven read-only skill for loading documents from the project knowledge base. All paths and categories come from `.knowledge-base.yml`. Index-only navigation — never scan directories directly.

## Principles

1. **Config is the single source of truth.** Read `.knowledge-base.yml` first. If it doesn't exist, stop and tell the user to run `knowledge-base-update` to initialize.
2. **Index-only navigation.** Document discovery goes through README.md indexes. Never use `ls`, `find`, `grep`, or any directory scan on the KB root.
3. **Top-down, never skip levels.** Root index → category index → document. Each step depends on the previous level's index.
4. **Knowledge base boundary.** Only search within the `root` path defined in `.knowledge-base.yml`. Documents outside the KB root are out of scope.
5. **Honest emptiness.** Empty category or no match → report it. Never fabricate content or search outside the KB root.

## Modes

| Mode | Trigger | Behavior |
|------|---------|----------|
| **Search** | `query` parameter provided | Match categories → read category index → match documents → return results |
| **Browse** | No `query` (bare invocation) | Start at root README → user picks layer → user picks category → user picks document |

## Workflow

### Search Mode

1. **Read config** — Parse `.knowledge-base.yml`, get `root` and `categories`.
2. **Read root index** — `{root}/README.md` for category overview.
3. **Match category** — Match `query` against `categories[].name` and `description`. If multiple categories match, list candidates and ask user to choose. Skip if `category` param is explicitly provided.
4. **Read category index** — `{root}/{category.path}/README.md` for document list.
5. **Match documents** — Match query against document titles and summaries in the category index.
6. **Return results** — Top 1-3 matches loaded in full, rest as title + summary only. Report "no match" honestly if nothing found.

### Browse Mode

1. **Read config** — Same as search.
2. **Show root index** — Present layers and categories from `{root}/README.md`.
3. **Navigate one level at a time** — Let user pick at each level (layer → category → document). Never dump the entire tree at once.

## Output Format

```markdown
## Knowledge Base: "<query>"

### Matched Documents

- **[doc-title.md]({root}/{category}/doc-title.md)** — {category name}
  {full content}

### Other Matches

- **[other.md]({root}/{category}/other.md)** — {one-line summary}
```

Rules:
- Max 3 full-text documents. Remaining matches get title + one-line summary only.
- Always include category name and relative path for each document.
- No results: `No documents matching "<query>" found in the knowledge base.`
- Empty category: `Category "<name>" exists but has no documents yet.`

## Common Mistakes

| Mistake | Correct |
|---------|---------|
| Using `ls`/`find`/`grep` to discover documents | Navigate exclusively through README.md indexes |
| Skipping `.knowledge-base.yml` and guessing paths | Read config first, every time |
| Dumping entire KB tree in browse mode | One level at a time, wait for user choice |
| Searching outside the KB root directory | Only read files under the configured `root` path |
| Loading 5+ documents into context | Max 3 full-text, rest summaries only |
| Making up content when nothing matches | Report "no matching documents" honestly |
| Picking a category when query matches several | List candidates, ask user to choose |
