import { Router } from "express";
import { getExamAnalytics } from "../controllers/analytics.controller";

const router = Router();
router.get("/:examId", getExamAnalytics);

export default router;