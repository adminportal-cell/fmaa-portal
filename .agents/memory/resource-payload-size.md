---
name: Resource list payload size
description: Uploaded files are stored as base64 data URLs in the DB; list endpoints must never return them
---

Uploaded resource files are stored as base64 data URLs in the `file_url` column (tens of MB per row). Any endpoint that returns multiple resources must exclude `fileUrl` at the SQL select level (getTableColumns spread minus fileUrl + computed `hasFile` boolean) and serialize with `includeFile: false`.

**Why:** GET /api/resources once returned ~37MB of JSON in production, so the Resources tab never rendered and uploads appeared "missing". The same failure mode applies to any new endpoint that lists resources.

**How to apply:** Only GET /resources/:id (and create/update responses) should include `fileUrl`. Clients get `hasFile` on list rows; the edit dialog fetches the full resource by id because list rows omit both `content` and `fileUrl`.
