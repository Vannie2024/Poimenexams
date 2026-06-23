import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Send, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import { API_URL } from "@/config";

interface Option {
  id: string;
  optionText: string;
}

interface Question {
  id: string;
  question: string;
  options: Option[];
}

interface ExamDetails {
  id: string;
  title: string;
  duration: number;
  questions: Question[];
}

export const TakeExam: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();

  const [exam, setExam] = useState<ExamDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);

  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, string>
  >({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const answersRef = useRef(selectedAnswers);

  useEffect(() => {
    answersRef.current = selectedAnswers;
  }, [selectedAnswers]);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap";
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  useEffect(() => {
    const fetchExamData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");

        if (!user.id) {
          throw new Error("No authenticated student identity discovered.");
        }

        const response = await fetch(
          `${API_URL}/api/exams/${examId}/attempt?studentId=${user.id}`,
        );

        if (!response.ok) {
          const errData = await response.json();

          throw new Error(
            errData.message || "Failed to load exam layout mapping.",
          );
        }

        const data: ExamDetails = await response.json();
        setExam(data);
        setTimeLeft(data.duration * 60);
      } catch (err: any) {
        console.error(err);
        toast(err.message || "Error loading exam data.");
        navigate("/student-dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchExamData();
  }, [examId, navigate]);

  const handleSubmitExam = useCallback(
    async (forcedAnswers?: Record<string, string>) => {
      if (isSubmitting) return;

      setIsSubmitting(true);

      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const answersToSubmit = forcedAnswers || answersRef.current;

        const response = await fetch(`${API_URL}/api/exams/${examId}/submit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            answers: answersToSubmit,
            studentId: user.id,
          }),
        });

        const result = await response.json();

        if (response.ok) {
          toast(
            `Exam submitted successfully! ${
              result.passed !== undefined
                ? `Result: ${result.passed ? "PASS" : "FAIL"} (${Math.round(
                    result.percentage,
                  )}%)`
                : ""
            }`,
          );

          navigate("/student-dashboard");
        } else {
          toast(result.message || "Submission failure.");
        }
      } catch (err) {
        console.error(err);
        toast("Network exception processing your scorecard.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [examId, navigate, isSubmitting],
  );

  useEffect(() => {
    if (loading || !exam) return;

    if (timeLeft <= 0) {
      toast("Time has expired! Submitting your work automatically.");
      handleSubmitExam(answersRef.current);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, loading, exam, handleSubmitExam]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#14130E]"
        style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
      >
        <div className="h-10 w-10 rounded-full border-2 border-[#3A3C2F] border-t-[#BD9650] motion-safe:animate-spin" />
        <p className="text-xs uppercase tracking-[0.2em] text-[#8C8A6C]">
          Preparing your examination
        </p>
      </div>
    );
  }

  if (!exam) return null;

  const currentQuestion = exam.questions[currentQuestionIndex];
  const totalQuestions = exam.questions.length;
  const answeredCount = Object.keys(selectedAnswers).length;
  const progressPercentage = Math.round(
    (answeredCount / Math.max(totalQuestions, 1)) * 100,
  );
  const isUrgent = timeLeft < 300;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  return (
    <div className="exam-page">
      <header className="exam-header">
        <div className="exam-header-inner">
          <div>
            <p className="exam-kicker">Poimen Examination</p>
            <h1 className="exam-title">{exam.title}</h1>
          </div>

          <div className="exam-header-meta">
            <div className="exam-question-count">
              <p>
                Question {currentQuestionIndex + 1} <span>of</span>{" "}
                {totalQuestions}
              </p>
              <p className="exam-answered-small">{answeredCount} answered</p>
            </div>

            <div className={`exam-timer ${isUrgent ? "urgent" : ""}`}>
              <strong>{formatTime(timeLeft)}</strong>
              <span>left</span>
            </div>
          </div>
        </div>

        <div className="exam-progress-bar">
          <div
            className="exam-progress-fill"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </header>

      <main className="exam-main">
        <div className="exam-frame">
          <section className="exam-question-panel">
            <span className="exam-big-number">
              {String(currentQuestionIndex + 1).padStart(2, "0")}
            </span>

            <div className="exam-question-head">
              <span className="exam-pill">
                Question {String(currentQuestionIndex + 1).padStart(2, "0")} of{" "}
                {String(totalQuestions).padStart(2, "0")}
              </span>

              <h2 className="exam-question-text">
                {currentQuestion?.question}
              </h2>
            </div>

            <div className="exam-options">
              {currentQuestion?.options.map((option, index) => {
                const isSelected =
                  selectedAnswers[currentQuestion.id] === option.id;
                const optionLetter = String.fromCharCode(65 + index);

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() =>
                      setSelectedAnswers((prev) => {
                        // If option is clicked again, drop key reference to deselect answer fully
                        if (prev[currentQuestion.id] === option.id) {
                          const cleanedState = { ...prev };
                          delete cleanedState[currentQuestion.id];
                          return cleanedState;
                        }
                        return {
                          ...prev,
                          [currentQuestion.id]: option.id,
                        };
                      })
                    }
                    className={`exam-option ${isSelected ? "selected" : ""}`}
                  >
                    <span className="exam-option-letter">{optionLetter}</span>
                    <span className="exam-option-text">
                      {option.optionText}
                    </span>
                    {isSelected && (
                      <CheckCircle2 size={20} className="text-[#BD9650]" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="exam-footer">
              <button
                type="button"
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                className="exam-nav-btn"
              >
                <ChevronLeft size={16} />
                Previous
              </button>

              {!isLastQuestion ? (
                <button
                  type="button"
                  onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                  className="exam-nav-btn exam-next-btn"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (
                      window.confirm(
                        "Are you sure you want to finish your test and lock in responses?",
                      )
                    ) {
                      handleSubmitExam();
                    }
                  }}
                  disabled={isSubmitting}
                  className="exam-nav-btn exam-submit-btn"
                >
                  <Send size={16} />
                  {isSubmitting ? "Submitting..." : "Finish and submit"}
                </button>
              )}
            </div>
          </section>

          <aside className="exam-ledger">
            <p className="exam-ledger-kicker">The ledger</p>
            <h3 className="exam-ledger-title">Jump to a question</h3>

            <div className="exam-grid">
              {exam.questions.map((q, idx) => {
                const isAnswered = !!selectedAnswers[q.id];
                const isCurrent = idx === currentQuestionIndex;

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`exam-grid-btn ${
                      isCurrent ? "current" : isAnswered ? "answered" : ""
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="exam-legend">
              <div className="exam-legend-row">
                <span className="exam-dot current" />
                Current question
              </div>
              <div className="exam-legend-row">
                <span className="exam-dot answered" />
                Answered
              </div>
              <div className="exam-legend-row">
                <span className="exam-dot unanswered" />
                Unanswered
              </div>
            </div>

            <div className="exam-progress-card">
              <div
                className="exam-progress-circle"
                style={{
                  background: `conic-gradient(#BD9650 ${progressPercentage}%, #2B2D22 0)`,
                }}
              >
                <div className="exam-progress-circle-inner">
                  <span className="exam-progress-percent">
                    {progressPercentage}%
                  </span>
                  <span className="exam-progress-label">complete</span>
                </div>
              </div>

              <p className="exam-progress-copy">
                {answeredCount} of {totalQuestions} questions answered
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};
