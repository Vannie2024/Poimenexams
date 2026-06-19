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