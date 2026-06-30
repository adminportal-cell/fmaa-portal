---
name: Portal auth is cookie-based via same-origin proxy
description: Why blanket 401s appear and how the portal actually authenticates to the API
---

The portal authenticates to the API using **Clerk session cookies**, sent automatically
because portal and api-server are same-origin behind the shared proxy. The portal does
**NOT** call `setAuthTokenGetter` — no `Authorization: Bearer` header is ever attached.

**Why:** `lib/api-client-react` custom-fetch only adds a bearer token if a token getter is
registered; the portal never registers one and relies on the default same-origin cookie send.

**How to apply:** If *every* authenticated API call returns 401 (incl. GET /api/me), suspect
the Clerk provider never initialized — often a stale HMR crash inside `App.tsx`/ClerkProvider
leaves the app broken so the session cookie is absent. A full browser refresh (clean rebuild)
fixes it. This is an auth/runtime-state issue, not a request-body or route problem.
