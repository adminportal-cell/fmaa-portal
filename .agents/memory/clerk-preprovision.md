---
name: Clerk pre-provisioned member accounts
description: Approved-list emails get Clerk accounts created server-side so email-code sign-in works with no sign-up
---
Decision: there is no public sign-up in the FMAA portal. When an admin adds emails to the approved list, the API pre-creates passwordless Clerk accounts (createUser with skipPasswordRequirement); GET approved-members backfills accounts in the background for pending placeholders. Sign-in card hides the sign-up footer; /sign-up redirects to /sign-in.
**Why:** most members use university (non-Google) emails; Clerk sign-in fails with "Couldn't find your account" unless the account exists, and the user rejected a sign-up gate.
**How to apply:** any future flow granting member access must ensure a Clerk account exists (dev and prod Clerk instances are separate — prod backfill happens when admin opens the Accesses tab in the deployed app). POST returns provisionFailed[] and the admin UI warns on it.

Related: Clerk auth emails showed the stale tenant name ("Metcash Promotional Planner Mapping") via {{app.name}}. The API server now rewrites user-facing Clerk email templates on startup to say "FMAA Portal" (idempotent, per instance — prod applies on first boot after republish). Tradeoff: templates are forked from Clerk defaults, so future Clerk copy updates won't auto-propagate.
