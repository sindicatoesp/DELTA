---
name: Cascade Architecture Checklist
description: Generic audit checklist for UUID-linked cascading entity hierarchies in government DRM systems
type: project
---

## Cascade Strategy
- ON DELETE CASCADE should be defined only at the tenant root (tenant → aggregate root). All other FK relationships should be NO ACTION with explicit application-managed cascades.
- Application-managed cascade sequences must assert tenant ownership before beginning child deletes. A missing or non-awaited ownership check silently bypasses the tenant guard.

## Existence Check Anti-Pattern
Always `await` existence and ownership check queries before proceeding with deletes. A non-awaited query builder object is always truthy — the check becomes a no-op and the guard is bypassed. This is a recurring pattern in ORM-heavy codebases.

## Orphan Risks
- Leaf tables (losses, damages, human effects) often lack a direct tenant stamp, requiring joins to reach tenant context. A direct query on such a table without joins can return cross-tenant data.
- Leaf tables with no cascade definition are orphaned if any step in the application-managed delete sequence throws or is skipped. Map every step and assert completion in tests.
- Self-referential FK cycles (e.g., event hierarchy parent/child) have no DB-level cycle guard. Document the assumption; add application-level cycle detection.

## UUID Strategy
- UUID v4 (random) PKs cause B-tree index fragmentation at bulk-import scale. Assess whether UUIDv7 (time-ordered) is viable for high-insert tables.
- Idempotent external imports should use a composite unique constraint of (externalImportId, tenantId) — enables upsert without exposing internal UUIDs to partner systems.
