# Copilot Instructions

DELTA Resilience is a full-stack TypeScript disaster tracking system built on React Router v7, Vite, PostgreSQL 17 + PostGIS, and Drizzle ORM. Multi-tenant: all user data is scoped to a `countryAccountsId`.

## Commands

- `yarn dev` — start dev server on port 3000 (also runs install + dbsync)
- `yarn build` — production build
- `yarn dbsync` — apply DB migrations (`drizzle-kit migrate`; **never** use `drizzle-kit push`)
- `yarn test:run2` — unit + integration tests via Vitest with PGlite (no external DB needed)
- `yarn test:run3` — integration tests against a real PostgreSQL instance (needs `.env.test`)
- `yarn test:e2e` — Playwright end-to-end tests
- `yarn vitest run path/to/test.ts` — run a single test file
- `yarn vitest run -t "test name"` — run tests matching a name pattern
- `yarn i18n:extractor` — extract/update translation strings in `locales/app/`
- `yarn format` — format with Prettier

## Key conventions

- **Migrations**: `yarn dbsync` only. Never `drizzle-kit push`. See [`_docs/code-structure/drizzle.md`](../_docs/code-structure/drizzle.md).
- **Multi-tenancy**: always scope queries with `countryAccountsId`. See [`_docs/code-structure/models.md`](../_docs/code-structure/models.md).
- **Auth**: wrap every loader/action with an `authLoader*` / `authAction*` helper from `~/utils/auth`. See [`_docs/code-structure/handlers.md`](../_docs/code-structure/handlers.md).
- **Routes**: all user routes live under `app/routes/$lang+/`. Use `LangLink` for internal links. See [`_docs/code-structure/routes.md`](../_docs/code-structure/routes.md).
- **Translation**: `ctx.t({ code: "key", msg: "Fallback" })`. Run `yarn i18n:extractor` after adding strings. See [`_docs/translations/app-ui/index.md`](../_docs/translations/app-ui/index.md).
- **New env vars**: add to `example.env` with a comment.
- **Branches**: from `dev`, not `main`. PRs target `dev`. See [`CONTRIBUTING.md`](../CONTRIBUTING.md).
- **Commit prefixes**: `Bug:`, `Feature:`, `Refactor:`, `Docs:`, or component name (e.g. `Damages:`).

## Architecture docs

Full developer documentation is in [`_docs/index.md`](../_docs/index.md). Key pages:

- [`_docs/code-structure/models.md`](../_docs/code-structure/models.md) — `dr`/`Tx` types, multi-tenancy pattern, model conventions
- [`_docs/code-structure/handlers.md`](../_docs/code-structure/handlers.md) — `BackendContext`, auth wrappers, form/CSV/API handlers
- [`_docs/code-structure/routes.md`](../_docs/code-structure/routes.md) — `$lang+` prefix, `LangLink`, flat-routes
- [`_docs/code-structure/testing.md`](../_docs/code-structure/testing.md) — PGlite setup, single-test commands, e2e config
- [`_docs/code-structure/form-csv-api.md`](../_docs/code-structure/form-csv-api.md) — how to add a new data type end-to-end
- [`_docs/translations/app-ui/index.md`](../_docs/translations/app-ui/index.md) — translation system, `ctx.t` API

## Custom agents

Specialist agents for recurring task types live in [`.github/agents/`](agents/). See [`agents/README.md`](agents/README.md) for the current list and guidance on adding new ones.
