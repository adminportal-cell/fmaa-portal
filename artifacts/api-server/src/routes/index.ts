import { Router, type IRouter } from "express";
import healthRouter from "./health";
import meRouter from "./me";
import dashboardRouter from "./dashboard";
import resourcesRouter from "./resources";
import alumniRouter from "./alumni";
import adminRouter from "./admin";
import approvedMembersRouter from "./approvedMembers";

const router: IRouter = Router();

router.use(healthRouter);
router.use(meRouter);
router.use(dashboardRouter);
router.use(resourcesRouter);
router.use(alumniRouter);
router.use(adminRouter);
router.use(approvedMembersRouter);

export default router;
