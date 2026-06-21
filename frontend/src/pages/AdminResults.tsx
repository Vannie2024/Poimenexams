import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import MetricCard from "../components/MetricCard";
import Sidebar from "@/components/Sidebar";
import { API_URL } from "@/config";

export const AdminResults = () => {
  const { examId } = useParams();
  const [data, setData] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!examId) return;
    fetch(`${API_URL}/api/analytics/${examId}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched data:", data);
        setData(data);
      })
      .catch((err) => console.error("Fetch error:", err));
  }, [examId]);

  if (!data) {
    return (
      <div className="dashboard-bg results-page">
        <Sidebar />
        <main className="results-main">
          <div className="results-main-inner">
            <p
              className="text-sm font-semibold"
              style={{ color: "var(--olive-dark)" }}
            >
              Loading…
            </p>
          </div>
        </main>
      </div>
    );
  }

  console.log(
    "MEMBER KEYS",
    data.members.map((m: any) => m.attemptId),
  );
  console.log(
    "QUESTION KEYS",
    data.questionStats.map((q: any) => q.id),
  );

  return (
    <div className="dashboard-bg results-page">
      <Sidebar />

      <main className="results-main">
        <div className="results-main-inner">
          <button
            onClick={() => navigate("/admin-results")}
            className="results-back-link"
          >
            <ChevronLeft size={15} /> Back to Results
          </button>

          <div className="results-header">
            <p className="exam-detail-kicker">Exam Analytics</p>
            <h1 className="results-title">{data.title}</h1>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-10">
            <MetricCard title="Average Score" value={`${data.averageScore}%`} />
            <MetricCard title="Attempts" value={data.totalAttempts} />
            <MetricCard title="Passes" value={data.passCount} />
            <MetricCard title="Pass Rate" value={`${data.passRate}%`} />
          </div>

          <div className="results-table-card mb-10">
            <table className="results-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Score</th>
                  <th>Status</th>
                  <th>Answer Sheet</th>
                </tr>
              </thead>
              <tbody>
                {(data?.members || []).map((m: any) => (
                  <tr key={m.attemptId}>
                    <td>{m.name}</td>
                    <td className="font-semibold">{m.percentage}%</td>
                    <td>
                      <span
                        className={`status-pill ${
                          m.passed
                            ? "status-pill--passed"
                            : "status-pill--failed"
                        }`}
                      >
                        {m.passed ? "Passed" : "Failed"}
                      </span>
                    </td>
                    <td>
                      <button
                        className="answer-sheet-btn"
                        onClick={() => navigate(`/answer-sheet/${m.attemptId}`)}
                      >
                        View Answer Sheet
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {(data?.members || []).length === 0 && (
              <div className="results-empty" style={{ border: "none" }}>
                <p>No attempts submitted yet.</p>
              </div>
            )}
          </div>

          <h2 className="qstat-section-title">Question Analysis</h2>

          {(data.questionStats || []).map((q: any) => (
            <div key={q.id} className="qstat-card">
              <p className="qstat-question">{q.question}</p>

              <div className="qstat-meta">
                <span
                  className={`qstat-pill ${
                    q.correctRate >= 60
                      ? "qstat-pill--rate-good"
                      : "qstat-pill--rate-bad"
                  }`}
                >
                  {q.correctRate}% correct
                </span>
                <span className="qstat-pill qstat-pill--difficulty">
                  {q.difficulty}
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};
