# Test Report Review Checklist

Review each test report against these criteria. Categorize findings as Critical / Important / Minor.

## Verification Coverage
- [ ] Format checks cover all required sections (YAML frontmatter, headers, code blocks)
- [ ] Completeness checks cover all referenced files and dependencies
- [ ] Structure checks verify against project conventions

## Results Clarity
- [ ] Pass/fail status is explicit for each check item
- [ ] Failure items include file:line location
- [ ] Failure items include expected vs actual

## Counter-Check (Test Effectiveness)
- [ ] If all checks pass but the artifact has visible issues → flag as "verification boundary insufficient"
- [ ] Verification items are non-trivial (not just "file exists")
