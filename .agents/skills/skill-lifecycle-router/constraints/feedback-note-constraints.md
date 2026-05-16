# Feedback Note Format

Every feedback note follows this structure. A note may contain multiple issues.

```markdown
# Feedback Note: <skill-name>

## Issues

### <Issue Title>
- **严重度:** Critical | Important | Minor
- **来源:** review | test | self-check | user
- **回流目标阶段:** design | plan | task | test
- **描述:** <what was found and why it matters>
- **文件:** <path:line if applicable>

### <Issue Title>
...
```

## Format Rules
- Each issue MUST have 严重度, 来源, 回流目标阶段, and 描述
- 严重度 follows review criteria: Critical = 阻断/安全, Important = 缺失/错误/不足, Minor = 风格/优化
- 回流目标阶段 determines where the feedback routes for repair
- Issues are appended (not overwritten) when feedback is triggered multiple times for the same skill
