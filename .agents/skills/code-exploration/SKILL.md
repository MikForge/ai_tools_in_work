---
name: code-exploration
description: Use when asked to analyze, explore, understand, trace, or map any feature, module, or area of the codebase — especially before starting new development or when investigating unfamiliar code
---

# Code Exploration

## Overview

Deeply analyze existing codebase features by tracing execution paths from external triggers through the full call stack, mapping architecture layers, and documenting dependencies. The goal is understanding HOW something works, not just WHAT files exist.

**Core principle:** Start from entry points, not from file listings. File listing is preparation, not analysis.

## When to Use

- Before implementing new features that touch existing modules
- When asked to "analyze", "explore", "trace", or "understand" code
- When investigating how a feature works before modifying it
- When onboarding to an unfamiliar area of the codebase
- When documenting architecture for future reference

**Don't use for:** Simple file lookups (use Grep/Glob directly), single-function questions, or when you already know the code well.

## The Five Phases

Complete each phase before moving to the next.

### Phase 1: Entry Point Discovery

Find how the feature is triggered from outside:

- What user action, system event, or external call starts the flow?
- Trace from the trigger through the first layer of code
- Identify ALL entry points, not just the primary one
- Note which entry points are production paths vs. legacy/dead code

### Phase 2: Execution Path Tracing

Follow the call chain from entry to completion:

- Trace step-by-step through the full call stack
- Note branching logic (conditionals, switch statements, state machines)
- Identify async boundaries — what happens before/after each `await`
- Map data transformations along the path
- Note error paths and failure modes

### Phase 3: Architecture Layer Mapping

Identify which layers the code touches and how they communicate:

- Does it stay within one layer or cross boundaries?
- How do layers communicate? (events, notifications, direct calls)
- Is the communication pattern consistent with project conventions?
- Note reusable boundaries and anti-patterns

### Phase 4: Pattern Recognition

Identify the patterns and abstractions already in use:

- What design patterns appear? (Singleton, FSM, Observer, etc.)
- Are patterns used consistently?
- What naming conventions does the module follow?
- What code organization principles are visible?

### Phase 5: Dependency Documentation

Map what the module depends on and what depends on it:

- External libraries and framework APIs
- Internal module dependencies (imports)
- Who consumes this module? (reverse dependencies)
- Shared utilities worth reusing

## Output Format

Always produce structured output using this template:

```markdown
## Exploration: [Feature/Area Name]

### Entry Points
| Entry Point | Trigger | Location |
|---|---|---|
| [method/call] | [How triggered] | [file:line] |

### Execution Flow
1. [Step 1]
2. [Step 2]
   - [Sub-step details for branching/async]

### Architecture Insights
- [Pattern]: [Where and why it is used]
- [Anti-pattern]: [Why it's problematic]

### Key Files
| File | Role | Importance |
|------|------|------------|
| [path] | [What it does] | Critical/High/Medium/Low |

### Dependencies
- **External**: [framework APIs, libraries]
- **Internal**: [core modules imported]
- **Consumers**: [who imports this module]

### Recommendations for New Development
- **Follow**: [patterns to adopt]
- **Reuse**: [utilities to leverage]
- **Avoid**: [anti-patterns to skip]
```

## Common Mistakes

| Mistake | Fix |
|---|---|
| Starting with file listing | Start with entry points — ask "what triggers this?" |
| Describing files, not flows | Trace the call chain, don't catalog files |
| Skipping error paths | Map failure modes alongside happy path |
| Missing reverse dependencies | Check who imports/consumes this module |
| No recommendations section | Always include Follow/Reuse/Avoid |
| Treating legacy code as active | Distinguish production paths from dead code |
| Shallow analysis (one file read) | Trace references to other files in the module |
| Ignoring async boundaries | Mark each await and what state may change after it |

## Quick Reference

| Phase | Key Question | Output |
|---|---|---|
| **1. Entry Points** | What triggers this? | Table of triggers + locations |
| **2. Execution** | What happens step by step? | Numbered call chain with branching |
| **3. Architecture** | Which layers are involved? | Layer diagram, communication patterns |
| **4. Patterns** | What patterns are used? | Pattern list with locations |
| **5. Dependencies** | What does it need/provide? | Dependency map + consumers |

## Real-World Impact

Structured exploration prevents:
- New code that violates existing patterns
- Missing edge cases already handled elsewhere
- Reinventing utilities that already exist
- Breaking implicit contracts between layers
- Hours of debugging from misunderstood behavior
