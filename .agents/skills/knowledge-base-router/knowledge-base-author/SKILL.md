---
name: knowledge-base-author
description: >-
  Internal worker for knowledge-base-router. Not user-invocable;
  executes only with a complete Worker Handoff Payload from knowledge-base-router.
  Generates or revises knowledge-base Markdown drafts without writing to disk.
disable-model-invocation: true
user-invocable: false
type: technique
---

# Knowledge Base Author

## Overview

`knowledge-base-author` is a skill-shaped internal instruction module within the `knowledge-base-router` package. Its sole responsibility is generating or revising knowledge-base Markdown drafts from user-provided material, code analysis, session notes, or context-loaded content.

It does NOT write files, update indexes, decide final paths or filenames, or fabricate facts.

## When to Use

**Trigger:** Router hands off with `kb_state=Ready`, `intent=author`, and sufficient `source_material` and `writing_goal`.

**Do NOT use when:** No source material, request to write to disk, request to fix structural anomalies, unconfirmed handoff payload.

### Known Rationalizations (Rejected)

| Rationalization | Why It's Wrong |
| --- | --- |
| "The user wants a draft, I can skip the router" | All requests enter through router. Author only executes with a valid payload. |
| "The draft is done, I'll save it directly" | Writing to disk is publisher's responsibility. Author produces drafts only. |
| "The category is obvious, I'll set the final path" | Category suggestion is a hint. Final classification is publisher's decision. |
| "The material is thin, I'll add some common knowledge" | Author preserves user facts. No fabrication. |

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
| `intent` | MUST be `author` |
| `kb_state` | MUST be `Ready` |
| `target_worker` | MUST be `knowledge-base-author` |
| `confirmation_status` | MUST be `not_required` or `confirmed` |
| `missing_fields` | If non-empty, report only |

### Required Worker Payload Fields

| Field | Requirement |
| ----- | ----------- |
| `source_material` | MUST exist. User material, code analysis, session notes, or a task summary referencing `context_documents`. |
| `writing_goal` | MUST be one of: `new-draft`, `revise`, `summarize`, `structure`. |

If `source_material` is only a topic, title, or vague intent, `context_documents` or other factual material MUST also be present. Otherwise, author reports missing information only.

`writing_goal=revise` requires `revision_target`.

`context_documents` is optional but MUST only come from `knowledge-base-context` or user-provided material.

## Draft-Only Contract

Author has strict output-only boundaries:

- Output: Markdown draft, suggested title, suggested summary, optional category suggestion from configured categories.
- NEVER: write files, update indexes, decide final paths, fabricate sources or facts, mix governance recommendations into content.

## Draft Structure

Recommended structure (adapt to material, don't force empty sections):

```markdown
# <Title>

## 背景

## 核心内容

## 操作或约束

## 相关文件

## 注意事项
```

## Revision Workflow

1. Receive existing content via `context_documents` from `knowledge-base-context`.
2. Identify the scope the user wants to change.
3. Generate a minimal revision draft.
4. Annotate key changes.
5. Output draft with `Handoff Recommendation` for publisher or user confirmation.

Author does NOT directly overwrite the original file.

## Fact Preservation

- Preserve user's original facts. Do NOT inflate into unverified conclusions.
- When citing code, paths, or commands, keep them exact.
- When drafting from session transcripts, remove pleasantries and process noise.
- When drafting from code analysis, distinguish facts, inferences, and suggestions.
- When revising existing content, make minimal changes based on context results.
- Category suggestions MUST come from `.knowledge-base.yml` configured categories. If uncertain, output "no category suggestion".
- If material is insufficient to produce a draft, state what is missing. Do NOT fabricate.

## Category Suggestions

Author MAY output:

```markdown
Suggested category: architecture
Reason: Document describes module relationships and layering constraints.
```

The final category is determined by publisher based on `.knowledge-base.yml` and user confirmation. The suggestion is a hint only.

## Handoff to Publisher

When the draft is complete, author outputs a `Handoff Recommendation`:

```markdown
## Handoff Recommendation

- From: knowledge-base-author
- Recommended next worker: knowledge-base-publisher
- Reason: Draft complete and ready for publishing
- Payload delta:
  - draft_or_target: <draft content>
  - suggested_category: <category or none>
  - suggested_title: <title>
  - suggested_summary: <summary>
- Requires user confirmation: yes
- Missing fields:
  - operation (to be set by router or user)
  - filename (to be set by router or user)
```

Author does NOT overwrite `request_origin`, does NOT treat the category suggestion as final, and does NOT treat the recommendation as publish authorization.

## Common Mistakes

1. **Writing the draft directly to disk.** Author outputs drafts only. Publisher writes files.
2. **Treating the category suggestion as the final path.** Publisher decides based on config and user confirmation.
3. **Fabricating facts when material is thin.** State what's missing. Don't invent.
4. **Mixing governance observations into content drafts.** "This document seems stale" belongs in an audit report, not a content draft.
5. **Skipping the handoff payload check when triggered directly.** Redirect to router.
6. **Overwriting `request_origin` in the handoff recommendation.** Preserve the original source.

## Contract References

- [Configuration Contract](../references/contract.md#configuration-contract)
- [Document Anomaly Classification](../references/contract.md#document-anomaly-classification)
