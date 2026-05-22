import { Router, type IRouter } from "express";
import { and, desc, eq, sql } from "drizzle-orm";
import { db, alumniProfilesTable } from "@workspace/db";
import { requireAuth, requireAdmin } from "../middlewares/requireAuth";
import { toAlumni } from "../lib/serializers";
import {
  ListAlumniQueryParams,
  GetAlumniParams,
  CreateAlumniBody,
  UpdateAlumniBody,
  UpdateAlumniParams,
  DeleteAlumniParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/alumni", requireAuth, async (req, res): Promise<void> => {
  const parsed = ListAlumniQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { industry } = parsed.data;
  const rows = await db
    .select()
    .from(alumniProfilesTable)
    .where(industry ? and(eq(alumniProfilesTable.industry, industry)) : undefined)
    .orderBy(desc(alumniProfilesTable.createdAt));
  res.json(rows.map(toAlumni));
});

router.get("/alumni/industries", requireAuth, async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      industry: alumniProfilesTable.industry,
      count: sql<number>`count(*)::int`,
    })
    .from(alumniProfilesTable)
    .groupBy(alumniProfilesTable.industry)
    .orderBy(desc(sql`count(*)`));
  res.json(rows);
});

router.get("/alumni/:id", requireAuth, async (req, res): Promise<void> => {
  const parsed = GetAlumniParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .select()
    .from(alumniProfilesTable)
    .where(eq(alumniProfilesTable.id, parsed.data.id));
  if (!row) {
    res.status(404).json({ error: "Alumni not found" });
    return;
  }
  res.json(toAlumni(row));
});

router.post("/alumni", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateAlumniBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db.insert(alumniProfilesTable).values(parsed.data).returning();
  res.status(201).json(toAlumni(row!));
});

router.patch("/alumni/:id", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateAlumniParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const body = UpdateAlumniBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const [row] = await db
    .update(alumniProfilesTable)
    .set(body.data)
    .where(eq(alumniProfilesTable.id, params.data.id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Alumni not found" });
    return;
  }
  res.json(toAlumni(row));
});

router.delete("/alumni/:id", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const parsed = DeleteAlumniParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .delete(alumniProfilesTable)
    .where(eq(alumniProfilesTable.id, parsed.data.id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Alumni not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
