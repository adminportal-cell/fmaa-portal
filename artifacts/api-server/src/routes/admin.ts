import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { requireAuth, requireAdmin } from "../middlewares/requireAuth";
import { toMember } from "../lib/serializers";
import { UpdateMemberBody, UpdateMemberParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/admin/members", requireAuth, requireAdmin, async (_req, res): Promise<void> => {
  const rows = await db.select().from(usersTable).orderBy(desc(usersTable.createdAt));
  res.json(rows.map(toMember));
});

router.patch("/admin/members/:id", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateMemberParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const body = UpdateMemberBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const [row] = await db
    .update(usersTable)
    .set(body.data)
    .where(eq(usersTable.id, params.data.id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Member not found" });
    return;
  }
  res.json(toMember(row));
});

export default router;
