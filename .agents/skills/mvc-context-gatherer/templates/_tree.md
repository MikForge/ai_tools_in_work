# {{ModuleName}} 行为树

Sequence: Proxy → View+Prefab → Mediator

├── Proxy/
│   Condition: needs_proxy? = {{NeedsProxy}}
│   ├── true  → Execute
│   └── false → Skip（_status = skipped）
│
├── View+Prefab/
│   MUST: Proxy = done | skipped
│   → Execute
│
└── Mediator/
    MUST: View+Prefab = done
    → Execute
