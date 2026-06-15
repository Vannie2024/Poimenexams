import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";

const router = Router();

function generatePassword() {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  let password = "PXM-";

  for (let i = 0; i < 6; i++) {
    password += chars.charAt(
      Math.floor(Math.random() * chars.length)
    );
  }

  return password;
}

function generateUsername(name: string) {
  const cleaned = name
    .toLowerCase()
    .replace(/\s+/g, "");

  return (
    cleaned +
    Math.floor(Math.random() * 1000)
  );
}

router.post("/", async (req, res) => {
  try {
    const { name, email, role } = req.body;

    const username =
      generateUsername(name);

    const plainPassword =
      generatePassword();

    const hashedPassword =
      await bcrypt.hash(
        plainPassword,
        10
      );

    const user =
      await prisma.user.create({
        data: {
          name,
          email,
          username,
          password: hashedPassword,
          role,
        },
      });

    res.status(201).json({
      id: user.id,
      username,
      password: plainPassword,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        "Failed to create member",
    });
  }
});

export default router;