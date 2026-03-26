- [Code structure](code-structure.md)

# Testing

## Test commands

| Command | What it runs |
|---|---|
| `yarn test:run2` | Unit + integration tests (Vitest, PGlite in-memory DB) |
| `yarn test:run3` | Integration tests against a real PostgreSQL instance (needs `.env.test`) |
| `yarn test:e2e` | Playwright end-to-end tests |

To run a single file:
```bash
yarn vitest run path/to/test.ts
```

To run tests matching a name pattern:
```bash
yarn vitest run -t "my test name"
```

## Test locations

- `tests/unit/` — pure unit tests, no DB
- `tests/integration/` — Vitest tests using a PGlite in-memory DB mock
- `app/routes/**/*.test.{ts,tsx}` — co-located route tests, also picked up by `yarn test:run2`
- `tests/e2e/` — Playwright tests

## Integration test setup (PGlite)

`yarn test:run2` does not need a running PostgreSQL instance. The test setup in `tests/integration/db/setup.ts` mocks `~/db.server` via `vi.mock`, replacing the real Drizzle client with an in-memory PGlite instance. The schema is pushed directly into PGlite at test startup using `drizzle-kit/api`.

This means:
- No `.env` or database connection needed for unit/integration tests
- Each test run starts with a fresh in-memory DB
- Tests that need the real DB (e.g. PostGIS, extensions) must use `yarn test:run3` with a real instance configured in `.env.test`

## E2E tests

Playwright tests live in `tests/e2e/`. They expect the app to be running on port 4000. If `PORT=4000` is not set in your environment, set it in `.env.test` before running `yarn test:e2e`.
