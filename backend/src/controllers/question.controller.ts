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

export const importQuestionsFromExcel = async (req: Request & { file?: Express.Multer.File }, res: Response) => {
  try {
    const examIdParam = String(req.params.examId);

    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ message: "No authentic workbook file attached." });
    }

    console.log("Original name:", req.file.originalname);
    console.log("Mime type:", req.file.mimetype);
    console.log("Size:", req.file.size);
    console.log(
      "First 8 bytes (hex):",
      req.file.buffer.slice(0, 8).toString("hex")
    );

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    
    const rows: any[] = XLSX.utils.sheet_to_json(sheet);

    if (rows.length === 0) {
      return res.status(400).json({ message: "The sheet is empty or lacks formatted headers." });
    }

    let importedCounter = 0;


    for (const row of rows) {
      let rawQuestionText = "";
      let rawType = "SINGLE_CHOICE";
      let rawDifficulty = "MEDIUM";
      let correctValue = "";
      const optionsList: string[] = [];


      Object.keys(row).forEach((key) => {
        const cleanKey = key.replace(/[\r\n]+/g, "").replace(/\s+/g, "").toLowerCase();
        const val = row[key];

        if (cleanKey === "question") {
          rawQuestionText = String(val);
        } else if (cleanKey === "type") {
          rawType = String(val).toUpperCase().trim().replace(" ", "_");
        } else if (cleanKey === "difficulty") {
          rawDifficulty = String(val).toUpperCase().trim();
        } else if (cleanKey === "correctanswer" || cleanKey === "answer") {
          correctValue = String(val).trim().toLowerCase();
        } else if (cleanKey.startsWith("option") && val) {
          const cleanOption = String(val).trim();
          if (cleanOption) optionsList.push(cleanOption);
        }
      });


      if (!rawQuestionText.trim()) continue;


      let validatedType: "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "TRUE_FALSE" = "SINGLE_CHOICE";
      if (rawType.includes("MULTIPLE")) validatedType = "MULTIPLE_CHOICE";
      if (rawType.includes("TRUE") || rawType.includes("FALSE")) validatedType = "TRUE_FALSE";

      let validatedDifficulty: "EASY" | "MEDIUM" | "HARD" | "EXPERT" = "MEDIUM";
      if (["EASY", "MEDIUM", "HARD", "EXPERT"].includes(rawDifficulty)) {
        validatedDifficulty = rawDifficulty as any;
      }

      await prisma.question.create({
        data: {
          question: rawQuestionText.trim(),
          type: validatedType,
          difficulty: validatedDifficulty,
          examId: examIdParam,
          options: {
            create: optionsList.map((optText) => ({
              optionText: optText,
              isCorrect: optText.toLowerCase() === correctValue
            }))
          }
        }
      });

      importedCounter++;
    }

    return res.status(200).json({ 
      success: true, 
      count: importedCounter, 
      message: "Excel data successfully parsed and imported." 
    });

  } catch (error: any) {
    console.error("Critical Runtime System Error Details:", error);
    return res.status(500).json({ 
      message: "Internal server compilation error.",
      details: error?.message || String(error)
    });
  }
};