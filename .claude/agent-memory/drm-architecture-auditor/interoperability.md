---
name: Interoperability Assessment Checklist
description: Critical interoperability gaps and anti-patterns common in government DRM systems — generic audit checklist
type: project
---

## Critical Gaps to Audit

### 1. No OpenAPI Specification
No machine-readable contract means every integration partner must reverse-engineer from source. Blocks contract testing in CI and partner onboarding. Fix: OpenAPI 3.1 spec as the first artifact before any new endpoint is built.

### 2. No Sendai Framework API Layer
No endpoint mapping system data to Sendai Monitor indicator vocabulary (Targets A–G) — the primary UNDRR/national reporting requirement for DRM systems. Fix: dedicated Sendai export endpoints with FK resolution to human-readable labels.

### 3. GLIDE Number Without Registry Integration
GLIDE number field exists but no inbound lookup from glidenumber.net and no outbound GLIDE assignment. Manual entry only. Fix: integration with GLIDE registry API for lookup and auto-assignment.

### 4. No Webhooks or Event Push
No outbound HTTP push, no message queue publisher, no SSE. External systems must poll. Critical gap for national alert system integration and UN OCHA data feeds. Fix: webhook delivery with retry and dead-letter handling.

### 5. No GIS Platform Integration
No WMS/WFS endpoints, no OGC API Features, no GeoPackage/Shapefile export. JSONB spatial storage instead of native PostGIS geometry prevents ArcGIS/QGIS direct consumption and spatial indexing. Fix: use PostGIS geometry columns; add OGC-compliant endpoints.

### 6. No Headless Bulk Import Pipeline
Large data imports require UI interaction. No headless API pipeline for automated bulk ingestion. Fix: API endpoints for all import types with async job status polling.

## Anti-Patterns That Make Future Integrations Expensive

### Route-Coupled Business Logic
Business logic and tenant context injection embedded in web framework route files. Any new protocol adapter must duplicate all of this. Fix: extract business logic to a protocol-agnostic service layer.

### JSONB Spatial Storage
Spatial footprints stored as JSONB instead of PostGIS geometry. Migrating later requires transforming all existing values. Fix early: use PostGIS geometry columns from the start.

### Language-Prefixed API URLs
API routes under a language-prefix URL segment break API consumers when the tenant's language setting changes. Fix: stable `/api/*` prefix; language as query parameter or Accept-Language header.

### UUID-Only CSV Exports
CSV exports expose internal UUID foreign keys without resolving to human-readable labels. Unusable by ministry statisticians and partner systems. Fix: Sendai-aligned export route with FK resolution.

### SSO Hardcoded to Single Identity Provider
SSO implementation tightly coupled to one provider with no generic OIDC abstraction. Adding a second IdP requires duplicating the full auth flow. Fix: generic OIDC layer with provider-specific adapters.
