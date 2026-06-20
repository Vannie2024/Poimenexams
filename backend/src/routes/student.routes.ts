import { Router } from "express";

import {
  getStudentExams,
  getStudentHistory
  
} from "../controllers/student.controller";

const router = Router();

router.get(
  "/:studentId/exams",
  getStudentExams,
);

router.get(
  "/:studentId/history",
  getStudentHistory,
);

export default router;