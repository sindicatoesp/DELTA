- [Code structure](code-structure.md)

### Request Handlers

`app/backend.server/handlers`

Handlers contain logic shared between multiple routes. If route files had repeating code, that logic was moved here.

Read about [routes](routes.md) first.

## BackendContext

Most handlers receive a `BackendContext` instance (from `~/backend.server/context`) rather than raw route args. `BackendContext` wraps the request, exposes the active language (`ctx.lang`), and provides the translator (`ctx.t({ code, msg })`). Construct one at the top of a loader or action:

```ts
import { BackendContext } from "~/backend.server/context";
const ctx = new BackendContext(args);
```

## Auth wrappers

Route loaders and actions should be wrapped with one of the auth helpers from `~/utils/auth` before calling any handler or model code:

| Wrapper | When to use |
|---|---|
| `authLoader` | Requires any logged-in user |
| `authLoaderWithPerm(perm, fn)` | Requires a specific permission |
| `authLoaderIsPublic` | No auth required |
| `authLoaderPublicOrWithPerm(perm, fn)` | Public read, permissioned write |
| `authLoaderApi` | API key auth |

Action equivalents follow the same naming (`authActionWithPerm`, etc.).

## Main handler files

## Form, CSV, API code

- form.ts, csv_export.ts, csv_import.ts

These handle form submissions, API requests, and CSV imports/exports. They do basic validation and call DB functions from models. See related tests.

- formSave - Used to create or update records from an HTML form.

Mainly used by createAction, which creates a React Router action function with EditData permission checks and DB integration.

The hazardous form doesn't use createAction, because it splits new and edit into separate files.

API related code

- jsonCreate
- jsonUpdate
- jsonUpsert

CSV related code

- csvCreate
- csvUpdate
- csvImportExample - Creates a sample CSV as a starting point for updates.

Self generated field list for API

- jsonPayloadExample - Generates field examples for docs
- jsonApiDocs - Returns API documentation
