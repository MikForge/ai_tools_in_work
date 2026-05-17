#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage: check-reference-staleness.sh [--router-dir DIR]

Checks .agents/skills/01-skills-router/references/freshness.md against
target skill directory mtimes. Context files live at:
  references/<skill>/context.md

Required freshness table columns:
  | Skill | Last Synced Mtime |

Optional freshness table columns:
  | Last Synced At |
EOF
}

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
router_dir="$(cd "$script_dir/.." && pwd)"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --router-dir)
      if [[ $# -lt 2 ]]; then
        echo "Missing value for --router-dir" >&2
        exit 2
      fi
      router_dir="$(cd "$2" && pwd)"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage >&2
      exit 2
      ;;
  esac
done

references_dir="$router_dir/references"
freshness_file="$references_dir/freshness.md"
skills_root="$(cd "$router_dir/.." && pwd)"

if [[ ! -d "$references_dir" ]]; then
  echo "References directory not found: $references_dir" >&2
  exit 2
fi

if [[ ! -f "$freshness_file" ]]; then
  echo "Freshness index not found: $freshness_file" >&2
  exit 2
fi

stat_mtime() {
  local path="$1"

  if stat -c %Y "$path" >/dev/null 2>&1; then
    stat -c %Y "$path"
  else
    stat -f %m "$path"
  fi
}

latest_tree_mtime() {
  local target_dir="$1"
  local latest
  local path
  local mtime

  latest="$(stat_mtime "$target_dir")"
  while IFS= read -r -d '' path; do
    mtime="$(stat_mtime "$path")"
    if (( mtime > latest )); then
      latest="$mtime"
    fi
  done < <(find "$target_dir" -type f -print0)

  echo "$latest"
}

trim() {
  local value="$1"

  value="${value#"${value%%[![:space:]]*}"}"
  value="${value%"${value##*[![:space:]]}"}"
  echo "$value"
}

context_has_freshness_metadata() {
  local context_file="$1"

  grep -Eq '^[[:space:]]*(last_synced_mtime|last_synced_at):' "$context_file"
}

checked=0
problems=0

while IFS= read -r line || [[ -n "$line" ]]; do
  if [[ "$line" != \|* ]]; then
    continue
  fi

  row="${line#|}"
  row="${row%|}"
  IFS='|' read -r raw_skill raw_last_synced_mtime raw_last_synced_at _ <<< "$row"

  skill="$(trim "${raw_skill:-}")"
  last_synced_mtime="$(trim "${raw_last_synced_mtime:-}")"

  if [[ "$skill" == "Skill" || "$skill" =~ ^:?-+:?$ ]]; then
    continue
  fi

  checked=$((checked + 1))

  if [[ -z "$skill" || -z "$last_synced_mtime" ]]; then
    echo "INVALID freshness.md row (missing Skill or Last Synced Mtime)"
    problems=$((problems + 1))
    continue
  fi

  if [[ "$skill" = /* || "$skill" == *".."* ]]; then
    echo "INVALID $skill (skill must stay under skills root)"
    problems=$((problems + 1))
    continue
  fi

  if [[ ! "$last_synced_mtime" =~ ^[0-9]+$ ]]; then
    echo "INVALID $skill (Last Synced Mtime must be unix epoch seconds)"
    problems=$((problems + 1))
    continue
  fi

  context_relative_path="references/$skill/context.md"
  context_file="$references_dir/$skill/context.md"
  if [[ ! -f "$context_file" ]]; then
    echo "MISSING_CONTEXT $skill -> $context_relative_path"
    problems=$((problems + 1))
    continue
  fi

  if context_has_freshness_metadata "$context_file"; then
    echo "INVALID_CONTEXT $skill -> $context_relative_path (freshness metadata belongs in references/freshness.md)"
    problems=$((problems + 1))
    continue
  fi

  target_dir="$skills_root/$skill"
  if [[ ! -d "$target_dir" ]]; then
    echo "MISSING_TARGET $skill (target directory not found)"
    problems=$((problems + 1))
    continue
  fi

  target_mtime="$(latest_tree_mtime "$target_dir")"
  if (( target_mtime > last_synced_mtime )); then
    echo "STALE $skill -> $context_relative_path (last_synced_mtime=$last_synced_mtime, target_mtime=$target_mtime)"
    problems=$((problems + 1))
  else
    echo "FRESH $skill -> $context_relative_path (last_synced_mtime=$last_synced_mtime, target_mtime=$target_mtime)"
  fi
done < "$freshness_file"

if (( checked == 0 )); then
  echo "No router freshness rows found."
  exit 0
fi

if (( problems > 0 )); then
  echo "$problems router freshness row(s) need attention."
  exit 1
fi

echo "All router references are fresh."
