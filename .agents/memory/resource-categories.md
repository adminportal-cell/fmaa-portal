---
name: Resource category contract
description: Where resource category values must stay in sync across the FMAA portal
---

Resource `category` is a free-form `text` column in the DB (`lib/db/src/schema/resources.ts`) — no Postgres enum, so adding categories needs NO migration.

**Rule:** The set of valid category values is enforced by the `ResourceCategory` enum in `lib/api-spec/openapi.yaml`. Server query/body validation (`@workspace/api-zod`) and the generated client both derive from it. The frontend lists in `artifacts/portal/src/lib/categories.ts` (`KNOWN_CATEGORIES`, `TECHNICAL_CATEGORIES`) and the technical topic pages (`pages/technicals/topic.tsx`, which call `useListResources({ category })`) MUST only use values present in that enum.

**Why:** The technicals pages filter resources by category values like `accounting`, `valuation`, `dcf`, `lbo`, `m&a`, `excel`. The frontend casts `category` with `as any`, so a missing enum value type-checks fine but the API returns 400 at runtime. Keep all three in lockstep.

**How to apply:** When adding a technical topic/category, add it to the `ResourceCategory` enum in openapi.yaml (quote `"m&a"` — `&` is a YAML anchor char), run `pnpm --filter @workspace/api-spec run codegen`, then clean `lib/*/dist` + `*.tsbuildinfo` and `pnpm run typecheck:libs` before the leaf typechecks.
