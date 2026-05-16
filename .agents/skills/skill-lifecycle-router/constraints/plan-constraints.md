# Plan Doc Review Checklist

Review each plan doc against these criteria. Categorize findings as Critical / Important / Minor.

## Executability
- [ ] Each step is independently executable (no "then do X, then do Y" in one step)
- [ ] Each step has exact file paths
- [ ] Each code step shows complete code (no "similar to Task N")
- [ ] Each command step has expected output

## Completeness
- [ ] No "TBD" or "TODO" placeholders
- [ ] All referenced specs, files, or dependencies exist
- [ ] Testing strategy is defined per task

## Dependency Order
- [ ] Tasks are ordered correctly — no forward references to undefined types/functions
- [ ] File creation happens before file modification
- [ ] Test file creation happens before implementation

## Pattern Consistency
- [ ] Plan structure matches project plan conventions
- [ ] Commit message style is consistent
