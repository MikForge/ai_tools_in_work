# Skill Lifecycle Router Path Root Optimization Spec

**Date:** 2026-05-17
**Status:** design
**Refines:** `skill-lifecycle-router`
**Parent spec:** `docs/superpowers/specs/2026-05-17-skill-lifecycle-router-design.md`

## Problem

`skill-lifecycle-router` is a router package with internal sub-skills and internal constraint documents. The root router now introduces `THIS_SKILL_DIR`, but that name is still ambiguous once execution moves into a sub-skill such as `skill-lifecycle-test/SKILL.md`.

When an agent reads a sub-skill, "this skill" can mean the sub-skill directory instead of the router package root. The current sub-skills also use paths like `../docs/...`, which can be interpreted relative to the current shell working directory, the target project workspace, or the sub-skill file location.

This creates a path-resolution risk:

- Router-owned files may be read from the target project by mistake.
- Lifecycle output artifacts may be written into the router package by mistake.
- Review and feedback stages may read `docs/constraints` from the wrong root.
- Future agents have to infer path ownership instead of following explicit bindings.

## Goal

Make path ownership explicit and stable across the root router and every internal sub-skill.

The optimized design replaces `THIS_SKILL_DIR` with `ROUTER_SKILL_DIR`, then removes ambiguous `../docs/...` references from sub-skills. Every path must resolve from a named root.

## Core Decision

Use `ROUTER_SKILL_DIR` as the bound absolute path to the root router package directory:

```text
ROUTER_SKILL_DIR = absolute directory containing the root skill-lifecycle-router/SKILL.md
```

This name is intentionally specific. It does not drift when the router reads an internal sub-skill. In a sub-skill, `ROUTER_SKILL_DIR` still points to the router package root, not the sub-skill directory.

## Path Roots

The lifecycle uses three named roots.

| Root | Meaning | Owns |
| --- | --- | --- |
| `ROUTER_SKILL_DIR` | Absolute path to the root `skill-lifecycle-router` package directory | Router `SKILL.md`, internal sub-skills, internal constraints |
| `TARGET_WORKSPACE` | Absolute path to the project or repository where the lifecycle is being applied | Lifecycle design, plan, test, review, feedback reports |
| `TARGET_SKILL_DIR` | Absolute path to the skill being created or modified | Target skill `SKILL.md`, `zh-CN.md`, scripts, templates, references |

No router instruction should rely on implicit current working directory resolution.

## Path Ownership Rules

### Router-Owned Files

Router-owned files must always be resolved from `ROUTER_SKILL_DIR`.

Examples:

```text
ROUTER_SKILL_DIR/SKILL.md
ROUTER_SKILL_DIR/zh-CN.md
ROUTER_SKILL_DIR/skill-lifecycle-<stage>/SKILL.md
ROUTER_SKILL_DIR/docs/constraints/design-constraints.md
ROUTER_SKILL_DIR/docs/constraints/plan-constraints.md
ROUTER_SKILL_DIR/docs/constraints/task-constraints.md
ROUTER_SKILL_DIR/docs/constraints/test-constraints.md
ROUTER_SKILL_DIR/docs/constraints/feedback-note-constraints.md
```

If a path could exist both inside the router package and inside the target workspace, router-owned resolution wins only when the instruction explicitly says `ROUTER_SKILL_DIR`.

### Lifecycle Artifacts

Lifecycle reports belong to `TARGET_WORKSPACE`, unless the user explicitly overrides the artifact location.

Examples:

```text
TARGET_WORKSPACE/docs/specs/<skill-name>-design.md
TARGET_WORKSPACE/docs/plans/<skill-name>-plan.md
TARGET_WORKSPACE/docs/test/<skill-name>-test-report.md
TARGET_WORKSPACE/docs/notes/<skill-name>-review.md
TARGET_WORKSPACE/docs/notes/<skill-name>-feedback.md
```

The current `../docs/...` wording must be replaced with these explicit target paths.

### Target Skill Artifacts

The skill being created or modified belongs to `TARGET_SKILL_DIR`.

Examples:

```text
TARGET_SKILL_DIR/SKILL.md
TARGET_SKILL_DIR/zh-CN.md
TARGET_SKILL_DIR/scripts/*
TARGET_SKILL_DIR/templates/*
TARGET_SKILL_DIR/references/*
```

`TARGET_SKILL_DIR` is established when the router identifies which skill the user is working on. If the target skill location is ambiguous, the router asks one question before entering a stage.

## Router Binding Protocol

Before Step 1 of the router workflow, the router binds:

1. `ROUTER_SKILL_DIR`: absolute directory containing the root router `SKILL.md`.
2. `TARGET_WORKSPACE`: absolute workspace where lifecycle artifacts should be read and written.
3. `TARGET_SKILL_DIR`: absolute directory for the skill being created or modified, once the target skill is known.

The router passes these bindings to every internal sub-skill as execution context. Sub-skills inherit the bindings and must not rebind `ROUTER_SKILL_DIR`.

## Sub-Skill Contract

Every internal sub-skill must start from the same contract:

```md
## Path Contract

This sub-skill is executed by the root router. It inherits:

- `ROUTER_SKILL_DIR`: absolute path to the root `skill-lifecycle-router` package directory.
- `TARGET_WORKSPACE`: absolute path to the workspace where lifecycle artifacts live.
- `TARGET_SKILL_DIR`: absolute path to the skill being created or modified, when applicable.

Do not resolve router-owned files from the current working directory. Do not use `../docs/...` for router-owned files or lifecycle artifacts.
```

Each sub-skill then uses explicit paths in its process steps:

- Design writes to `TARGET_WORKSPACE/docs/specs/<skill-name>-design.md`.
- Plan reads the design doc from `TARGET_WORKSPACE/docs/specs/...` and writes to `TARGET_WORKSPACE/docs/plans/...`.
- Task reads the plan from `TARGET_WORKSPACE/docs/plans/...` and writes target skill files under `TARGET_SKILL_DIR`.
- Test writes to `TARGET_WORKSPACE/docs/test/...`.
- Review reads constraints from `ROUTER_SKILL_DIR/docs/constraints/...` and writes to `TARGET_WORKSPACE/docs/notes/...`.
- Feedback reads its format constraint from `ROUTER_SKILL_DIR/docs/constraints/feedback-note-constraints.md` and writes or appends to `TARGET_WORKSPACE/docs/notes/...`.

## Required Text Changes

### Root Router

Replace the current `THIS_SKILL_DIR` section with `ROUTER_SKILL_DIR`.

Required wording:

```md
Before any workflow step, bind `ROUTER_SKILL_DIR` to the absolute directory containing the root `skill-lifecycle-router/SKILL.md`.

`ROUTER_SKILL_DIR` is the only root for router-owned files. Sub-skills inherit this binding and must not reinterpret it as their own directory.
```

Update Step 5:

```md
Read `ROUTER_SKILL_DIR/skill-lifecycle-<stage>/SKILL.md`.
```

Add or update a short binding table for `ROUTER_SKILL_DIR`, `TARGET_WORKSPACE`, and `TARGET_SKILL_DIR`.

### Design Sub-Skill

Replace:

```text
../docs/specs/<skill-name>-design.md
```

with:

```text
TARGET_WORKSPACE/docs/specs/<skill-name>-design.md
```

### Plan Sub-Skill

Replace:

```text
../docs/plans/<skill-name>-plan.md
```

with:

```text
TARGET_WORKSPACE/docs/plans/<skill-name>-plan.md
```

Also specify that the design doc is read from `TARGET_WORKSPACE/docs/specs/<skill-name>-design.md`.

### Test Sub-Skill

Replace:

```text
../docs/test/<skill-name>-test-report.md
```

with:

```text
TARGET_WORKSPACE/docs/test/<skill-name>-test-report.md
```

### Review Sub-Skill

Replace:

```text
../docs/constraints/
```

with:

```text
ROUTER_SKILL_DIR/docs/constraints/
```

Replace:

```text
../docs/notes/<skill-name>-review.md
```

with:

```text
TARGET_WORKSPACE/docs/notes/<skill-name>-review.md
```

### Feedback Sub-Skill

Replace:

```text
../docs/constraints/feedback-note-constraints.md
../docs/notes/<skill-name>-feedback.md
```

with:

```text
ROUTER_SKILL_DIR/docs/constraints/feedback-note-constraints.md
TARGET_WORKSPACE/docs/notes/<skill-name>-feedback.md
```

## Chinese Translation Requirement

The root router has `zh-CN.md`. Any change to root `SKILL.md` must be mirrored in `zh-CN.md`.

The internal sub-skills currently do not have `zh-CN.md` files. This optimization does not require adding translations for every internal sub-skill. If translations are added later, the same path contract must be mirrored there.

## Validation Strategy

After implementation, run text checks:

```bash
rg -n "THIS_SKILL_DIR|\\.\\./docs|\\.agents/skills/skill-lifecycle-router" .agents/skills/00-skill-lifecycle-router
```

Expected result:

- No `THIS_SKILL_DIR`.
- No `../docs`.
- No stale `.agents/skills/skill-lifecycle-router` path.

Run positive checks:

```bash
rg -n "ROUTER_SKILL_DIR|TARGET_WORKSPACE|TARGET_SKILL_DIR" .agents/skills/00-skill-lifecycle-router
```

Expected result:

- Root router defines all three roots.
- Sub-skills reference the roots they use.
- Review and feedback reference `ROUTER_SKILL_DIR/docs/constraints`.

Manual review checklist:

- Router-owned files never resolve from the shell working directory.
- Lifecycle reports never write into `ROUTER_SKILL_DIR`.
- Target skill artifacts never write into router lifecycle report directories.
- Root `SKILL.md` and `zh-CN.md` stay synchronized.

## Non-Goals

- Do not redesign the lifecycle stages.
- Do not change feedback routing semantics.
- Do not move existing lifecycle reports.
- Do not add per-sub-skill `zh-CN.md` files in this optimization.
- Do not touch `docs/00-project-knowledge-base/`; that directory remains governed by the knowledge-base router rules.

## Acceptance Criteria

- `ROUTER_SKILL_DIR` replaces `THIS_SKILL_DIR` everywhere in the router package.
- Every internal router file path is rooted at `ROUTER_SKILL_DIR`.
- Every lifecycle report path is rooted at `TARGET_WORKSPACE`.
- Every target skill output path is rooted at `TARGET_SKILL_DIR` when applicable.
- No `../docs/...` remains in the router package.
- Root English and Chinese router docs describe the same path contract.
- Validation commands above produce the expected results.

## Self-Check

- [x] Problem statement explains why `THIS_SKILL_DIR` is ambiguous.
- [x] Scope is limited to path root optimization.
- [x] Path ownership is explicit for router-owned files, lifecycle artifacts, and target skill artifacts.
- [x] Required changes identify every affected sub-skill category.
- [x] Validation strategy includes negative and positive checks.
- [x] No "TBD" or "TODO" placeholders remain.
- [x] No contradictory assertions.
