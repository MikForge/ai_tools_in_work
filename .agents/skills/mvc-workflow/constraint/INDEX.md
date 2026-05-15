# Constraint Index

Hard constraints live in this directory. Skills should read this index first, then load the constraint files applicable to the current module and current layer.

## Files

| File | Applies To | Read When | Runtime Effect If Violated |
|---|---|---|---|
| [ProxyConstraint.md](ProxyConstraint.md) | Proxy layer | Creating, registering, or validating a Proxy. | `fail` the Proxy layer or `reset_from(Proxy)` when downstream layers depend on the invalid Proxy. |
| [ViewConstraint.md](ViewConstraint.md) | View and prefab layer | Creating View classes, ViewId values, prefabs, or UI manifest entries. | `fail` the View+Prefab layer or `block` before shared manifest changes. |
| [MediatorConstraint.md](MediatorConstraint.md) | Mediator layer | Binding UI events, reading Proxy data, or handling notifications. | `fail` the Mediator layer or `reset_from(Mediator)` after event wiring changes. |
| [CommandConstraint.md](CommandConstraint.md) | Optional Command layer and command registration | Creating commands or changing controller registration. | `block` before shared registration edits, then `fail` command-related work if verification fails. |
| [NotificationConstraint.md](NotificationConstraint.md) | Notification constants and message flow | Adding or reusing `Commands` constants. | `block` before shared notification edits or `fail` the affected layer on naming conflicts. |
| [RegistrationConstraint.md](RegistrationConstraint.md) | Startup registration and UI manifest registration | Any work touching shared registration files. | `block` before edits and record the decision in `_dev_log.md`. |
| [ModuleStructureConstraint.md](ModuleStructureConstraint.md) | Module boundaries and parent-child structure | Creating module workspaces, child modules, or cross-module dependencies. | `block` on unsupported nesting or reset affected downstream layers after structure changes. |

## Usage Rules

- Do not duplicate full hard rules inside skills.
- Use `_constraint.md` to record which constraint files apply to the current module.
- Use this index to decide which constraint file to load before a layer step.
- Record failures, blocks, and resets in `_status.md` and `_dev_log.md`.
- Clear layer `last_error` after the layer reaches `done` or `skipped`; keep history in `_dev_log.md`.
