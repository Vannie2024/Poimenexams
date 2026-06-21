import { useState } from "react";
import { X } from "lucide-react";
import { API_URL } from "@/config";

interface Props {
  examId: string;
  onClose: () => void;
  onQuestionCreated: () => void;
}

export default function CreateQuestionModal({
  examId,
  onClose,
  onQuestionCreated,
}: Props) {
  const [question, setQuestion] = useState("");

  const [type, setType] = useState("SINGLE_CHOICE");

  const [difficulty, setDifficulty] = useState("EASY");

  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");

  const [correctAnswer, setCorrectAnswer] = useState("A");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    await fetch(`${API_URL}/api/questions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        examId,
        question,
        type,
        difficulty,

        options: [
          {
            optionText: optionA,
            isCorrect: correctAnswer === "A",
          },
          {
            optionText: optionB,
            isCorrect: correctAnswer === "B",
          },
          {
            optionText: optionC,
            isCorrect: correctAnswer === "C",
          },
          {
            optionText: optionD,
            isCorrect: correctAnswer === "D",
          },
        ],
      }),
    });

    onQuestionCreated();
    onClose();
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between mb-6">
          <h2 className="text-2xl font-bold">Add Question</h2>

          <button onClick={onClose}>
            <X />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <textarea
            className="modal-input"
            placeholder="Question text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <select
              className="modal-input"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="SINGLE_CHOICE">Single Choice</option>

              <option value="MULTIPLE_CHOICE">Multiple Choice</option>

              <option value="TRUE_FALSE">True / False</option>
            </select>

            <select
              className="modal-input"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option value="EASY">Easy</option>

              <option value="MEDIUM">Medium</option>

              <option value="HARD">Hard</option>

              <option value="EXPERT">Expert</option>
            </select>
          </div>

          <input
            className="modal-input"
            placeholder="Option A"
            value={optionA}
            onChange={(e) => setOptionA(e.target.value)}
          />

          <input
            className="modal-input"
            placeholder="Option B"
            value={optionB}
            onChange={(e) => setOptionB(e.target.value)}
          />

          <input
            className="modal-input"
            placeholder="Option C"
            value={optionC}
            onChange={(e) => setOptionC(e.target.value)}
          />

          <input
            className="modal-input"
            placeholder="Option D"
            value={optionD}
            onChange={(e) => setOptionD(e.target.value)}
          />

          <select
            className="modal-input"
            value={correctAnswer}
            onChange={(e) => setCorrectAnswer(e.target.value)}
          >
            <option value="A">Correct Answer: A</option>

            <option value="B">Correct Answer: B</option>

            <option value="C">Correct Answer: C</option>

            <option value="D">Correct Answer: D</option>
          </select>

          <button className="action-btn w-full" type="submit">
            Save Question
          </button>
        </form>
      </div>
    </div>
  );
}
