import { useEffect, useState } from "react";

import { useParams } from "react-router-dom";

export default function AnswerSheet() {
  const { attemptId } = useParams();

  const [attempt, setAttempt] = useState<any>(null);

  useEffect(() => {
    fetch(`http://localhost:5000/api/results/attempt/${attemptId}`)
      .then((r) => r.json())
      .then(setAttempt);
  }, []);

  if (!attempt) return <div>Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">{attempt.student.name}</h1>

      {attempt.answers.map((answer: any) => (
        <div
          key={answer.id}
          className="
              bg-white
              border
              rounded-xl
              p-5
              mb-5
            "
        >
          <h2 className="font-bold mb-3">{answer.question.question}</h2>

          {answer.question.options.map((option: any) => (
            <div key={option.id}>
              <span>{option.optionText}</span>

              {option.isCorrect && " ✓"}

              {answer.selectedOptions.some(
                (s: any) => s.optionId === option.id,
              ) && " (Selected)"}
            </div>
          ))}

          <div
            className={`mt-3 font-semibold ${
              answer.isCorrect ? "text-green-600" : "text-red-600"
            }`}
          >
            {answer.isCorrect ? "Correct" : "Incorrect"}
          </div>
        </div>
      ))}
    </div>
  );
}
