---
name: knowledge-base-auditor
description: >-
  Internal worker for knowledge-base-router. Not user-invocable;
  executes only with a complete Worker Handoff Payload from knowledge-base-router.
  Audits knowledge-base config, indexes, and content for anomalies. Report-only by default.
disable-model-invocation: true
user-invocable: false
type: discipline-enforcing
---

# Knowledge Base Auditor

## Overview

`knowledge-base-auditor` is a skill-shaped internal instruction module within the `knowledge-base-router` package. It audits the knowledge base for structural and content anomalies and outputs fixed-format Audit Report Protocol reports.

It is report-only by default. It does NOT modify files, create indexes, or execute repairs.

## When to Use

**Trigger:** Router hands off after Bootstrap Gate failure (non-Empty), user requests audit, pre-maintenance check, or suspected document anomaly.

**Do NOT use when:** User is only reading from a Ready knowledge base with no anomaly signals. Do NOT use as a replacement for `knowledge-base-context`.

### Known Rationalizations (Rejected)

| Rationalization | Why It's Wrong |
| --- | --- |
| "User says check, I can skip the router" | All requests enter through router. Auditor only executes with valid payload. |
| "This missing index is easy to fix, I'll just create it" | Auditor is report-only. Fixing is gardener's responsibility. |
| "While checking, I'll clean up duplicates" | Checking and fixing must be separate. Output the report first. |
| "The report format doesn't need to be that rigid" | The Audit Report Protocol is a contract. Gardener and future automation consume these reports by field. |

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
| `intent` | MUST be `audit` |
| `kb_state` | `Ready`, `Partial`, or `Broken`. `Empty` normally does not enter auditor unless router needs a non-default anomaly report. |
| `target_worker` | MUST be `knowledge-base-auditor` |
| `confirmation_status` | MUST be `not_required` or `confirmed` |
| `missing_fields` | If non-empty, report only. Do NOT audit. |

### Required Worker Payload Fields

| Field | Requirement |
| ----- | ----------- |
| `audit_reason` | MUST exist. Reason for the audit. |

Optional: `focus_paths`, `gate_evidence`.

## Report-Only Contract

Auditor has a strict report-only boundary:

- Output: one or more Audit Report Protocol reports with risk levels and suggested fix order.
- NEVER: modify files, create indexes, fix links, write content, or execute repairs.
- Every report MUST use the exact Audit Report Protocol template from `../references/contract.md`.

## Audit Inputs

- `.knowledge-base.yml` (if exists).
- Root, layer, and category indexes (if exist).
- Content document candidates under config `root` (if root exists).
- Optional user focus scope.
- Router's `Worker Handoff Payload`.

## Audit Checks

1. **Config validity:** Is `.knowledge-base.yml` parseable?
2. **Path existence:** Do `root`, layer directories, category directories, and index files exist?
3. **Index link validity:** Do index links point to existing documents?
4. **Orphan detection:** Are there content files in category directories NOT referenced by any category index?
5. **Content anomalies:** Duplicate topics, stale content, empty indexes, broken links.
6. **Document anomalies:** Content drift, quality issues, misclassification, factual conflicts.
7. **Partial classification:** Is the Partial state init-compatible (scaffold only) or repair-required (existing content)?

### Partial Determination Rules

- **init-compatible Partial:** Only init scaffold is missing, default root is empty or scaffold-only, no existing files would be overwritten. Suggest `knowledge-base-init`.
- **repair-required Partial:** Existing content, unknown files, orphan documents, config fixes needed, index repairs needed, migrations, or any case where files could be overwritten. Suggest `knowledge-base-gardener`.
- **Broken:** Do NOT suggest init. Must be repaired by gardener or user to a parseable state first.

## Audit Report Protocol

Every finding MUST use the fixed template from `../references/contract.md#audit-report-protocol`. Key fields:

```markdown
# Knowledge Base Audit Report

## Status
Partial | Broken | Conflict | Content Drift | Content Quality | Duplicate | Stale | Orphan | Misclassified | Warning

## Severity
blocking | warning | info

## Summary
...

## Evidence
- Expected: ...
- Actual: ...
- Files: ...

## Impact
...

## Recommended Fix
...

## Suggested Next Skill
knowledge-base-init | knowledge-base-gardener | knowledge-base-author | user-manual-fix | none

## Requires Confirmation
yes | no

## Suggested Gardener Scope
...
```

Protocol rules from the contract apply. Evidence MUST cite actual paths, config fields, index links, or content fragments.

## Document Anomaly Handling

| Type | Auditor Action |
| --- | --- |
| Content Drift | Report evidence and recommendation. Route to author for draft revision. |
| Content Quality | Report quality issues. Route to author for draft rewrite. |
| Duplicate | Report duplicate relationship. Wait for user confirmation. |
| Stale | Report stale references. Wait for confirmation to fix. |
| Orphan | Report unindexed content. Wait for confirmation to index or archive. |
| Misclassified | Report classification mismatch. Wait for migration confirmation. |

## Handoff to Gardener

When the audit is complete and repairs are needed, auditor outputs a `Handoff Recommendation`:

```markdown
## Handoff Recommendation

- From: knowledge-base-auditor
- Recommended next worker: knowledge-base-gardener
- Reason: Audit found repair-required issues
- Payload delta:
  - audit_report: <report content or reference>
  - approved_scope: <awaiting user confirmation>
- Requires user confirmation: yes
- Missing fields:
  - approved_scope (requires user confirmation)
```

Auditor does NOT authorize gardener to execute. Only router can generate the gardener's `Worker Handoff Payload` after user confirmation.

## Common Mistakes

1. **Creating a missing index file during audit.** Auditor is report-only. Creating files is init or gardener work.
2. **Skipping the Audit Report Protocol format.** Free-form prose is not consumable by gardener or automation. Use the exact template.
3. **Marking a repair-required Partial as init-compatible.** If existing content is present, it's repair-required. Init would overwrite.
4. **Suggesting gardener without a `Suggested Gardener Scope`.** Gardener needs explicit scope boundaries.
5. **Executing without a valid handoff payload.** Redirect to router.

## Contract References

- [Configuration Contract](../references/contract.md#configuration-contract)
- [Index Model](../references/contract.md#index-model)
- [Audit Report Protocol](../references/contract.md#audit-report-protocol)
- [Document Anomaly Classification](../references/contract.md#document-anomaly-classification)
