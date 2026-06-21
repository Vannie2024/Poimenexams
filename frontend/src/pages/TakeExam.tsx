import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Send,
  CheckCircle2,
} from "lucide-react";

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
    const fetchExamData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");

        if (!user.id) {
          throw new Error("No authenticated student identity discovered.");
        }

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

    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f1e8]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#8f895f] border-t-transparent" />
      </div>
    );
  }

  if (!exam) return null;

  const currentQuestion = exam.questions[currentQuestionIndex];
  const totalQuestions = exam.questions.length;
  const answeredCount = Object.keys(selectedAnswers).length;
  const progressPercentage = Math.round((answeredCount / totalQuestions) * 100);

  return (
    <div className="dashboard-bg min-h-screen text-[#302f24]">
      <header className="sticky top-0 z-40 border-b border-[#ded5c4] bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8f895f]">
              POIMEN EXAMINATION
            </p>

            <h1 className="mt-1 text-3xl font-semibold leading-tight">
              {exam.title}
            </h1>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-sm font-semibold text-[#605a39]">
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </p>

              <p className="text-sm text-[#8f895f]">{answeredCount} answered</p>
            </div>

            <div
              className={`flex items-center gap-2 rounded-full px-5 py-3 text-base font-semibold shadow-sm ring-1 ${
                timeLeft < 300
                  ? "bg-red-100 text-red-600 ring-red-200 animate-pulse"
                  : "bg-[#f6f1e8] text-[#302f24] ring-[#ded5c4]"
              }`}
            >
              <Clock size={18} />
              <span className="font-mono">{formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>

        <div className="h-2 bg-[#e7dfd1]">
          <div
            className="h-full bg-[#8f895f] transition-all"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-8 py-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
          <section
            className="
            rounded-3xl
            bg-white
            p-10
            border
            border-[#E5DDCC]
            shadow-[0_25px_80px_rgba(0,0,0,0.08)]
            "
          >
            <div className="mb-8 border-b border-[#eee7dc] pb-7">
              <span className="inline-flex rounded-full bg-[#f0eadf] px-4 py-2 text-sm font-semibold text-[#8f895f]">
                Question {currentQuestionIndex + 1}
              </span>

              <h2 className="mt-5 max-w-4xl text-3xl font-semibold leading-snug">
                {currentQuestion?.question}
              </h2>
            </div>

            <div className="space-y-4">
              {currentQuestion?.options.map((option, index) => {
                const isSelected =
                  selectedAnswers[currentQuestion.id] === option.id;

                const optionLetter = String.fromCharCode(65 + index);

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
                    className={`flex w-full items-center gap-5 rounded-2xl border px-6 py-5 text-left transition ${
                      isSelected
                        ? "border-[#8f895f] bg-[#f0eadf] shadow-sm ring-2 ring-[#8f895f]/15"
                        : "border-[#e4dccf] bg-[#fbf9f4] hover:border-[#8f895f] hover:bg-[#f6f1e8]"
                    }`}
                  >
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-base font-semibold ${
                        isSelected
                          ? "bg-[#8f895f] text-white"
                          : "bg-white text-[#8f895f] ring-1 ring-[#ded5c4]"
                      }`}
                    >
                      {optionLetter}
                    </div>

                    <span className="flex-1 text-lg font-medium leading-relaxed">
                      {option.optionText}
                    </span>

                    <div
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                        isSelected
                          ? "border-[#8f895f] bg-[#8f895f]"
                          : "border-[#cfc6b7] bg-white"
                      }`}
                    >
                      {isSelected && <CheckCircle2 size={15} color="white" />}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-9 flex items-center justify-between border-t border-[#eee7dc] pt-7">
              <button
                type="button"
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                className="inline-flex items-center gap-2 rounded-xl border border-[#ded5c4] bg-white px-5 py-3 text-sm font-semibold transition hover:bg-[#f6f1e8] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={17} />
                Previous
              </button>

              {currentQuestionIndex < totalQuestions - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#302f24] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#5f5d3d]"
                >
                  Next
                  <ChevronRight size={17} />
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
                  className="inline-flex items-center gap-2 rounded-xl bg-[#8f895f] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#5f5d3d] disabled:opacity-50"
                >
                  <Send size={17} />
                  {isSubmitting ? "Submitting..." : "Finish and Submit"}
                </button>
              )}
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-3xl bg-white p-6 shadow-[0_18px_40px_rgba(48,47,36,0.08)]">
              <h3 className="text-base font-semibold">Navigation</h3>

              <p className="mt-1 text-sm text-[#8f895f]">
                Jump to any question
              </p>

              <div className="mt-5 grid grid-cols-5 gap-3">
                {exam.questions.map((q, idx) => {
                  const isAnswered = !!selectedAnswers[q.id];
                  const isCurrent = idx === currentQuestionIndex;

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={`flex h-12 w-12 items-center justify-center rounded-xl text-base font-semibold transition ${
                        isCurrent
                          ? "bg-[#302f24] text-white"
                          : isAnswered
                            ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border border-[#ded5c4] bg-[#f6f3ee] text-[#8f895f] hover:bg-[#eee7dc]"
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 space-y-3 border-t border-[#eee7dc] pt-5">
                <div className="flex items-center gap-3 text-sm text-[#7c7656]">
                  <div className="h-3.5 w-3.5 rounded bg-[#302f24]" />
                  Current
                </div>

                <div className="flex items-center gap-3 text-sm text-[#7c7656]">
                  <div className="h-3.5 w-3.5 rounded bg-emerald-400" />
                  Answered
                </div>

                <div className="flex items-center gap-3 text-sm text-[#7c7656]">
                  <div className="h-3.5 w-3.5 rounded border border-[#ded5c4] bg-[#f6f3ee]" />
                  Unanswered
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-[#5f5d3d] p-6 text-white shadow-[0_18px_40px_rgba(48,47,36,0.12)]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
                Progress
              </p>

              <p className="mt-3 text-4xl font-semibold">
                {progressPercentage}%
              </p>

              <p className="mt-2 text-sm text-white/70">
                {answeredCount} of {totalQuestions} questions answered
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};
