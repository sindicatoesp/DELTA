# Bug Triage — P0 Audit Index

**Generated:** 2026-04-21  
**Agent:** GitHub Copilot (bug-triage mode)  
**Method:** Interactive audit against `specs/source-code-audits/p0-items.md`

---

## Items Table

| ID                | Title                                                                    | Complexity | Status               |
| ----------------- | ------------------------------------------------------------------------ | ---------- | -------------------- |
| [P0-0](P0-0.md)   | Remove/guard example & dev-example routes in production                  | Simple     | needs-human-decision |
| [P0-1](P0-1.md)   | Fix NODE_ENV in Dockerfile                                               | Trivial    | todo                 |
| [P0-2](P0-2.md)   | Fix no-op deleteById await                                               | Simple     | todo                 |
| [P0-3](P0-3.md)   | Remove debug console.log + lint rule                                     | Simple     | todo                 |
| [P0-4](P0-4.md)   | Add coverage thresholds baseline                                         | Trivial    | todo                 |
| [P0-5](P0-5.md)   | Fix placeholder support email in ErrorBoundary                           | Trivial    | todo                 |
| [P0-6](P0-6.md)   | Fix hardcoded /en/ URL in email notifications                            | Simple     | todo                 |
| [P0-7](P0-7.md)   | Fix deleteAllData silent error swallow                                   | Simple     | todo                 |
| [P0-8](P0-8.md)   | Fix revokeUserApiAccess sets emailVerified=false                         | Trivial    | function-not-found   |
| [P0-9](P0-9.md)   | Fix handleTransaction sentinel string                                    | Simple     | todo                 |
| [P0-10](P0-10.md) | Fix type export bugs in humanCategoryPresence + hipHazard                | Trivial    | todo                 |
| [P0-11](P0-11.md) | Remove dead countryName column from instance_system_settings             | Trivial    | migration-pending    |
| [P0-12](P0-12.md) | Remove secret logging in env.ts                                          | Trivial    | todo                 |
| [P0-13](P0-13.md) | Fix rejectUnauthorized: false in SMTP transport                          | Trivial    | todo                 |
| [P0-14](P0-14.md) | Fix sanitizeInput — remove destructive quote stripping                   | Simple     | todo                 |
| [P0-15](P0-15.md) | Fix destroyUserSession graceful handling of missing session              | Trivial    | appears-resolved     |
| [P0-16](P0-16.md) | Delete dead cost calculation API endpoints (4 files, zero callers)       | Simple     | todo                 |
| [P0-17](P0-17.md) | Fix export_tables_for_translation.ts — writes to directory not file      | Trivial    | todo                 |
| [P0-18](P0-18.md) | Add .dockerignore — prevent image bloat and secret leak                  | Trivial    | partially-resolved   |
| [P0-19](P0-19.md) | Fix build_binary.sh — build failure must be fatal                        | Trivial    | todo                 |
| [P0-20](P0-20.md) | Add CSP header to entry.server.tsx — missing from production             | Complex    | todo                 |
| [P0-21](P0-21.md) | Delete dead Selenium legacy file (tests/selenium/browser.side)           | Trivial    | todo                 |
| [P0-22](P0-22.md) | Fix readme.md factual errors — Jest→Vitest, Remix→React Router v7        | Trivial    | appears-resolved     |
| [P0-23](P0-23.md) | Fill Apache 2.0 LICENSE copyright placeholder                            | Trivial    | appears-resolved     |
| [P0-24](P0-24.md) | Create CONTRIBUTING.md — dev setup, branching, commit format, PR process | Simple     | partially-resolved   |
| [P0-25](P0-25.md) | Create CODE_OF_CONDUCT.md — Contributor Covenant v2.1                    | Simple     | todo                 |
| [P0-26](P0-26.md) | Create SECURITY.md — vulnerability disclosure policy and contact         | Simple     | todo                 |
| [P0-27](P0-27.md) | Add NOTICE file — Apache 2.0 Section 4(d) attribution requirement        | Simple     | todo                 |

---

## Gate 1 Checklist

Verify root causes for the three highest-risk items before sprint planning:

- **P0-2** (`deleteById` await): Confirmed — `common.ts` line 53, missing `await` on `tx.select(...)` makes the existence guard always truthy. Affects 7+ model files.
- **P0-8** (`revokeUserApiAccess` emailVerified): `revokeUserApiAccess` function not present in `app/backend.server/models/api_key.ts`. Requires git log verification.
- **P0-12** (env.ts secret logging): Current code logs `"Loading env file"` + file type only (NOT env var values). The AP-09 risk is not actively exploited in present code but console.log remains and should be removed.

---

## Summary

| Category                 | Count                   |
| ------------------------ | ----------------------- |
| Total items              | 28                      |
| Trivial                  | 15                      |
| Simple                   | 12                      |
| Complex                  | 1                       |
| Appears already resolved | 3 (P0-15, P0-22, P0-23) |
| Partially resolved       | 2 (P0-18, P0-24)        |
| Migration pending only   | 1 (P0-11)               |
| Function not found       | 1 (P0-8)                |
| Needs human decision     | 1 (P0-0)                |
| Confirmed todo           | 19                      |
