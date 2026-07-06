---
name: Premium-only membership
description: The standard tier was retired — approval list is now the access gate, everyone provisioned as premium
---

All members are premium; the "standard" tier is retired (July 2026).

**The rule:** The approved-members list is the sole access gate. JIT provisioning always sets tier="premium". Unapproved non-admin emails get 403 `code: "not_approved"` from requireAuth; the portal Layout shows a full-page "Access restricted" screen with sign-out. Removing an email from the approved list now means full lockout on their next request (previously it downgraded to standard with locked content).

**Why:** With tier no longer varying, the old "unapproved users get standard tier + nullified premium content" gating would have silently granted full access to anyone who could create a Clerk account (e.g. Google OAuth sign-in transfer). The 403 gate closes that hole.

**How to apply:**
- Don't reintroduce tier as a settable field (removed from MemberUpdate in openapi). The DB `tier` column and serializer premium-gating remain as harmless legacy.
- Prod rows self-heal to premium via JIT on each authenticated request; dev rows were bulk-updated.
- Pre-authorized admin emails and role=admin rows bypass the approval gate.
