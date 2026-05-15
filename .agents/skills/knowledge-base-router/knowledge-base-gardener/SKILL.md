---
name: knowledge-base-gardener
description: >-
  Internal worker for knowledge-base-router. Not user-invocable;
  executes only with a complete Worker Handoff Payload from knowledge-base-router.
  Executes knowledge-base maintenance repairs within confirmed scope based on auditor reports.
disable-model-invocation: true
user-invocable: false
type: discipline-enforcing
---

# Knowledge Base Gardener

## Overview

`knowledge-base-gardener` is a skill-shaped internal instruction module within the `knowledge-base-router` package. It executes knowledge-base maintenance repairs — dedup, migration, index fixes, rot repairs — strictly within the scope confirmed by the user and bounded by an auditor report.

It defaults to dry-run. It does NOT expand scope, execute without a report, or perform semantic rewrites.

## When to Use

**Trigger:** Router hands off with a valid auditor report AND user-confirmed `approved_scope`, with `intent=maintain` and `confirmation_status=confirmed`.

**Do NOT use when:** No auditor report, no user-confirmed scope, request for semantic rewrite, request to add new content, `mode` not explicitly `apply`.

### Known Rationalizations (Rejected)

| Rationalization | Why It's Wrong |
| --- | --- |
| "User says clean up, I can skip router/auditor" | All requests enter through router. Gardener needs auditor report + confirmed scope. |
| "User says clean up = I can modify the whole KB" | Scope is bounded by the auditor report's `Suggested Gardener Scope`. |
| "The report lists a few files, but related files should be fixed too" | Gardener MUST NOT expand beyond confirmed scope. |
| "I'll rewrite the summaries while I'm at it" | Semantic rewrites belong to author. Gardener does mechanical fixes only. |

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
| `intent` | MUST be `maintain` |
| `kb_state` | `Ready`, `Partial`, or `Broken`. Empty init is NOT gardener. |
| `target_worker` | MUST be `knowledge-base-gardener` |
| `confirmation_status` | MUST be `confirmed` to execute `apply`. Unconfirmed → dry-run only or refuse. |
| `missing_fields` | If non-empty, report only. Do NOT modify files. |

### Required Worker Payload Fields

| Field | Requirement |
| ----- | ----------- |
| `audit_report` | MUST exist. The auditor report(s) to act on. |
| `approved_scope` | MUST exist. User-confirmed repair scope. MUST NOT exceed the `Suggested Gardener Scope` from the audit report. |

Optional: `report_items`, `mode`. `mode` defaults to `dry-run` when not explicitly `apply`.

## Preconditions

Before any action, gardener MUST verify:

1. A valid auditor report exists.
2. User has confirmed the repair scope.
3. `approved_scope` does not exceed the report's `Suggested Gardener Scope`.
4. `mode` is `apply` for execution; otherwise dry-run only.

## Dry-Run First Rule

When `mode` is not explicitly `apply`, gardener outputs a dry-run plan:

```markdown
## Dry-Run Plan

### Would Modify
- `<path>`: <action description>

### Based On
- Report item: <reference to auditor report>

### Requires Confirmation
yes

### To Execute
Set mode: apply and confirm the scope above.
```

## Allowed Repairs

| Repair | Condition |
| --- | --- |
| Create missing index files | Within confirmed scope |
| Fix or complete `.knowledge-base.yml` | Within report and confirmed scope |
| Repair index links | Broken links within confirmed scope |
| Add orphan documents to index | Orphan report confirmed |
| Move misclassified documents | Confirmed migration with index updates |
| Archive or merge duplicates | Confirmed merge with user's choice |
| Copy/unify index summaries from existing sources | Mechanical only. New semantic summaries → author |
| Re-sort index entries | Mechanical fix |

## Forbidden Actions

- Execute without report + confirmed scope.
- Large-scale structural changes without confirmation.
- Delete content without migration notes or user confirmation.
- Disguise semantic rewrites as mechanical fixes.
- Generate new semantic summaries (route to author).
- Modify files outside `approved_scope`.

## Scope Confirmation

If the scope is ambiguous, gardener asks exactly ONE question:

```markdown
The auditor report recommends the following repairs. Which items should I proceed with?

1. <item 1> — <files>
2. <item 2> — <files>

Reply with item numbers, "all", or "cancel".
```

## Apply Workflow

1. Receive auditor report and confirmed scope.
2. Output dry-run plan (even in apply mode, confirm what will be done).
3. Execute repairs within confirmed scope only.
4. Run minimal self-check on modified files.
5. Report modified files and any remaining risks.

## Self-Check

After apply, verify:

1. Each modified file exists and is reachable.
2. Index links point to existing documents.
3. No files outside `approved_scope` were modified.
4. No content was semantically rewritten (mechanical changes only).

If self-check fails, do NOT declare completion. Return to the auditor report.

## Common Mistakes

1. **Executing without an auditor report.** Gardener is report-driven. No report = no execution.
2. **Expanding beyond `approved_scope`.** Scope boundaries are hard limits.
3. **Skipping dry-run.** Always show what will be done, even in apply mode.
4. **Semantic rewrites disguised as fixes.** "Fixing" a summary by rewriting it is author work.
5. **Deleting content without user confirmation.** Even stale content needs explicit confirmation before removal.
6. **Executing without a valid handoff payload.** Redirect to router.

## Contract References

- [Configuration Contract](../references/contract.md#configuration-contract)
- [Index Model](../references/contract.md#index-model)
- [Audit Report Protocol](../references/contract.md#audit-report-protocol)
- [Document Anomaly Classification](../references/contract.md#document-anomaly-classification)
