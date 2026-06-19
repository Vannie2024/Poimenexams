import { Router } from "express";

import {
  getExams,
  createExam,
  getExamById,
  updateExam,
  deleteExam
} from "../controllers/exam.controller";

console.log("getExams =", getExams);
console.log("createExam =", createExam);

const router = Router();

router.get("/", getExams);

router.post("/", createExam);

router.get("/:id", getExamById);

router.put("/:id", updateExam);

router.delete("/:id", deleteExam);

export default router;