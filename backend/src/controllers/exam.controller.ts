import { Request, Response } from "express";
import { prisma } from "../lib/prisma";


export const getExams = async (
  req: Request,
  res: Response
) => {
  try {
    const exams = await prisma.exam.findMany({
      include: {
        examGroups: {
          include: {
            group: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json(exams);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server Error",
    });
  }
};

export const createExam = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      title,
      description,
      duration,
      passMark,
      markingSystem,
      correctMarks,
      wrongMarks,
      shuffleQuestions,
      showResultsImmediately,
      allowRetakes,
      maxAttempts,
      creatorId,
      groupIds,
    } = req.body;

    const creator =
      await prisma.user.findUnique({
        where: {
          id: creatorId,
        },
      });

    if (!creator) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (creator.role !== "ADMIN") {
      return res.status(403).json({
        message:
          "Only admins can create exams",
      });
    }

    const user = await prisma.user.findUnique({
        where: {
            id: creatorId,
        },
        });

        if (!user) {
        return res.status(404).json({
            message: "User not found",
        });
        }

        if (user.role !== "ADMIN") {
        return res.status(403).json({
            message: "Only admins can create exams",
        });
        }

    const exam =
      await prisma.exam.create({
        data: {
          title,
          description,
          duration,
          passMark,

          markingSystem,
          correctMarks,
          wrongMarks,

          shuffleQuestions,
          showResultsImmediately,
          allowRetakes,
          maxAttempts,

          creatorId,

          examGroups: {
            create:
              groupIds?.map(
                (
                  groupId: string
                ) => ({
                  groupId,
                })
              ) || [],
          },
        },
      });

    return res.status(201).json(exam);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server Error",
    });
  }
};

export const getExamById = async (
  req: Request,
  res: Response
) => {
  try {
    const id = String(req.params.id);

    const exam = await prisma.exam.findUnique({
      where: { id },
      include: {
        examGroups: {
          include: {
            group: true,
          },
        },
        questions: true,
      },
    });

    return res.json(exam);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server Error",
    });
  }
};

export const updateExam = async (
  req: Request,
  res: Response
) => {
  try {
    const id = String(req.params.id);

    const {
      title,
      description,
      duration,
      passMark,
      markingSystem,
      correctMarks,
      wrongMarks,
      shuffleQuestions,
      showResultsImmediately,
      allowRetakes,
      maxAttempts,
    } = req.body;

    const exam = await prisma.exam.update({
      where: { id },
      data: {
        title,
        description,
        duration,
        passMark,
        markingSystem,
        correctMarks,
        wrongMarks,
        shuffleQuestions,
        showResultsImmediately,
        allowRetakes,
        maxAttempts,
      },
    });

    return res.json(exam);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server Error",
    });
  }
};

export const deleteExam = async (
  req: Request,
  res: Response
) => {
  try {
    const id = String(req.params.id);

    await prisma.examGroup.deleteMany({
      where: {
        examId: id,
      },
    });

    await prisma.exam.delete({
      where: {
        id,
      },
    });

    return res.json({
      message: "Deleted",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server Error",
    });
  }
};

export const getExamForAttempt = async (req: Request, res: Response) => {
  try {
    const examId = String(req.params.examId);
    const studentId = String(req.headers["x-user-id"] || req.query.studentId);

    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        questions: {
          include: {
            options: true,
          },
        },
      },
    });

    if (!exam) {
      return res.status(404).json({ message: "Exam configuration records not found." });
    }

    const pastAttemptsCount = await prisma.examAttempt.count({
      where: {
        examId: examId,
        studentId: studentId,
      },
    });

    if (pastAttemptsCount >= exam.maxAttempts) {
      return res.status(403).json({ 
        message: `Access denied. You have exhausted your maximum limit of ${exam.maxAttempts} attempt(s) for this assessment.` 
      });
    }

    const safeQuestions = exam.questions.map((q) => ({
      id: q.id,
      question: q.question, 
      type: q.type,
      difficulty: q.difficulty,
      options: q.options.map((opt) => ({
        id: opt.id,
        optionText: opt.optionText, 
      })),
    }));

    return res.json({
      id: exam.id,
      title: exam.title,
      duration: exam.duration,
      maxAttempts: exam.maxAttempts,
      attemptsUsed: pastAttemptsCount,
      questions: safeQuestions,
    });
  } catch (error) {
    console.error("Fetch Live Exam Failed:", error);
    return res.status(500).json({ message: "Server encountered errors validating authorization parameters." });
  }
};

export const submitExamAttempt = async (req: Request, res: Response) => {
  try {
    const examId = String(req.params.examId);
    const { answers, studentId } = req.body; 

    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        questions: {
          include: {
            options: true,
          },
        },
      },
    });

    if (!exam) {
      return res.status(404).json({ message: "Target exam configuration unavailable." });
    }


    const pastAttemptsCount = await prisma.examAttempt.count({
      where: { examId, studentId: String(studentId) },
    });

    if (pastAttemptsCount >= exam.maxAttempts) {
      return res.status(403).json({ message: "Evaluation processing denied. Maximum attempts exceeded." });
    }

    let pointsEarned = 0;
    let totalQuestions = exam.questions.length;

    const finalAnswersToCreate: any[] = [];

    exam.questions.forEach((q) => {
        const chosenOptionId = answers[q.id];
        const correctOption = q.options.find((o) => o.isCorrect);
        
        const isCorrect = correctOption ? chosenOptionId === correctOption.id : false;


        if (exam.markingSystem === "NEGATIVE") {
            if (isCorrect) {
            pointsEarned += exam.correctMarks;
            } else if (chosenOptionId) {
            pointsEarned -= exam.wrongMarks;
            }
        } else if (exam.markingSystem === "CUSTOM") {
            if (isCorrect) pointsEarned += exam.correctMarks;
        } else {

            if (isCorrect) pointsEarned += 1;
        }


        finalAnswersToCreate.push({
            questionId: q.id,
            isCorrect,
            selectedOptionId: chosenOptionId, 
        });
        });


    const maxPossiblePoints = exam.markingSystem === "STANDARD" ? totalQuestions : (totalQuestions * exam.correctMarks);
    const finalPercentage = maxPossiblePoints > 0 ? Math.max(0, (pointsEarned / maxPossiblePoints) * 100) : 0;
    const passed = finalPercentage >= exam.passMark;

 
    const resultAttempt = await prisma.$transaction(async (tx) => {
      const attempt = await tx.examAttempt.create({
        data: {
          examId,
          studentId: String(studentId),
          score: pointsEarned,
          percentage: finalPercentage,
          passed: passed, 
          attemptNumber: pastAttemptsCount + 1,
          submittedAt: new Date(),
        },
      });

      for (const ans of finalAnswersToCreate) {
        const createdAnswer = await tx.answer.create({
          data: {
            attemptId: attempt.id,
            questionId: ans.questionId,
            isCorrect: ans.isCorrect,
          },
        });

        if (ans.selectedOptionId) {
          await tx.selectedOption.create({
            data: {
              answerId: createdAnswer.id,
              optionId: ans.selectedOptionId,
            },
          });
        }
      }

      return attempt;
    });

    return res.status(201).json({
      message: "Submission evaluated successfully.",
      attemptId: resultAttempt.id,
      percentage: finalPercentage,
      passed: resultAttempt.passed,
      showResultsImmediately: exam.showResultsImmediately,
    });
  } catch (error) {
    console.error("Marking Engine Critical Exception:", error);
    return res.status(500).json({ message: "Internal server processing failure grading candidate submission sheet." });
  }
};

export const getAttemptDetails = async (req: Request, res: Response) => {
  try {
    const attemptId = String(req.params.attemptId);
    const studentId = String(req.headers["x-user-id"] || req.query.studentId);

    const attempt = await prisma.examAttempt.findFirst({
      where: { 
        id: attemptId,
        studentId: studentId 
      },
      include: {
        exam: {
          select: {
            title: true,
            passMark: true,
            showResultsImmediately: true,
          }
        },
        answers: {
          include: {
            question: {
              include: {
                options: true
              }
            },
            selectedOptions: true
          }
        }
      }
    });

    if (!attempt) {
      return res.status(404).json({ message: "Requested performance tracking ledger entry missing." });
    }


    if (!attempt.exam.showResultsImmediately) {
      return res.json({
        showResultsImmediately: false,
        examTitle: attempt.exam.title,
        submittedAt: attempt.submittedAt,
        message: "Your submission has been securely stored. Results will be released by the instructor."
      });
    }


    const diagnosticReview = attempt.answers.map((ans) => ({
      questionId: ans.questionId,
      questionText: ans.question.question,
      isCorrect: ans.isCorrect,
      options: ans.question.options.map((opt) => ({
        id: opt.id,
        optionText: opt.optionText,
        isCorrect: opt.isCorrect, 
        wasSelected: ans.selectedOptions.some((so) => so.optionId === opt.id)
      }))
    }));

    return res.json({
      showResultsImmediately: true,
      examTitle: attempt.exam.title,
      score: attempt.score,
      percentage: attempt.percentage,
      passed: attempt.passed,
      passMark: attempt.exam.passMark,
      submittedAt: attempt.submittedAt,
      breakdown: diagnosticReview
    });
  } catch (error) {
    console.error("Fetch Metric Review Details Failure:", error);
    return res.status(500).json({ message: "Server encountered errors parsing metrics payload sheets." });
  }
};


export const getExamGroups = async (req: Request, res: Response) => {
  try {
    const { examId } = req.params;
    const examGroups = await prisma.examGroup.findMany({
      where: { examId: examId as string },
      include: { group: true },
    });

    return res.json(examGroups.map((eg) => eg.group));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const assignGroupToExam = async (req: Request, res: Response) => {
  try {
    const { examId } = req.params;
    const { groupId } = req.body;

    const existing = await prisma.examGroup.findUnique({
      where: {
        examId_groupId: { examId: examId as string, groupId },
      },
    });

    if (existing) {
      return res.status(400).json({ message: "Group already assigned" });
    }

    const assignment = await prisma.examGroup.create({
      data: { examId: examId as string, groupId },
    });

    return res.status(201).json(assignment);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
};



