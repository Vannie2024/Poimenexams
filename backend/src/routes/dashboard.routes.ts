import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

router.get("/", async (_, res) => {
  try {
    const [
      memberCount,
      examCount,
      groupCount,
      averageScore,
      latestUsers,
      latestExams,
    ] = await Promise.all([
      prisma.user.count({
        where: {
          role: "STUDENT",
        },
      }),

      prisma.exam.count(),

      prisma.group.count(),

      prisma.examAttempt.aggregate({
        _avg: {
          score: true,
        },
      }),

      prisma.user.findMany({
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      }),

      prisma.exam.findMany({
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
        include: {
          creator: true,
        },
      }),
    ]);

    const activity = [
      ...latestUsers.map((user) => ({
        type: "member",
        message: `${user.name} joined the system`,
        date: user.createdAt,
      })),

      ...latestExams.map((exam) => ({
        type: "exam",
        message: `${exam.creator.name} created ${exam.title}`,
        date: exam.createdAt,
      })),
    ]
      .sort(
        (a, b) =>
          b.date.getTime() -
          a.date.getTime()
      )
      .slice(0, 10);

    res.json({
      stats: {
        members: memberCount,
        exams: examCount,
        groups: groupCount,
        averageScore:
          Math.round(
            averageScore._avg.score ?? 0
          ),
      },

      recentActivity: activity,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to load dashboard",
    });
  }
});

export default router;