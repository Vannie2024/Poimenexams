import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3 } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { API_URL } from "@/config";

export const AdminExamList = () => {
  const [exams, setExams] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_URL}/api/exams`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched exams:", data);
        setExams(data);
      });
  }, []);

  return (
    <div className="dashboard-bg results-page">
      <Sidebar />

      <main className="results-main">
        <div className="results-main-inner">
          <div className="results-header">
            <p className="exam-detail-kicker">Exam Analytics</p>
            <h1 className="results-title">Results &amp; Performance</h1>
          </div>

          {exams.length > 0 ? (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {exams.map((exam) => (
                <div key={exam.id} className="result-exam-card">
                  <h2 className="result-exam-title">{exam.title}</h2>

                  <p className="result-exam-desc">
                    {exam.description || "No description available"}
                  </p>

                  <button
                    onClick={() => navigate(`/admin-results/${exam.id}`)}
                    className="result-exam-btn"
                  >
                    <BarChart3 size={15} />
                    View Analytics
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="results-empty">
              <p>No exams to analyze yet.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
