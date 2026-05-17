#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CHECK_SCRIPT="$SCRIPT_DIR/check-reference-staleness.sh"

if [[ ! -x "$CHECK_SCRIPT" ]]; then
  echo "Missing executable script: $CHECK_SCRIPT" >&2
  exit 1
fi

tmpdir="$(mktemp -d)"
trap 'rm -rf "$tmpdir"' EXIT

router_dir="$tmpdir/skills/01-skills-router"
mkdir -p "$router_dir/references/fresh-skill"
mkdir -p "$router_dir/references/stale-skill"
mkdir -p "$tmpdir/skills/fresh-skill" "$tmpdir/skills/stale-skill"

printf '# Fresh\n' > "$tmpdir/skills/fresh-skill/SKILL.md"
printf '# Stale\n' > "$tmpdir/skills/stale-skill/SKILL.md"

cat > "$router_dir/references/README.md" <<'EOF'
# Router References
EOF

cat > "$router_dir/references/freshness.md" <<'EOF'
# Router Reference Freshness

| Skill | Last Synced Mtime | Last Synced At |
| --- | ---: | --- |
| fresh-skill | 9999999999 | 2286-11-20T17:46:39Z |
| stale-skill | 1 | 1970-01-01T00:00:01Z |
EOF

cat > "$router_dir/references/fresh-skill/context.md" <<'EOF'
# fresh-skill Context

## Inputs

- Fresh input context only.
EOF

cat > "$router_dir/references/stale-skill/context.md" <<'EOF'
# stale-skill Context

## Inputs

- Stale input context only.
EOF

set +e
output="$("$CHECK_SCRIPT" --router-dir "$router_dir" 2>&1)"
status=$?
set -e

if [[ "$status" -ne 1 ]]; then
  echo "Expected stale references to return exit code 1, got $status" >&2
  echo "$output" >&2
  exit 1
fi

if [[ "$output" != *"FRESH fresh-skill -> references/fresh-skill/context.md"* ]]; then
  echo "Expected fresh reference in output" >&2
  echo "$output" >&2
  exit 1
fi

if [[ "$output" != *"STALE stale-skill -> references/stale-skill/context.md"* ]]; then
  echo "Expected stale reference in output" >&2
  echo "$output" >&2
  exit 1
fi

cat > "$router_dir/references/freshness.md" <<'EOF'
# Router Reference Freshness

| Skill | Last Synced Mtime | Last Synced At |
| --- | ---: | --- |
| fresh-skill | 9999999999 | 2286-11-20T17:46:39Z |
| stale-skill | 9999999999 | 2286-11-20T17:46:39Z |
EOF

output="$("$CHECK_SCRIPT" --router-dir "$router_dir" 2>&1)"

if [[ "$output" != *"All router references are fresh."* ]]; then
  echo "Expected all-fresh summary" >&2
  echo "$output" >&2
  exit 1
fi

rm "$router_dir/references/stale-skill/context.md"

set +e
output="$("$CHECK_SCRIPT" --router-dir "$router_dir" 2>&1)"
status=$?
set -e

if [[ "$status" -ne 1 ]]; then
  echo "Expected missing context to return exit code 1, got $status" >&2
  echo "$output" >&2
  exit 1
fi

if [[ "$output" != *"MISSING_CONTEXT stale-skill -> references/stale-skill/context.md"* ]]; then
  echo "Expected missing context in output" >&2
  echo "$output" >&2
  exit 1
fi

mkdir -p "$router_dir/references/stale-skill"
cat > "$router_dir/references/stale-skill/context.md" <<'EOF'
---
last_synced_mtime: 9999999999
---

# stale-skill Context

## Inputs

- Context must not contain freshness metadata.
EOF

set +e
output="$("$CHECK_SCRIPT" --router-dir "$router_dir" 2>&1)"
status=$?
set -e

if [[ "$status" -ne 1 ]]; then
  echo "Expected invalid context metadata to return exit code 1, got $status" >&2
  echo "$output" >&2
  exit 1
fi

if [[ "$output" != *"INVALID_CONTEXT stale-skill -> references/stale-skill/context.md"* ]]; then
  echo "Expected invalid context metadata in output" >&2
  echo "$output" >&2
  exit 1
fi
