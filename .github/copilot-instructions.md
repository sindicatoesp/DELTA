# Copilot Instructions

> This file mirrors `AGENTS.md` at the repository root, which is the single source of truth for all AI agents. If you update conventions, update `AGENTS.md` and sync the changes here.

## Project overview

DELTA Resilience is a full-stack TypeScript disaster tracking system built on React Router v7, Vite, PostgreSQL 17 + PostGIS, and Drizzle ORM. It uses a multi-tenant, multi-country architecture where all user data is scoped to a `countryAccountsId`.

## Commands

- `yarn dev` — start dev server on port 3000 (also runs install + dbsync)
- `yarn build` — production build
- `yarn dbsync` — apply database migrations (`drizzle-kit migrate`; **never** use `drizzle-kit push`)
- `yarn test:run2` — unit + integration tests via Vitest with PGlite (no external DB needed)
- `yarn test:run3` — integration tests against a real PostgreSQL instance (needs `.env.test`)
- `yarn test:e2e` — Playwright end-to-end tests
- `yarn vitest run path/to/test.ts` — run a single test file
- `yarn vitest run -t "test name"` — run tests matching a name pattern
- `yarn i18n:extractor` — extract/update translation strings in `locales/app/`
- `yarn format` — format with Prettier

## Architecture

### Directory layout

```
app/
  backend.server/     # Server-only code (never imported by client bundles)
    models/           # Data access layer — Drizzle queries, one file per domain
    handlers/         # Business logic wrappers used by route loaders/actions
    services/         # External integrations (MCP, translation DB sync)
    context.ts        # BackendContext — wraps request args, exposes lang + translator
  drizzle/
    schema/           # One file per table, barrel-exported from index.ts
    migrations/       # SQL migration files (generated, then hand-edited)
  frontend/           # Reusable React components (not route files)
  routes/
    _index.tsx        # Root redirect
    $lang+/           # All user-facing routes — lang param is required on every route
  db.server.ts        # Exports dr (Drizzle instance) and Tx (transaction union type)
  utils/
    auth.ts           # authLoader* / authAction* wrappers
    session.ts        # Session helpers including getCountryAccountsIdFromSession
    link.ts           # LangLink — preserves the $lang param in internal links
locales/
  app/                # Translation JSON files (en.json is the source of truth)
tests/
  unit/               # Pure unit tests
  integration/        # Vitest tests using PGlite in-memory DB mock
  e2e/                # Playwright tests
```

### Route naming

All user routes live under `app/routes/$lang+/` using remix-flat-routes conventions. A `+` suffix on a folder name creates a nested route segment. Use `LangLink` (from `~/utils/link`) instead of React Router's `<Link>` for internal navigation — it forwards the active `$lang` param automatically.

The `dev_example1` route at `app/routes/$lang+/examples+/dev-example1+/` and its model at `app/backend.server/models/dev_example1.ts` are the canonical reference implementation for adding a new data type.

### Backend data flow

Route loaders and actions follow this pattern:

1. Wrap with an auth helper from `~/utils/auth` (e.g. `authLoaderWithPerm("SomePermission", async (args) => {...})`)
2. Construct a `BackendContext` from `args` — this gives access to `ctx.lang` and `ctx.t()` for translations
3. Call handler functions (from `app/backend.server/handlers/`) passing `ctx`
4. Handlers call model functions (from `app/backend.server/models/`)

Common auth wrappers: `authLoader`, `authLoaderWithPerm`, `authLoaderIsPublic`, `authLoaderPublicOrWithPerm`, `authLoaderApi`, and their `authAction*` counterparts.

### Database

`dr` is the global Drizzle instance — `import { dr, Tx } from "~/db.server"`. `Tx` is a union type covering both the full `dr` and transaction-scoped objects, so model functions that accept either can be typed as `(db: Tx) => ...`. Schema tables live in `app/drizzle/schema/`, one file each, barrel-exported from `index.ts`.

### Multi-tenancy

All data is scoped to a tenant via `countryAccountsId`. Retrieve it in loaders with `getCountryAccountsIdFromSession(request)` from `~/utils/session`, and always filter queries with `where eq(table.countryAccountsId, countryAccountsId)`.

### Translation

The project uses a custom translator, not react-i18next. In server/backend code, use `BackendContext.t()`:

```ts
ctx.t({ code: "nav.sectors", msg: "Sectors" })
```

`code` is the lookup key in `locales/app/en.json`; `msg` is the inline English fallback used during development. After adding or changing any user-facing strings, run `yarn i18n:extractor` to sync all locale files. English is the source language — strings in other locales can be left blank for translators.

### Testing

Integration tests mock the database with PGlite (in-memory PostgreSQL). The mock is established in `tests/integration/db/setup.ts` via `vi.mock("~/db.server")` and runs automatically for all tests under `yarn test:run2`. No external database or `.env` file is needed for unit or integration tests.

## Key conventions

- **Migrations**: `yarn dbsync` only. Never `drizzle-kit push`. See `_docs/code-structure/drizzle.md`.
- **Branches**: from `dev`, not `main`. See `CONTRIBUTING.md` for naming conventions.
- **PRs**: target `dev`. `main` is updated by maintainers at release time.
- **Commit prefixes**: `Bug:`, `Feature:`, `Refactor:`, `Docs:`, or component name (e.g. `Damages:`).
- **New UI strings**: use `ctx.t({ code, msg })` and run `yarn i18n:extractor` before committing.
- **New env vars**: add to `example.env` with a comment explaining what it does.

## Key docs

- `readme.md` — quick start, tech stack, project structure
- `_docs/index.md` — index of all developer documentation
- `CONTRIBUTING.md` — branch naming, commit style, PR checklist
- `_docs/code-structure/drizzle.md` — migration safety rules
- `_docs/code-structure/form-csv-api.md` — how to add a new data type end-to-end
