import { Router, type IRouter } from "express";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { db, resourcesTable } from "@workspace/db";
import { requireAuth, requireAdmin } from "../middlewares/requireAuth";
import { toResource, slugify } from "../lib/serializers";
import {
  ListResourcesQueryParams,
  GetResourceParams,
  CreateResourceBody,
  UpdateResourceBody,
  UpdateResourceParams,
  DeleteResourceParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function canAccessPremium(user: { tier: string; role: string } | undefined): boolean {
  if (!user) return false;
  return user.tier === "premium" || user.role === "admin";
}

router.get("/resources", requireAuth, async (req, res): Promise<void> => {
  const parsed = ListResourcesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { category, q } = parsed.data;
  const conditions = [];
  if (category) conditions.push(eq(resourcesTable.category, category));
  if (q) {
    conditions.push(
      or(
        ilike(resourcesTable.title, `%${q}%`),
        ilike(resourcesTable.summary, `%${q}%`),
      )!,
    );
  }
  const rows = await db
    .select()
    .from(resourcesTable)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(resourcesTable.updatedAt));
  const premium = canAccessPremium(req.currentUser);
  res.json(rows.map((r) => toResource(r, { canAccessPremium: premium, includeContent: false })));
});

router.get("/resources/:id", requireAuth, async (req, res): Promise<void> => {
  const parsed = GetResourceParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [r] = await db.select().from(resourcesTable).where(eq(resourcesTable.id, parsed.data.id));
  if (!r) {
    res.status(404).json({ error: "Resource not found" });
    return;
  }
  const premium = canAccessPremium(req.currentUser);
  res.json(toResource(r, { canAccessPremium: premium, includeContent: true }));
});

router.post("/resources", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateResourceBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const data = parsed.data;
  let slug = slugify(data.title);
  const [existing] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(resourcesTable)
    .where(eq(resourcesTable.slug, slug));
  if ((existing?.c ?? 0) > 0) slug = `${slug}-${Date.now().toString(36)}`;

  const [row] = await db
    .insert(resourcesTable)
    .values({
      slug,
      title: data.title,
      category: data.category,
      summary: data.summary,
      content: data.content,
      tags: data.tags ?? [],
      fileUrl: data.fileUrl ?? null,
      coverImageUrl: data.coverImageUrl ?? null,
      readingMinutes: data.readingMinutes ?? null,
      isPremium: data.isPremium ?? false,
      authorName: req.currentUser?.name ?? "FMAA",
    })
    .returning();
  res.status(201).json(toResource(row!));
});

router.patch("/resources/:id", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateResourceParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const body = UpdateResourceBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const [row] = await db
    .update(resourcesTable)
    .set(body.data)
    .where(eq(resourcesTable.id, params.data.id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Resource not found" });
    return;
  }
  res.json(toResource(row));
});

router.delete("/resources/:id", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const parsed = DeleteResourceParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .delete(resourcesTable)
    .where(eq(resourcesTable.id, parsed.data.id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Resource not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
