import { Router, type IRouter } from "express";
import healthRouter from "./health";
import missionsRouter from "./missions";
import settingsRouter from "./settings";

const router: IRouter = Router();

router.use(healthRouter);
router.use(missionsRouter);
router.use(settingsRouter);

export default router;
