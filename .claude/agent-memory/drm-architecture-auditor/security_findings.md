---
name: Security Findings
description: Structural security vulnerability classes common in government DRM systems — generic audit checklist
type: project
---

## 1. API Keys Stored Plaintext
API key secrets stored as plaintext in the database. If the DB is compromised, all keys are immediately usable. Fix: store as bcrypt/SHA-256 hash; compare on lookup; never store the raw value.

## 2. No Database-Level Row-Level Security
All tenant isolation is application-enforced via WHERE clause scoping. No DB-level RLS policies. A single SQL injection or query construction bug bypasses tenant isolation for all tenants simultaneously. Fix: PostgreSQL RLS policies on all tenant-scoped tables as the DB-level backstop.

## 3. Superadmin Synthetic Identity Bypasses Normal Auth
A hardcoded mock session object is constructed for superadmin paths, using a string constant as the userId in audit logs. Synthetic identity is passed to business logic expecting real user objects. Fix: superadmin must authenticate as a real user record with an elevated role flag.

## 4. CSP `unsafe-inline` in Build Config
Content Security Policy includes `unsafe-inline` for scripts, defeating XSS protection. Fix: eliminate inline scripts; use nonce-based CSP or strict CSP headers; validate production headers separately from dev server config.

## 5. Shared Secret Across Privilege Tiers
Same session secret signs both regular user sessions and elevated-privilege sessions. A compromised secret affects both tiers simultaneously. Fix: separate secrets per session tier.

## 6. No Rate Limiting on Auth Endpoints
No rate limiting on login, TOTP, password reset, or API key endpoints. Brute force attacks are unbounded. Fix: rate limiting middleware on all auth-critical routes.

## 7. Cross-Tenant Data Leakage on Lookup Endpoints
Certain endpoints (geospatial, export, lookup) query by record ID without asserting tenant ownership. Any authenticated user knowing a UUID can retrieve data from any tenant. Fix: always sub-query join against tenant root; return 404 (not 403) to avoid record existence disclosure.

## 8. Invite Code Reuse
When re-inviting an unverified user, existing invite code is reused without regeneration. Extends exposure window if original invite was intercepted. Fix: always regenerate invite codes on re-invite; enforce short expiry.
