---
name: Approved-email → member reconciliation
description: How pre-created placeholder member rows are adopted on first sign-in, and the PK-only adoption rule.
---

# Pre-created members & sign-in reconciliation

When an admin approves an email, a placeholder `users` row is pre-created with id `pending:<email>` so the person appears under admin "Accesses" (UI label; the table/route is still `members`) before they ever sign in. On Clerk sign-in, `jitProvisionUser` adopts that row by updating its PK to the real Clerk id.

**Rule:** adoption must match the placeholder strictly by its PK (`id = "pending:" + email`), NEVER by email alone.

**Why:** `users.email` has no unique constraint, and the `resource_views.user_id` FK has no `ON UPDATE CASCADE`. A broad `WHERE email = ?` update could mutate a real account's PK (FK failure / orphaned views) or hit multiple rows. Matching the placeholder PK is safe because a placeholder never has dependent rows and its id is unique.

**How to apply:** any future email-based user lookup/merge in `requireAuth.ts` or admin member flows must keep this PK-only restriction. The normal returning-user path already matches by Clerk id first; the placeholder path only runs when no row has the Clerk id. Symmetric cleanup: removing an approved email deletes the `pending:<email>` row.

**First-sign-in concurrency:** a fresh sign-in fires `/api/me` and `/api/dashboard/summary` in parallel; both run JIT provisioning. Every write path here (insert AND placeholder adoption) must be race-safe — the insert uses `onConflictDoNothing` on the PK plus re-select, mirroring the adoption path's lost-race re-select. Symptom of a regression: intermittent 500 on the very first authenticated page load (dashboard appears empty), succeeding on retry.
