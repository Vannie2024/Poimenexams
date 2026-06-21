import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export const getAttemptDetails =
  async (
    req: Request,
    res: Response,
  ) => {
    try {
      const attemptId =
        String(req.params.attemptId);

      const attempt =
        await prisma.examAttempt.findUnique({
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