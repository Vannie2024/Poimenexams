import { Router } from "express";

import {
  createQuestion,
  getQuestionsByExam,
  deleteQuestion,
  importQuestionsFromExcel,
} from "../controllers/question.controller";

const router = Router();

router.get("/exam/:examId", getQuestionsByExam);

router.post("/", createQuestion);

router.delete("/:id", deleteQuestion);

router.post("/exam/:examId/bulk-excel", importQuestionsFromExcel);

export default router;