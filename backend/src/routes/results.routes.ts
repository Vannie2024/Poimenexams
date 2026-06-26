import { Router } from "express";

import {
  getAttemptDetails,
  reassessAttempt
} from "../controllers/results.controller";

const router = Router();

router.get(
  "/attempt/:attemptId",
  getAttemptDetails,
);

router.post("/attempt/:attemptId/reassess", reassessAttempt)

export default router;