# Skills Router References

This directory stores derived intake notes for `skills-router`. These files are
a cache and feedback layer, not the source of truth. The target skill directory
remains authoritative.

## Layout

Use one `context.md` per target skill. Mirror nested skill paths under this
directory:

```text
references/
  README.md
  freshness.md
  knowledge-base-router/
    knowledge-base-publisher/
      context.md
```

`context.md` is context-only. It should describe the target skill inputs and
routing questions. Do not put freshness metadata in it. The checker rejects
`last_synced_mtime` and `last_synced_at` fields in context files.

## Context Format

Example:

```markdown
# knowledge-base-router/knowledge-base-publisher

## Inputs

- ...

## Feedback

- ...
```

## Freshness Index

Store all freshness metadata in `freshness.md`:

```markdown
| Skill | Last Synced Mtime | Last Synced At |
| --- | ---: | --- |
| knowledge-base-router/knowledge-base-publisher | 1778918400 | 2026-05-16T00:00:00+08:00 |
```

Required columns:

- `skill`: target skill directory relative to `.agents/skills/`
- `last_synced_mtime`: Unix epoch seconds when this reference was last synced

Optional fields:

- `last_synced_at`: human-readable sync time

## Freshness Check

Run:

```bash
bash .agents/skills/01-skills-router/scripts/check-reference-staleness.sh
```

The script compares `last_synced_mtime` with the newest file modification time
inside the target skill directory, and verifies that
`references/<skill>/context.md` exists.

- `FRESH`: reference was synced after the target skill directory changed
- `STALE`: target skill directory changed after the recorded sync time
- `MISSING_CONTEXT`: context file does not exist
- `MISSING_TARGET`: target skill directory does not exist
- `INVALID_CONTEXT`: context file contains freshness metadata
- `INVALID`: required metadata is missing or malformed
