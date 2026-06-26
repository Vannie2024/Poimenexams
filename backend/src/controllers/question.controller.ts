import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import * as XLSX from "xlsx";

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

export const importQuestionsFromExcel = async (req: Request, res: Response) => {
  try {
    const examIdParam = String(req.params.examId);
    const { fileData } = req.body; 

    if (!fileData) {
      return res.status(400).json({ message: "No workbook data buffer provided." });
    }

    const buffer = Buffer.from(fileData, "base64");
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    
    const rows: any[] = XLSX.utils.sheet_to_json(sheet);

    if (rows.length === 0) {
      return res.status(400).json({ message: "The sheet is empty or lacks formatted headers." });
    }

    let importedCounter = 0;

    await prisma.$transaction(async (tx) => {
      for (const row of rows) {
        const rawQuestionText = row["Question"] || row["questionText"] || row["Question Text"] || row["question"];
        const rawType = String(row["Type"] || row["type"] || "SINGLE_CHOICE").toUpperCase().trim().replace(" ", "_");
        const rawDifficulty = String(row["Difficulty"] || row["difficulty"] || "MEDIUM").toUpperCase().trim();
        const correctValue = String(row["Correct Answer"] || row["correctAnswer"] || row["Answer"] || row["correctAnswerText"] || "").trim().toLowerCase();

        if (!rawQuestionText) continue; 

        let validatedType: "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "TRUE_FALSE" = "SINGLE_CHOICE";
        if (rawType === "MULTIPLE_CHOICE") validatedType = "MULTIPLE_CHOICE";
        if (rawType === "TRUE_FALSE" || rawType === "TRUE/FALSE") validatedType = "TRUE_FALSE";

        let validatedDifficulty: "EASY" | "MEDIUM" | "HARD" | "EXPERT" = "MEDIUM";
        if (["EASY", "MEDIUM", "HARD", "EXPERT"].includes(rawDifficulty)) {
          validatedDifficulty = rawDifficulty as any;
        }

        const optionsList: string[] = [];
        Object.keys(row).forEach((key) => {
          if (key.toLowerCase().startsWith("option") && row[key]) {
            const cleanOption = String(row[key]).trim();
            if (cleanOption) optionsList.push(cleanOption);
          }
        });

        const newQuestion = await tx.question.create({
          data: {
            question: String(rawQuestionText).trim(),
            type: validatedType,
            difficulty: validatedDifficulty,
            examId: examIdParam,
          },
        });

        if (optionsList.length > 0) {
          await tx.questionOption.createMany({
            data: optionsList.map((optText) => ({
              questionId: newQuestion.id,
              optionText: optText,
              isCorrect: optText.toLowerCase() === correctValue,
            })),
          });
        }

        importedCounter++;
      }
    });

    return res.status(200).json({ 
      success: true, 
      count: importedCounter, 
      message: "Excel questions successfully synchronized with database records." 
    });

  } catch (error) {
    console.error("Bulk Import Error Details:", error);
    return res.status(500).json({ 
      message: "Data validation error. Please verify your spreadsheet headers match the standard template." 
    });
  }
};