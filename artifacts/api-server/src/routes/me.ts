import { Router, type IRouter } from "express";
import { requireAuth } from "../middlewares/requireAuth";
import { toMe } from "../lib/serializers";

const router: IRouter = Router();

router.get("/me", requireAuth, async (req, res): Promise<void> => {
  res.json(toMe(req.currentUser!));
});

export default router;
