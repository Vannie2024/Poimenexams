import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CheckCircle2, XCircle } from "lucide-react";

export default function AnswerSheet() {
  const { attemptId } = useParams();

  const [attempt, setAttempt] = useState<any>(null);

  useEffect(() => {
    fetch(`http://localhost:5000/api/results/attempt/${attemptId}`)
      .then((r) => r.json())
      .then(setAttempt);
  }, []);

  if (!attempt) {
    return <div className="answersheet-loading">Loading...</div>;
  }

  return (
    <div className="answersheet-page">
      <div className="answersheet-inner">
        <p className="answersheet-kicker">Answer Sheet</p>
        <h1 className="answersheet-title">{attempt.student.name}</h1>

        {attempt.answers.map((answer: any, index: number) => (
          <div key={answer.id} className="answersheet-question-card">
            <div className="answersheet-question-top">
              <p className="answersheet-question-text">
                {index + 1}. {answer.question.question}
              </p>

              <span
                className={`status-pill ${
                  answer.isCorrect
                    ? "status-pill--passed"
                    : "status-pill--failed"
                }`}
              >
                {answer.isCorrect ? (
                  <>
                    <CheckCircle2 size={12} />
                    Correct
                  </>
                ) : (
                  <>
                    <XCircle size={12} />
                    Incorrect
                  </>
                )}
              </span>
            </div>

            <div className="answersheet-options">
              {answer.question.options.map((option: any) => {
                const isSelected = answer.selectedOptions.some(
                  (s: any) => s.optionId === option.id,
                );

                return (
                  <div
                    key={option.id}
                    className={`option-row ${
                      option.isCorrect ? "option-row--correct" : ""
                    } ${
                      isSelected && option.isCorrect
                        ? "option-row--selected"
                        : ""
                    } ${
                      isSelected && !option.isCorrect ? "option-row--wrong" : ""
                    }`}
                  >
                    <span>{option.optionText}</span>

                    <div className="answersheet-badges">
                      {isSelected && (
                        <span
                          className={`option-selected-badge ${
                            !option.isCorrect
                              ? "option-selected-badge--wrong"
                              : ""
                          }`}
                        >
                          Your Answer
                        </span>
                      )}

                      {option.isCorrect && (
                        <span className="option-correct-badge">Correct</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
