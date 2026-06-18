import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { UserRole } from "@prisma/client";

export const getUsers = async (
  req: Request,
  res: Response
) => {
  try {
    const users =
      await prisma.user.findMany({
        orderBy: {
          createdAt: "desc",
        },
      });

    return res.json(users);
  } catch {
    return res.status(500).json({
      message: "Server Error",
    });
  }
};

export const createUser = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      name,
      email,
      username,
      password,
    } = req.body;

    const user =
      await prisma.user.create({
        data: {
          name,
          email,
          username,
          password,
          role: UserRole.STUDENT,
        },
      });

    return res.status(201).json(user);
  } catch {
    return res.status(500).json({
      message: "Server Error",
    });
  }
};

export const updateUser = async (
  req: Request,
  res: Response
) => {
  try {
    const id = String(req.params.id);

    const {
      name,
      email,
      role,
    } = req.body;

    const user = await prisma.user.update({
      where: {
        id,
      },
      data: {
        name,
        email,
        role,
      },
    });

    return res.json(user);
  } catch {
    return res.status(500).json({
      message: "Server Error",
    });
  }
};

export const deleteUser = async (
  req: Request,
  res: Response
) => {
  try {
    const id = String(req.params.id);

    await prisma.user.delete({
      where: {
        id,
      },
    });

    return res.json({
      message: "User deleted",
    });
  } catch {
    return res.status(500).json({
      message: "Server Error",
    });
  }
};