# {{ModuleName}} 行为树

Sequence: Proxy → View+Prefab → Mediator → Command

├── Proxy/
│   Condition: needs_proxy? = {{NeedsProxy}}
│   ├── true  → Execute
│   └── false → Skip（_status = skipped）
│
├── View+Prefab/
│   MUST: Proxy = done | skipped
│   → Execute
│
├── Mediator/
│   MUST: View+Prefab = done
│   → Execute
│
└── Command/
    Condition: needs_command? = {{NeedsCommand}}
    MUST: Mediator = done | skipped
    ├── true  → Execute
    └── false → Skip（_status = skipped）
