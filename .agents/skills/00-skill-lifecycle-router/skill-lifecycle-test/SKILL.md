---
name: skill-lifecycle-test
description: Lifecycle sub-skill — validate artifact format, completeness, and structure. Internal, invoked by skill-lifecycle-router.
disable-model-invocation: true
---

# Skill Lifecycle — Test

## Overview

Validate the task stage output: check format, completeness, and structure against project conventions. Produce a test report with explicit pass/fail results.

**Core principle:** Verify format, completeness, and structure. If all checks pass but output has visible issues, the verification boundary is insufficient — fail.

## Path Contract

This sub-skill is executed by the root router. It inherits:

- `ROUTER_SKILL_DIR`: absolute path to the root `skill-lifecycle-router` package directory.
- `TARGET_WORKSPACE`: absolute path to the workspace where lifecycle artifacts live.
- `TARGET_SKILL_DIR`: absolute path to the skill being created or modified, when applicable.

Do not resolve router-owned files from the current working directory. Do not use parent-relative docs paths for router-owned files or lifecycle artifacts.

## Entry Condition

Task output must exist. Router checks this before forwarding. If missing, return to task stage.

## Process

1. Identify the task output files (SKILL.md, scripts, templates)
2. Run verification checks in three categories:
   - **Format:** YAML frontmatter valid, markdown structure correct, code blocks have language tags
   - **Completeness:** All referenced files exist, no broken paths, all required sections present
   - **Structure:** Follows project skill conventions, directory layout matches patterns
3. For each check, record: pass/fail, file:line if failed, expected vs actual
4. Write test report to `TARGET_WORKSPACE/docs/test/<skill-name>-test-report.md`
5. Run self-check before declaring completion

## Counter-Check (Test Effectiveness)

After all checks complete:
- If ALL checks pass but the product has visible issues → **FAIL** — the verification boundary is insufficient. Note which issues were missed and return for redesign of verification.
- If checks reveal failures → document them clearly and route to the appropriate stage via the router.

## Self-Check

- [ ] Test report exists at `TARGET_WORKSPACE/docs/test/<skill-name>-test-report.md`
- [ ] Each check item has explicit pass/fail result
- [ ] Failed items have file:line location and expected vs actual
- [ ] Counter-check performed — if all passing, product quality confirmed independently

## Output

Test report ends with the self-check declaration:

\`\`\`markdown
## Self-Check
- [x] Test report exists
- [x] Pass/fail results explicit
- [x] Failed items have location info
- [x] Counter-check performed
\`\`\`

## Reference

Draw verification methodology from `writing-skills` validation standards. For counter-check, reference Harness Engineering practice: "AI-written tests passing buggy code → tests are invalid — force reconsideration of verification boundaries."
