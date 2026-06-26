import { Router } from "express";
import multer from "multer";
import {
  createQuestion,
  getQuestionsByExam,
  deleteQuestion,
  importQuestionsFromExcel,
} from "../controllers/question.controller";

const router = Router();

const upload = multer({ storage: multer.memoryStorage() });

router.get("/exam/:examId", getQuestionsByExam);

router.post("/", createQuestion);

router.delete("/:id", deleteQuestion);

router.post("/exam/:examId/bulk-excel", upload.single("file"), importQuestionsFromExcel);

export default router;