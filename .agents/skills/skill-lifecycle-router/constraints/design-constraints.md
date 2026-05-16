# Design Doc Review Checklist

Review each design doc against these criteria. Categorize findings as Critical / Important / Minor.

## Scope & Boundaries
- [ ] Problem statement is clear — what problem does this skill solve?
- [ ] Scope is explicitly bounded — what is IN and what is OUT
- [ ] Non-goals are listed and justified

## Consistency
- [ ] No contradictory assertions (e.g., "router only routes" vs "router validates content")
- [ ] Terminology is consistent throughout (same word for same concept)
- [ ] Architecture diagram matches text description

## Completeness
- [ ] No "TBD" or "TODO" placeholders
- [ ] All referenced files/artifacts have defined paths
- [ ] Edge cases addressed (empty state, error state, boundary conditions)

## Pattern Consistency
- [ ] Follows project conventions (file naming, directory structure, YAML frontmatter)
- [ ] Does not introduce patterns that conflict with existing verified patterns
- [ ] If deviates from existing pattern, deviation is justified

## Mode Consistency (from spec mode-copy-defense)
- [ ] Does the design introduce a new structural pattern? If yes, flag for review
- [ ] Is the design consistent with how similar skills in this project are structured?
