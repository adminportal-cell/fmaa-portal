---
name: drizzle-kit push column rename needs TTY
description: Why `pnpm --filter @workspace/db run push` can hang/fail and the safe workaround
---

`drizzle-kit push` prompts interactively when it detects an ambiguous change (e.g. a column rename vs drop+add — "is `category` now `categories`?"). In this non-interactive shell it errors with "Interactive prompts require a TTY terminal". `--force` does NOT skip this prompt.

**Why:** drizzle can't tell a rename from a drop+create, so it asks; there is no TTY to answer.

**How to apply:** When the table is empty (verify first), apply the column change directly via SQL through the `executeSql` callback (`ALTER TABLE ... DROP COLUMN ...; ALTER TABLE ... ADD COLUMN ...`), then the schema matches and push is unnecessary. For non-empty tables, prefer a manual `ALTER TABLE ... RENAME COLUMN` so data is preserved.
