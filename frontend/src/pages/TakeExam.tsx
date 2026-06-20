import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Clock, ChevronLeft, ChevronRight, Send } from "lucide-react";

interface Option {
  id: string;
  optionText: string; // Updated to match Prisma schema
}

interface Question {
  id: string;
  question: string; // Updated to match Prisma schema
  options: Option[];
}

interface ExamDetails {
  id: string;
  title: string;
  duration: number; // in minutes
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
    const fetchExamData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (!user.id)
          throw new Error("No authenticated student identity discovered.");

        const response = await fetch(
          `http://localhost:5000/api/exams/${examId}/attempt?studentId=${user.id}`,
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
        alert(err.message || "Error loading exam data.");
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

        const response = await fetch(
          `http://localhost:5000/api/exams/${examId}/submit`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              answers: answersToSubmit,
              studentId: user.id,
            }),
          },
        );

        const result = await response.json();
        if (response.ok) {
          alert(
            `Exam submitted successfully! ${result.passed !== undefined ? `Result: ${result.passed ? "PASS" : "FAIL"} (${Math.round(result.percentage)}%)` : ""}`,
          );
          navigate("/student-dashboard");
        } else {
          alert(result.message || "Submission failure.");
        }
      } catch (err) {
        console.error(err);
        alert("Network exception processing your scorecard.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [examId, navigate, isSubmitting],
  );

  useEffect(() => {
    if (loading || !exam) return;

    if (timeLeft <= 0) {
      alert("Time has expired! Submitting your work automatically.");
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
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!exam) return null;

  const currentQuestion = exam.questions[currentQuestionIndex];
  const totalQuestions = exam.questions.length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 px-6 py-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">{exam.title}</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </p>
          </div>
          <div
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-mono font-bold tracking-wider ${
              timeLeft < 300
                ? "bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400 animate-pulse"
                : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
            }`}
          >
            <Clock size={16} />
            {formatTime(timeLeft)}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <span className="inline-flex items-center rounded-md bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                Question {currentQuestionIndex + 1}
              </span>
              <h2 className="mt-4 text-lg font-medium leading-relaxed">
                {currentQuestion?.question}{" "}
              </h2>

              <div className="mt-8 space-y-3">
                {currentQuestion?.options.map((option) => {
                  const isSelected =
                    selectedAnswers[currentQuestion.id] === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() =>
                        setSelectedAnswers((prev) => ({
                          ...prev,
                          [currentQuestion.id]: option.id,
                        }))
                      }
                      className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition-all duration-150 ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-50/50 text-indigo-900 dark:border-indigo-500 dark:bg-indigo-950/20 dark:text-indigo-300 ring-2 ring-indigo-600/10"
                          : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-slate-700 dark:hover:bg-slate-800"
                      }`}
                    >
                      <span className="text-sm font-medium">
                        {option.optionText}
                      </span>{" "}
                      <div
                        className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                          isSelected
                            ? "border-indigo-600 bg-indigo-600 dark:border-indigo-500 dark:bg-indigo-500"
                            : "border-slate-300 dark:border-slate-600"
                        }`}
                      >
                        {isSelected && (
                          <div className="h-1.5 w-1.5 rounded-full bg-white" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6 dark:border-slate-800">
                <button
                  type="button"
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium transition hover:bg-slate-50 disabled:opacity-40 dark:border-slate-800 dark:hover:bg-slate-800"
                >
                  <ChevronLeft size={16} /> Previous
                </button>

                {currentQuestionIndex < totalQuestions - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-950 dark:hover:bg-slate-100"
                  >
                    Next <ChevronRight size={16} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (
                        window.confirm(
                          "Are you sure you want to finish your test and lock in responses?",
                        )
                      )
                        handleSubmitExam();
                    }}
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 disabled:opacity-50"
                  >
                    <Send size={16} />{" "}
                    {isSubmitting ? "Submitting..." : "Finish and Submit"}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                Navigation Grid
              </h3>
              <div className="mt-4 grid grid-cols-5 gap-2">
                {exam.questions.map((q, idx) => {
                  const isAnswered = !selectedAnswers[q.id];
                  const isCurrent = idx === currentQuestionIndex;

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-semibold transition-all ${
                        isCurrent
                          ? "bg-indigo-600 text-white ring-4 ring-indigo-600/10 dark:bg-indigo-500"
                          : isAnswered
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 border-t border-slate-100 pt-4 space-y-2 dark:border-slate-800">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <div className="h-3 w-3 rounded bg-emerald-400" /> Answered
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <div className="h-3 w-3 rounded bg-slate-200 dark:bg-slate-700" />{" "}
                  Unanswered
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
