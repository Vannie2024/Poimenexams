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
        const questionText = row["Question"] || row["questionText"] || row["Question Text"];
        let type = row["Type"] || row["type"] || "SINGLE_CHOICE";
        let difficulty = row["Difficulty"] || row["difficulty"] || "MEDIUM";
        const correctValue = String(row["Correct Answer"] || row["correctAnswer"] || row["Answer"] || "").trim();

        if (!questionText) continue; 

        type = type.toUpperCase().replace(" ", "_");
        if (!["SINGLE_CHOICE", "MULTIPLE_CHOICE", "TRUE_FALSE"].includes(type)) {
          type = "SINGLE_CHOICE";
        }

        difficulty = difficulty.toUpperCase().trim();
        if (!["EASY", "MEDIUM", "HARD", "EXPERT"].includes(difficulty)) {
          difficulty = "MEDIUM";
        }

        const optionsList: string[] = [];
        Object.keys(row).forEach((key) => {
          if (key.toLowerCase().startsWith("option") && row[key]) {
            optionsList.push(String(row[key]).trim());
          }
        });

        const newQuestion = await tx.question.create({
          data: {
            question: questionText,
            type: type as any,
            difficulty: difficulty as any,
            examId: examIdParam, 
          },
        });

        for (const optText of optionsList) {
          await tx.questionOption.create({
            data: {
              questionId: newQuestion.id,
              optionText: optText,
              isCorrect: optText.toLowerCase() === correctValue.toLowerCase(),
            },
          });
        }

        importedCounter++;
      }
    });

    return res.status(200).json({ 
      success: true, 
      count: importedCounter, 
      message: "Excel data extraction and database sync completed successfully." 
    });

  } catch (error) {
    console.error("Bulk Import Fault Sequence Tracker:", error);
    return res.status(500).json({ message: "Internal server data compilation error." });
  }
};