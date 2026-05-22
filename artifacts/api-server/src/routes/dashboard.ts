import { Router, type IRouter } from "express";
import { desc, sql } from "drizzle-orm";
import { db, resourcesTable, alumniProfilesTable } from "@workspace/db";
import { requireAuth } from "../middlewares/requireAuth";
import { toResource, toAlumni } from "../lib/serializers";

const router: IRouter = Router();

router.get("/dashboard/summary", requireAuth, async (req, res): Promise<void> => {
  const [totalResRow] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(resourcesTable);
  const [totalAlumniRow] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(alumniProfilesTable);

  const categoryCounts = await db
    .select({
      category: resourcesTable.category,
      count: sql<number>`count(*)::int`,
    })
    .from(resourcesTable)
    .groupBy(resourcesTable.category);

  const recent = await db
    .select()
    .from(resourcesTable)
    .orderBy(desc(resourcesTable.updatedAt))
    .limit(6);

  const featured = await db
    .select()
    .from(alumniProfilesTable)
    .orderBy(desc(alumniProfilesTable.createdAt))
    .limit(4);

  res.json({
    totalResources: totalResRow?.c ?? 0,
    totalAlumni: totalAlumniRow?.c ?? 0,
    categoryCounts,
    recentResources: recent.map((r) =>
      toResource(r, {
        canAccessPremium:
          req.currentUser?.tier === "premium" || req.currentUser?.role === "admin",
        includeContent: false,
      }),
    ),
    featuredAlumni: featured.map(toAlumni),
  });
});

export default router;
