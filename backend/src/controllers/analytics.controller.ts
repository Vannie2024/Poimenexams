import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export const getExamAnalytics = async (req: Request, res: Response) => {
  const { examId } = req.params;
  console.log("DEBUG: Looking for Exam ID:", examId);

  const id = Array.isArray(examId) ? examId[0] : examId;

  const exam = await prisma.exam.findUnique({
    where: { id },
    include: {
      attempts: {
        include: { 
          student: { select: { name: true } } 
        }
      }
    }
  });

  if (!exam) {
    console.log("DEBUG: Exam NOT FOUND in database");
    return res.status(404).json({ message: "Exam not found" });
  }

  const totalScore = exam.attempts.reduce(
    (acc: number, curr: { score: number | null }) => acc + (curr.score || 0), 
    0
  );

  const avgScore = exam.attempts.length > 0 
    ? totalScore / exam.attempts.length 
    : 0;

  res.json({
    title: exam.title,
    averageScore: avgScore.toFixed(1),
    totalAttempts: exam.attempts.length,
    members: exam.attempts.map((a) => ({
      id: a.id,
      name: a.student.name,
      score: a.score,
      passed: a.passed,
      submittedAt: a.submittedAt
    }))
  });
};