import { Router, type IRouter } from "express";
import { desc, eq, inArray } from "drizzle-orm";
import { db, resourceViewsTable, resourcesTable } from "@workspace/db";
import { requireAuth } from "../middlewares/requireAuth";
import { toMe, toResource } from "../lib/serializers";

const router: IRouter = Router();

router.get("/me", requireAuth, async (req, res): Promise<void> => {
  res.json(toMe(req.currentUser!));
});

router.get("/me/progress", requireAuth, async (req, res): Promise<void> => {
  const userId = req.currentUser!.id;
  const views = await db
    .select()
    .from(resourceViewsTable)
    .where(eq(resourceViewsTable.userId, userId))
    .orderBy(desc(resourceViewsTable.lastViewedAt));

  const viewedResourceIds = views.map((v) => v.resourceId);

  let recentlyViewed: typeof resourcesTable.$inferSelect[] = [];
  if (viewedResourceIds.length > 0) {
    const rows = await db
      .select()
      .from(resourcesTable)
      .where(inArray(resourcesTable.id, viewedResourceIds.slice(0, 10)));
    const byId = Object.fromEntries(rows.map((r) => [r.id, r]));
    recentlyViewed = viewedResourceIds
      .slice(0, 10)
      .map((id) => byId[id])
      .filter(Boolean);
  }

  const isPremium = req.currentUser!.tier === "premium" || req.currentUser!.role === "admin";
  res.json({
    viewedResourceIds,
    recentlyViewed: recentlyViewed.map((r) =>
      toResource(r, { canAccessPremium: isPremium, includeContent: false }),
    ),
  });
});

export default router;
