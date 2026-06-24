import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export const getAttemptDetails = async (req: Request, res: Response) => {
  try {
    const attemptId = String(req.params.attemptId);

    const attempt = await prisma.examAttempt.findUnique({
      where: {
        id: attemptId,
      },
      include: {
        student: true,
        exam: true,
        answers: {
          include: {
            question: {
              include: {
                options: true,
              },
            },
            selectedOptions: {
              include: {
                option: true,
              },
            },
          },
        },
      },
    });

    return res.json(attempt);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server Error",
    });
  }
};

export const reassessAttempt = async (req: Request, res: Response) => {

  const attemptId = Array.isArray(req.params.attemptId)
    ? req.params.attemptId[0]
    : req.params.attemptId;

  try {

    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: {
        exam: {
          include: {
            questions: {
              include: {
                options: true
              }
            }
          }
        },
        answers: {
          include: {
            selectedOptions: true
          }
        }
      }
    });

    if (!attempt || !attempt.exam || !attempt.answers) {
      return res.status(404).json({ message: "Attempt content context missing." });
    }

    let correctCount = 0;
    const totalQuestions = attempt.exam.questions.length;

    for (const answer of attempt.answers) {

      const currentQuestionId = (answer as any).questionId;
      const question = attempt.exam.questions.find(q => q.id === currentQuestionId);
      if (!question) continue;

      const correctOptionIds = question.options.filter(o => o.isCorrect).map(o => o.id);
      const selectedOptionIds = answer.selectedOptions.map(so => so.optionId);

      const isCorrect = correctOptionIds.length === selectedOptionIds.length &&
                        correctOptionIds.every(id => selectedOptionIds.includes(id));

      await prisma.answer.update({ 
        where: { id: answer.id }, 
        data: { isCorrect } 
      });
      
      if (isCorrect) correctCount++;
    }

    const correctMarks = (attempt.exam as any).correctMarks ?? 1;
    const newScore = correctCount * correctMarks;
    const newPercentage = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;

    const updated = await prisma.examAttempt.update({
      where: { id: attemptId },
      data: { 
        score: newScore, 
        percentage: newPercentage, 
        passed: newPercentage >= attempt.exam.passMark 
      }
    });

    return res.status(200).json(updated);
  } catch (err) {
    console.error("Reassessment failure engine dump:", err);
    return res.status(500).json({ message: "Error recalculating core marks metrics." });
  }
};