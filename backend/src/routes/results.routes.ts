import { Router } from "express";

import {
  getAttemptDetails,
} from "../controllers/results.controller";

const router = Router();

router.get(
  "/attempt/:attemptId",
  getAttemptDetails,
);

export default router;