---
name: Scalability Bottlenecks
description: Load-related risks and single points of failure common in government DRM systems — generic audit checklist
type: project
---

## 1. Unconfigured DB Connection Pool
Database client initialized without explicit pool configuration. Default pool maximum (typically 10 connections) exhausts under 100x load (national emergency simulation), causing cascading request failures. Fix: explicit pool config; move session storage to Redis to reduce connection pressure.

## 2. DB Write on Every Authenticated Request
Session last-active timestamp updated via DB write on every authenticated request. Under surge load this is a serialized write bottleneck. Fix: debounce updates to Redis; flush to DB asynchronously on a schedule.

## 3. No Caching Layer
Reference data (lookup tables, geographic hierarchy, config) re-queried from the primary DB on every request. Under surge, the DB is the sole scaling target with no cache shielding. Fix: Redis with short TTL for reference data; session storage in Redis.

## 4. Single-Node Deployment Without Orchestration
Single app container with no load balancer, no horizontal scaling, no health checks, no orchestration. A single instance failure = complete outage. Fix: orchestration (Kubernetes/ECS), health checks, horizontal auto-scaling.

## 5. Large File Uploads Fully In-Memory
Large file uploads (ZIP geographies, CSV imports) parsed entirely in memory during the HTTP request. Under concurrent uploads this creates unbounded heap pressure. Fix: stream to disk or object storage; process via background queue.

## 6. Synchronous Aggregate Recalculation on Write
Aggregate totals recalculated synchronously inside the write transaction on every record save. Increases write latency proportionally with dataset size. Fix: async background job triggered post-commit.

## 7. No Read Replica or CQRS Separation
All queries (analytics reads and transactional writes) go to the same primary DB instance. Heavy analytics queries compete with writes. Fix: read replica + route analytics queries to it; materialised views for the heaviest aggregations.

## 8. NODE_ENV=development in Production Image
Production Dockerfile sets a development environment variable while running the production serve command. Disables production optimisations, enables verbose error stacks in responses, may disable secure cookie flags. Fix: set NODE_ENV=production in production images; validate at startup.
