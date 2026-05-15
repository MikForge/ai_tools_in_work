---
name: knowledge-base-init
description: >-
  Internal worker for knowledge-base-router. Not user-invocable;
  executes only with a complete Worker Handoff Payload from knowledge-base-router.
  Creates knowledge-base scaffold from Empty or init-compatible Partial state.
disable-model-invocation: true
user-invocable: false
type: technique
---

# Knowledge Base Init

## Overview

`knowledge-base-init` is a skill-shaped internal instruction module within the `knowledge-base-router` package. Its sole responsibility is creating the knowledge-base harness from scratch when the Bootstrap Gate reports Empty, or filling in missing scaffold when auditor has determined init-compatible Partial.

It does NOT migrate old documents, merge existing directories, or repair repair-required Partial/Broken states.

## When to Use

**Trigger:** Router hands off with `kb_state=Empty` AND explicit user init confirmation; OR router hands off with auditor-confirmed init-compatible Partial.

**Do NOT use when:** Ready, Broken, repair-required Partial, existing content files would be overwritten, user wants to migrate/merge/archive existing content.

### Known Rationalizations (Rejected)

| Rationalization | Why It's Wrong |
| --- | --- |
| "The user wants to init, I can skip the router" | All external requests MUST enter through `knowledge-base-router`. Init only executes with a valid payload. |
| "Root already exists, I'll just overwrite it" | Overwriting existing files destroys content. If root has files, stop and suggest auditor/gardener. |
| "Missing a few READMEs, I'll just create them directly" | Missing indexes are Partial state. Must go through auditor to determine init-compatible vs repair-required. |
| "While I'm at it, I'll write the first document" | Init creates scaffold only. Content belongs to author/publisher. |

## Invocation Control

This is an internal worker, NOT a public skill.

- `agents/openai.yaml` sets `policy.allow_implicit_invocation: false`.
- Frontmatter sets `disable-model-invocation: true` and `user-invocable: false`.
- If triggered directly (without a valid `Worker Handoff Payload` from `knowledge-base-router`), the ONLY allowed behavior is to explain that the request must enter through `knowledge-base-router` and list the missing handoff fields.
- Even if the runtime does not enforce invocation control, this worker MUST reject direct external requests.

## Handoff Payload Validation

Init MUST validate the `Worker Handoff Payload` before any file creation.

### Required Common Fields

| Field | Required Value |
| ----- | -------------- |
| `source` | MUST be `knowledge-base-router` |
| `request_origin` | MUST be preserved; init MUST NOT overwrite |
| `intent` | MUST be `init` |
| `target_worker` | MUST be `knowledge-base-init` |
| `kb_state` | MUST be `Empty` or auditor-determined init-compatible `Partial` |
| `confirmation_status` | MUST be `confirmed` or `not_required`; if `required`, halt |
| `missing_fields` | If non-empty, report missing fields only; do NOT create files |

### Required Worker Payload Fields

| Field | Required Value |
| ----- | -------------- |
| `init_mode` | MUST be `empty` or `init-compatible-partial` |

`default_root` and `config_template` are optional. When absent, use the default templates from this module.

### Validation Failure

If any required field is missing or invalid:
1. Report which fields are missing or invalid.
2. Do NOT create any files.
3. Output a `Handoff Recommendation` back to router with the missing fields listed.

## Empty-State Precondition

Before creating any files, init MUST verify that no existing files will be overwritten.

### Init-Compatible Partial (Safe to Proceed)

Init may proceed ONLY when:
- Default root exists but is empty.
- Default root contains only scaffold files that the init templates would generate (empty indexes), and no files would be overwritten.
- `.knowledge-base.yml` is missing but auditor has confirmed no existing content needs migration.
- Config exists, parses successfully, needs no field changes — only directories or index files that can be safely created are missing.

### Must Stop (Route to Gardener)

Init MUST stop when:
- Any target file exists and contains content beyond init template scaffolding.
- Category directories contain existing content or unknown Markdown files.
- Existing `.knowledge-base.yml` fields need modification.
- Existing files need moving, archiving, merging, or reclassification.

## Template Files

### Default Root

```text
docs/00-project-knowledge-base/
```

### Default `.knowledge-base.yml`

See `knowledge-base.yml.temp` in this module directory. It defines 10 default categories across 3 layers.

### Default Categories

| name | path | description |
| --- | --- | --- |
| project-overview | `01-project-layer/01-project-overview` | Project goals, scope, terminology, and high-level context. |
| core-process | `01-project-layer/02-core-process` | Core workflows, business processes, and operational sequences. |
| architecture | `01-project-layer/03-architecture` | Architecture, module relationships, layering, and design decisions. |
| middleware-config | `02-technology-layer/01-middleware-config` | Middleware, environment, service, and infrastructure configuration notes. |
| coding-standards | `02-technology-layer/02-coding-standards` | Coding conventions, review rules, style constraints, and implementation norms. |
| third-party-libraries | `02-technology-layer/03-third-party-libraries` | Third-party dependencies, library usage notes, integration constraints, and upgrade risks. |
| api-docs | `02-technology-layer/04-api-docs` | Internal or external API contracts, endpoints, schemas, and request examples. |
| prd-docs | `03-assets-layer/01-prd-docs` | Product requirements, feature narratives, user stories, and acceptance notes. |
| technical-solutions | `03-assets-layer/02-technical-solutions` | Technical solution proposals, tradeoffs, rollout notes, and decision records. |
| test-cases | `03-assets-layer/03-test-cases` | Test scenarios, validation notes, QA cases, and regression coverage ideas. |

## Workflow

1. Validate the `Worker Handoff Payload`. Halt on missing/invalid fields.
2. Verify that no target files will be overwritten. If overwrite would occur, stop and recommend auditor/gardener.
3. If `.knowledge-base.yml` is missing, write the default config. If it exists (init-compatible Partial, auditor-confirmed), use it read-only.
4. Create missing directories: root, layer directories, category directories.
5. Create root index from `templates/root-readme.md`.
6. Create layer indexes from `templates/layer-readme.md`.
7. Create category indexes from `templates/category-readme.md`.
8. Output a completion report listing every created file.

If step 2 discovers that existing files would be overwritten, or that migration/merge/repair is needed, stop immediately and recommend auditor/gardener.

## Refusal Cases

| Scenario | Behavior |
| --- | --- |
| `.knowledge-base.yml` exists and auditor has NOT marked init-compatible | Stop. Do not overwrite. |
| `.knowledge-base.yml` exists and auditor has marked init-compatible | Use config read-only. Do NOT modify fields. |
| Default root exists and is empty or scaffold-only | Only proceed if auditor marked init-compatible Partial. Fill in missing structure only. |
| Default root exists and contains content or unknown files | Stop. Recommend auditor/gardener. |
| Creation fails partway through | Report created files and failure point. Do NOT claim completion. |
| User asks to also write content | Refuse. Init creates scaffold only. Content goes through author/publisher. |

## Completion Report

After successful initialization, output a report listing every created file, grouped by type:

```markdown
## Init Complete

### Config
- `.knowledge-base.yml`

### Directories
- `docs/00-project-knowledge-base/`
- `docs/00-project-knowledge-base/01-project-layer/`
- ...

### Indexes
- `docs/00-project-knowledge-base/README.md`
- `docs/00-project-knowledge-base/01-project-layer/README.md`
- ...
```

## Common Mistakes

1. **Proceeding when `kb_state` is Ready or Broken.** Init only handles Empty and init-compatible Partial.
2. **Overwriting an existing `.knowledge-base.yml`.** If config exists, use it read-only or stop.
3. **Creating scaffold when existing content files are present.** This destroys discoverability. Stop and recommend auditor/gardener.
4. **Writing content documents during init.** Init creates indexes with empty `## Documents`. Content is the responsibility of author/publisher.
5. **Executing without a valid `Worker Handoff Payload`.** If triggered directly, refuse and redirect to router.
6. **Mixing init with migration, merge, or repair.** These are gardener responsibilities. Init creates only clean scaffold.

## Contract References

All rules from the shared contract at `../references/contract.md` apply. Key sections:

- [Configuration Contract](../references/contract.md#configuration-contract) — `.knowledge-base.yml` schema
- [Index Model](../references/contract.md#index-model) — index hierarchy, entry format, discovery rules
- [Naming Contract](../references/contract.md#naming-contract) — kebab-case requirement
