import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, ChevronLeft, Award, EyeOff } from "lucide-react";

export const ExamResults: React.FC = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const response = await fetch(
          `/api/exams/attempt/${attemptId}?studentId=${user.id}`,
        );

        if (!response.ok) throw new Error("Failed to pull evaluation metrics.");
        const json = await response.json();
        setData(json);
      } catch (err) {
        console.error(err);
        alert("Error mapping review sheet arrays.");
        navigate("/student-dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [attemptId, navigate]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Back Navigation Bar Control */}
        <button
          onClick={() => navigate("/student-dashboard")}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition"
        >
          <ChevronLeft size={16} /> Return to Dashboard
        </button>

        {/* CONDITION A: EXAM RESTRICTS INSTANT FEEDBACK */}
        {!data.showResultsImmediately ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm space-y-4">
            <EyeOff className="mx-auto text-slate-400" size={48} />
            <h1 className="text-2xl font-bold tracking-tight">
              {data.examTitle}
            </h1>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              {data.message}
            </p>
          </div>
        ) : (
          /* CONDITION B: INSTANT INSIGHT DISPLAY GRADE SHEET */
          <>
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-1 text-center md:text-left">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Assessment Scorecard
                </span>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                  {data.examTitle}
                </h1>
                <p className="text-xs text-slate-500">
                  Evaluated on {new Date(data.submittedAt).toLocaleString()}
                </p>
              </div>

              <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-8">
                <div className="text-center">
                  <p className="text-4xl font-black font-mono tracking-tight text-indigo-600">
                    {Math.round(data.percentage)}%
                  </p>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-1">
                    Score: {data.score} pts
                  </p>
                </div>

                <div
                  className={`inline-flex flex-col items-center px-4 py-2.5 rounded-xl border text-center ${
                    data.passed
                      ? "bg-emerald-50/50 border-emerald-200 text-emerald-800"
                      : "bg-rose-50/50 border-rose-200 text-rose-800"
                  }`}
                >
                  <Award
                    size={20}
                    className={
                      data.passed ? "text-emerald-600" : "text-rose-600"
                    }
                  />
                  <span className="text-xs font-black uppercase tracking-wider mt-1">
                    {data.passed ? "Passed" : "Failed"}
                  </span>
                </div>
              </div>
            </div>

            {/* Itemized Diagnostic Checklist Breakdown */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold tracking-tight text-slate-900">
                Review Breakdown
              </h3>

              {data.breakdown?.map((item: any, idx: number) => (
                <div
                  key={item.questionId}
                  className={`rounded-xl border bg-white p-6 shadow-sm space-y-4 border-l-4 ${
                    item.isCorrect
                      ? "border-l-emerald-500"
                      : "border-l-rose-500"
                  }`}
                >
                  <div className="flex items-start gap-3 justify-between">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-400">
                        Item Number {idx + 1}
                      </span>
                      <h4 className="text-base font-medium leading-relaxed text-slate-900">
                        {item.questionText}
                      </h4>
                    </div>
                    {item.isCorrect ? (
                      <CheckCircle
                        className="text-emerald-500 shrink-0"
                        size={20}
                      />
                    ) : (
                      <XCircle className="text-rose-500 shrink-0" size={20} />
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-2 pt-2">
                    {item.options?.map((opt: any) => {
                      // Determine visual styling for post-test analysis
                      let badgeStyle =
                        "border-slate-200 text-slate-600 bg-slate-50";
                      if (opt.isCorrect) {
                        badgeStyle =
                          "border-emerald-500 bg-emerald-50/30 text-emerald-900 font-medium";
                      } else if (opt.wasSelected && !opt.isCorrect) {
                        badgeStyle =
                          "border-rose-300 bg-rose-50/40 text-rose-900 lines-through";
                      }

                      return (
                        <div
                          key={opt.id}
                          className={`flex items-center justify-between p-3 rounded-lg border text-sm ${badgeStyle}`}
                        >
                          <span>{opt.optionText}</span>
                          <span className="text-[10px] font-bold uppercase tracking-wider">
                            {opt.wasSelected &&
                              opt.isCorrect &&
                              "✓ Your Choice (Correct)"}
                            {opt.wasSelected &&
                              !opt.isCorrect &&
                              "✗ Your Choice (Wrong)"}
                            {!opt.wasSelected &&
                              opt.isCorrect &&
                              "Correct Answer"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
