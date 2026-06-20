import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";

export const login = async (
  req: Request,
  res: Response
) => {
  try {
    const { username, password } = req.body;

    console.log("USERNAME:", JSON.stringify(username));
    console.log("PASSWORD:", JSON.stringify(password));

    const allUsers = await prisma.user.findMany();
    console.log("ALL USERS:", allUsers);

    const user = await prisma.user.findUnique({
      where: {
        username,
      },
    });

    console.log("USER FOUND:", user);
        if (!user) {
          return res.status(401).json({
            message: "Invalid credentials",
          });
        }

    const validPassword = 
      password === user.password;

    if (!validPassword) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    console.log("PASSWORD MATCH:", validPassword);
    console.log("JWT_SECRET:", process.env.JWT_SECRET);

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing");
    }

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "7d",
      }
    );

    return res.json({
      token,
      id: user.id,
      role: user.role,
      name: user.name,
    });
  } catch {
    return res.status(500).json({
      message: "Server Error",
    });
  }
};