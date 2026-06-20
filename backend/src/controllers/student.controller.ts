import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export const getStudentExams = async (
  req: Request,
  res: Response,
) => {
  try {
    const studentId = String(
      req.params.studentId,
    );

    const memberships =
      await prisma.groupMember.findMany({
        where: {
          userId: studentId,
        },
      });

    const groupIds = memberships.map(
      (m) => m.groupId,
    );

    const examGroups = await prisma.examGroup.findMany({
      where: {
        groupId: {
          in: groupIds,
        },
      },
      include: {
        exam: {
          include: {
            attempts: {
              where: { studentId }
            }
          }
        },
      },
    });

    const exams = examGroups.map((eg) => ({
      id: eg.exam.id,
      title: eg.exam.title,
      description: eg.exam.description,
      duration: eg.exam.duration,
      passMark: eg.exam.passMark,
      maxAttempts: eg.exam.maxAttempts,
      attemptsUsed: eg.exam.attempts.length,
    }));

    return res.json(exams);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server Error",
    });
  }
};

export const getStudentHistory = async (
  req: Request,
  res: Response,
) => {
  try {
    const studentId = String(req.params.studentId);

    const history = await prisma.examAttempt.findMany({
      where: { studentId },
      include: {
        exam: {
          select: {
            title: true,
          },
        },
      },
      orderBy: { startedAt: "desc" },
    });

    return res.json(history);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server Error",
    });
  }
};