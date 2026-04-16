---
name: Architectural Decision Record
description: Strategic architecture decisions for a small-team government DRM system — topology, CQRS, DB, event sourcing, BFF, anti-patterns to avoid
type: project
---

## Decision: Modular Monolith, not Microservices

Keep single-process deployment. Enforce hard module boundaries in code (no cross-domain internal imports). Analytics domain is the only future extraction candidate, and only if read replica + materialised views cannot satisfy load.

**Why:** Government multi-country deployment means one-container simplicity is a deployment requirement, not laziness. No distributed tracing, no service mesh, no saga transactions — small teams cannot maintain that operational surface.

**Prerequisite for future extraction:** Module seams must be enforced with `index.ts` public interfaces per domain before any service split.

## Decision: Lightweight CQRS — Two DB Instances, No Separate Models

Add a read-replica DB instance for analytics queries. All heavy reads (complex joins, CTEs) route to the replica. All writes stay on the primary. Organise code into `commands/` and `queries/` subdirectories per domain module — convention only, not infrastructure. Add materialised views for the heaviest analytics queries, refreshed on a schedule.

**Why:** Genuine read/write asymmetry exists in DRM systems. Analytics queries compete with write operations on the same primary. A read replica is a provisioning operation + two config lines.

## Decision: PostgreSQL + PostGIS stays; Add Redis; No additional stores

PostgreSQL covers all workloads: geospatial (PostGIS), time-series losses, full-text multi-language JSONB search.

Redis is the only addition justified: session storage, reference data cache, analytics query cache, background job queue.

**Reject for small-team DRM:** TimescaleDB, InfluxDB, Elasticsearch, MongoDB — no workload at typical DRM scale justifies the synchronisation pipeline cost.

## Decision: Event Sourcing — Reject; Extend Existing Audit Log

An audit log table (old/new values JSONB, action, userId, tenantId, timestamp) meets compliance requirements. Full event sourcing requires a projections layer, projection rebuilds on migration, and rewriting all read queries — unjustified for a small team.

**One exception:** If formal approval workflow states are added (Draft → Under Review → Validated → Published), implement as in-process domain events (EventEmitter or lightweight bus), not full event sourcing.

## Decision: API Gateway / BFF — Logical separation within monolith, no split

One process serves SSR UI and REST API. Do not split yet. Apply OpenAPI 3.1 spec as contract for all API routes. Rate limiting only on API routes (not SSR routes). API key auth consolidated into shared middleware.

**Trigger for actual BFF split:** Different deployment cadence needed between API and UI, OR clients with significantly different payload requirements.

## Anti-Patterns Explicitly Rejected

- Microservices before clean module seams exist
- Kafka/RabbitMQ as general integration layer (BullMQ on Redis covers actual async needs at DRM scale)
- GraphQL (N+1 cost calculations are a SQL problem, not a resolver problem)
- Horizontal app scaling before session store is off the primary DB (causes write amplification)
- Polyglot persistence (Elasticsearch + TimescaleDB + PostGIS) — too many synchronisation pipelines for a small team
- Eventual consistency on the write/transactional path
- Full CQRS with separate write/read models and projection engine
