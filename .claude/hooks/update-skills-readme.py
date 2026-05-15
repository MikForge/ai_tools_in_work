#!/usr/bin/env python3
"""PostToolUse hook: auto-update .agents/skills/README.md after npx skills add."""

import json
import os
import re
import sys
from pathlib import Path
from typing import Optional, Tuple, Dict


def parse_frontmatter(path: Path) -> Dict[str, str]:
    """Extract YAML frontmatter from a SKILL.md file."""
    text = path.read_text(encoding="utf-8")
    m = re.match(r"^---\s*\n(.*?)\n---", text, re.DOTALL)
    if not m:
        return {}
    fm = {}
    for line in m.group(1).split("\n"):
        if ":" in line:
            k, v = line.split(":", 1)
            fm[k.strip()] = v.strip()
    return fm


def extract_package(cmd: str) -> Optional[Tuple[str, str]]:
    """Extract (owner/repo, skill_name) from an npx skills add command."""
    m = re.search(r"npx\s+skills\s+add\s+(\S+@\S+)", cmd)
    if not m:
        return None
    pkg = m.group(1)  # "owner/repo@skill"
    if "@" not in pkg or "/" not in pkg:
        return None
    skill_name = pkg.split("@")[-1]
    source = pkg.rsplit("@", 1)[0]
    return source, skill_name


def entry_exists(readme: str, skill_name: str) -> bool:
    return f"## {skill_name}\n" in readme


def format_entry(source: str, skill_name: str, description: str) -> str:
    desc_cn = description[:40]  # CLAUDE.md: ≤40 chars
    return (
        f"## {skill_name}\n"
        f"\n"
        f"- 来源:`{source}`\n"
        f"- 安装:`npx skills add {source}@{skill_name} -y`\n"
        f"- 用途:{desc_cn}\n"
        f"- 链接:<https://skills.sh/{source}/{skill_name}>\n"
    )


def insert_sorted(readme: str, entry: str, skill_name: str) -> str:
    """Insert entry into README alphabetically by skill name."""
    sections = re.split(r"^(## )", readme, flags=re.MULTILINE)

    # Collect existing ## sections
    entries = []  # list of (name_lower, full text including ## prefix)
    prefix_parts = []  # list of str
    in_prefix = True

    i = 0
    while i < len(sections):
        if sections[i] == "## " and i + 1 < len(sections):
            name = sections[i + 1].strip().split("\n")[0]
            full = sections[i] + sections[i + 1]
            entries.append((name.lower(), full))
            i += 2
            in_prefix = False
        else:
            if in_prefix:
                prefix_parts.append(sections[i])
            i += 1

    # Build prefix (everything before first ## section)
    prefix = "".join(prefix_parts)

    # Find insertion point
    entries.append((skill_name.lower(), entry))
    entries.sort(key=lambda x: x[0])

    return prefix + "".join(e[1] for e in entries)


def main():
    AGENTS_SKILLS = Path(
        os.environ.get("CLAUDE_PROJECT_DIR", os.getcwd())
    ) / ".agents" / "skills"
    README = AGENTS_SKILLS / "README.md"

    if not README.exists():
        print(f"[update-skills-readme] README not found: {README}", file=sys.stderr)
        sys.exit(0)

    # Read the tool input from stdin
    try:
        raw = sys.stdin.read()
        tool_input = json.loads(raw)
    except (json.JSONDecodeError, Exception):
        print("[update-skills-readme] Failed to parse stdin JSON", file=sys.stderr)
        sys.exit(0)

    cmd = tool_input.get("command", "")
    if not cmd:
        sys.exit(0)

    pkg = extract_package(cmd)
    if not pkg:
        sys.exit(0)

    source, skill_name = pkg
    skill_md = AGENTS_SKILLS / skill_name / "SKILL.md"

    if not skill_md.exists():
        print(
            f"[update-skills-readme] SKILL.md not found: {skill_md}",
            file=sys.stderr,
        )
        sys.exit(0)

    fm = parse_frontmatter(skill_md)
    description = fm.get("description", skill_name)

    current = README.read_text(encoding="utf-8")

    if entry_exists(current, skill_name):
        print(
            f"[update-skills-readme] Entry already exists for {skill_name}",
            file=sys.stderr,
        )
        sys.exit(0)

    entry = format_entry(source, skill_name, description)
    updated = insert_sorted(current, entry, skill_name)

    README.write_text(updated, encoding="utf-8")
    print(
        f"[update-skills-readme] Added entry for {skill_name} to README.md",
        file=sys.stderr,
    )


if __name__ == "__main__":
    main()
