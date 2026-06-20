import { Router } from "express";

import {
  getExams,
  createExam,
  getExamById,
  updateExam,
  deleteExam,
  getExamForAttempt,
  submitExamAttempt,
  getAttemptDetails,
  getExamGroups,
  assignGroupToExam,

} from "../controllers/exam.controller";

console.log("getExams =", getExams);
console.log("createExam =", createExam);
console.log("getExamForAttempt =", getExamForAttempt);
console.log("submitExamAttempt =", submitExamAttempt);
console.log("getAttemptDetails =", getAttemptDetails);
console.log("getExamGroups =", getExamGroups);
console.log("assignGroupToExam =", assignGroupToExam);  

const router = Router();

router.get("/", getExams);

router.post("/", createExam);

router.get("/:id", getExamById);

router.put("/:id", updateExam);

router.delete("/:id", deleteExam);

router.get("/:examId/attempt", getExamForAttempt);

router.post("/:examId/submit", submitExamAttempt);

router.get("/attempt/:attemptId", getAttemptDetails);

router.get("/:examId/groups", getExamGroups);

router.post("/:examId/groups", assignGroupToExam);

export default router;