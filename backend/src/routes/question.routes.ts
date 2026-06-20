import { Router } from "express";

import {
  createQuestion,
  getQuestionsByExam,
  deleteQuestion,
} from "../controllers/question.controller";

const router = Router();

router.get("/exam/:examId", getQuestionsByExam);

router.post("/", createQuestion);

router.delete("/:id", deleteQuestion);

export default router;