---
name: Recurring Anti-Patterns
description: Anti-pattern categories that recur in government DRM codebases — generic audit checklist
type: project
---

## 1. Session Query Fan-Out Per Request
Every authenticated request triggers multiple DB queries plus a write (session lookup, user join, last-active update). Creates O(n) DB write amplification under load. Fix: single enriched session context query; move session storage to Redis.

## 2. N+1 in Cost/Aggregate Calculators
Aggregate recalculation functions execute a DB query inside a loop over related records, producing unbounded N+1 queries proportional to the number of relations. Fix: single aggregation query with GROUP BY.

## 3. String-Encoded Metadata
Relational metadata (user assignment, tenant context, flags) encoded into a name/label column with delimiter patterns and parsed by regex. Requires full table scans and in-process filtering. Fix: dedicated relational columns.

## 4. Unstructured Console Logging as Primary Instrumentation
Raw console.* calls scattered across the codebase while a structured logger exists but is only used in isolated files. Produces output that cannot be queried or alerted on. Fix: enforce structured logger via lint rule; ban console.* in CI.

## 5. Non-Awaited Existence Checks Before Delete
Existence/ownership check queries assigned but not awaited — the check is a no-op and deletes proceed regardless of whether the record exists or belongs to the caller's tenant. Fix: always await and assert; add tenant ownership guard on all child table operations.

## 6. Multi-Query Auth Context Per Route
Route loaders make multiple sequential DB calls to reconstruct session context (user, role, tenant). Fix: single enriched session context query; result attached to request context once per request.

## 7. Flexible Dates Stored as Text
Start/end dates stored as text in mixed formats (year-only, year-month, full date). Requires complex CASE/regex SQL in every date range query and prevents index usage on date filters. Fix: nullable date columns per precision tier, or structured date-range JSONB with typed fields.
