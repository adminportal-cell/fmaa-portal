---
name: Clerk dev instance fails inside the Replit preview iframe
description: Why signed-in API calls 401 only in the embedded preview, and the workaround
---

Signing in works but every authenticated API call (`/api/me`, `/api/dashboard/summary`,
etc.) returns 401 **only inside the Replit preview pane** (an iframe). In a standalone
browser tab and in the automated test browser the same flow returns 200 and roles resolve
correctly. The DB role/tier and server Clerk config are fine — do not chase those.

**Why:** This app uses a Clerk *development* instance (`pk_test...`). Dev instances rely on
a session cookie that browsers block in cross-site iframe contexts (third-party cookie
policy), so the `__session` cookie isn't sent to the API from inside the preview iframe.
The `clerkProxyMiddleware` that would make Clerk first-party is **production-only**
(no-op when NODE_ENV !== production), so dev has no proxy to rescue it.

**How to apply:** If a user reports "portal page won't load / I show as standard not admin"
while the anonymous pages and sign-in page DO load, suspect the iframe, not the code.
Workaround: open the app in a NEW browser tab (the full *.replit.dev URL). Deployed/published
builds work normally because the production Clerk proxy makes the session first-party.
