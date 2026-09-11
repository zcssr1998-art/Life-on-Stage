# V7 Engine Rewrite

V7 stops layering runtime hotfixes over older engines. Legacy files remain in the repository only as content sources for the build-time exporter and as an archive.

## Runtime dependency direction

`UI -> GameRuntime -> Systems -> Store`

Only the Store mutates the authoritative GameState. UI is render-only. Every wealth mutation is a `MONEY` command and is audited against the active yearly ledger.

## Modules

- `core.ts`: seeded RNG, single-state Store, runtime invariants, IndexedDB persistence.
- `content.ts`: stage-aware lazy content provider and legacy-event adapter.
- `engine.ts`: yearly transaction coordinator and event engine.
- `systems/money.ts`: auditable household cash flow.
- `systems/career.ts`: 50 career routes and promotion lifecycle.
- `systems/relationship.ts`: persistent NPC graph, romance, rivals, death and epilogues.
- `systems/world.ts`: slow-moving macro world state and shocks.
- `systems/fate.ts`: one Lachesis singularity and rewind snapshot.
- `systems/mortality.ts`: age/health/risk mortality curve.
- `systems/effects.ts`: typed effect-command interpreter.
- `ui.ts`: view rendering and delegated interaction only.

## Content pipeline

`scripts/export-v7-content.mjs` evaluates the existing data assets during CI, validates that they are serializable data, then exports:

- `base.json` (200 traits, 50 careers, worlds/backgrounds/etc.)
- `events-childhood.json`
- `events-youth.json`
- `events-adult.json`
- `events-senior.json`

The browser loads only the age-stage event chunk it currently needs.

## Persistence

V7 uses IndexedDB (`life-on-stage-v7`) for the current save and fate snapshots. A memory fallback is used only when IndexedDB is unavailable.

## Quality gates

Every deploy must pass TypeScript strict compilation, content export validation, full-life Monte Carlo regression and V7 WebKit tests. A nightly workflow runs a larger 1200-life simulation. The latest deploy-time report is visible at `/v7/diagnostics.html`.
