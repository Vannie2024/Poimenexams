import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export const getQuestionsByExam = async (
  req: Request,
  res: Response
) => {
  try {
    const examId = String(req.params.examId);

    const questions =
      await prisma.question.findMany({
        where: {
          examId,
        },
        include: {
          options: true,
        },
      });

    return res.json(questions);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server Error",
    });
  }
};

export const createQuestion = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      examId,
      question,
      type,
      difficulty,
      options,
    } = req.body;

    const newQuestion =
      await prisma.question.create({
        data: {
          examId,
          question,
          type,
          difficulty,

          options: {
            create: options,
          },
        },
        include: {
          options: true,
        },
      });

    return res.status(201).json(
      newQuestion
    );
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server Error",
    });
  }
};

export const deleteQuestion = async (
  req: Request,
  res: Response
) => {
  try {
    const id = String(req.params.id);

    await prisma.questionOption.deleteMany({
      where: {
        questionId: id,
      },
    });

    await prisma.question.delete({
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