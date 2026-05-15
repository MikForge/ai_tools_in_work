# BaseContext Index

Architecture knowledge lives in this directory. Skills should read this index first, then load only the role files needed for the current phase or layer.

## Files

| File | Applies To | Authority Source | Read When |
|---|---|---|---|
| [ProxyBaseContext.md](ProxyBaseContext.md) | Proxy discovery and Proxy layer execution | `assets/scripts/core/base/BaseProxy.ts` | The module needs a new Proxy, reuses Proxy data, or validates Proxy registration. |
| [ViewBaseContext.md](ViewBaseContext.md) | ViewId, UI manifest, View, and prefab work | `assets/core/gui/base/BaseView.ts` | The module has UI, needs ViewId discovery, or touches `UIManifest.ts`. |
| [MediatorBaseContext.md](MediatorBaseContext.md) | Mediator creation and UI event binding | `assets/scripts/core/base/BaseMeditor.ts` | The module has UI behavior, View-to-Proxy coordination, or notification handling. |
| [CommandBaseContext.md](CommandBaseContext.md) | Optional Command layer creation and registration | `assets/scripts/game/controller/cmd/` | The module introduces or validates commands and startup registration. |

## Usage Rules

- Do not duplicate full architecture examples inside skills.
- Use the role files for exact naming, directory, lifecycle, registration, and search patterns.
- During repo-first discovery, load the role files needed to discover existing project resources.
- During executor layer work, load only the current layer's role file plus any cross-role file required by the task.
- During context gathering, verify indexed authority source paths still exist before trusting the reference.
