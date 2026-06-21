import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export const getExamAnalytics = async (
  req: Request,
  res: Response,
) => {
  try {
    const examId = String(req.params.examId);

    const exam = await prisma.exam.findUnique({
      where: {
        id: examId,
      },

      include: {
        questions: {
          include: {
            options: true,
            answers: true,
          },
        },

        attempts: {
          include: {
            student: true,
            answers: {
              include: {
                question: true,
                selectedOptions: {
                  include: {
                    option: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!exam) {
      return res.status(404).json({
        message: "Exam not found",
      });
    }

    const totalAttempts =
      exam.attempts.length;

    const averageScore =
      totalAttempts === 0
        ? 0
        : exam.attempts.reduce(
            (sum, a) => sum + (a.percentage || 0),
            0,
          ) / totalAttempts;

    const passCount =
      exam.attempts.filter(
        (a) => a.passed,
      ).length;

    const failCount =
      totalAttempts - passCount;

    const questionStats =
      exam.questions.map((q) => {
        const totalAnswers =
          q.answers.length;

        const correctAnswers =
          q.answers.filter(
            (a) => a.isCorrect,
          ).length;

        return {
          id: q.id,
          question: q.question,
          difficulty: q.difficulty,

          correctRate:
            totalAnswers === 0
              ? 0
              : (
                  (correctAnswers /
                    totalAnswers) *
                  100
                ).toFixed(1),
        };
      });

    const members =
      exam.attempts
        .sort(
          (a, b) =>
            (b.percentage || 0) -
            (a.percentage || 0),
        )
        .map((a) => ({
          attemptId: a.id,

          studentId: a.student.id,

          name: a.student.name,

          score: a.score,

          percentage: a.percentage,

          passed: a.passed,

          submittedAt:
            a.submittedAt,
        }));

    return res.json({
      examId: exam.id,
      title: exam.title,

      averageScore:
        averageScore.toFixed(1),

      totalAttempts,

      passCount,

      failCount,

      passRate:
        totalAttempts === 0
          ? 0
          : (
              (passCount /
                totalAttempts) *
              100
            ).toFixed(1),

      members,

      questionStats,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server Error",
    });
  }
};