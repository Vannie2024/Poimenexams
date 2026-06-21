import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import CreateExamModal from "../components/CreateExamModal";
import { Search, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { isAdmin } from "@/utilis/auth";
import { API_URL } from "@/config";

interface Exam {
  id: string;
  title: string;
  description?: string;
  duration: number;
  passMark: number;
  markingSystem: string;
  questions: any[];
  examGroups: any[];
}

export default function Exams() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    loadExams();
  }, []);

  async function loadExams() {
    const response = await fetch(`${API_URL}/api/exams`);

    const data = await response.json();

    setExams(data);
  }

  async function deleteExam(id: string) {
    const confirmed = window.confirm("Delete this exam?");

    if (!confirmed) return;

    await fetch(`${API_URL}/api/exams/${id}`, {
      method: "DELETE",
    });

    loadExams();
  }

  const filteredExams = exams.filter((exam) =>
    exam.title.toLowerCase().includes(search.toLowerCase()),
  );

  console.log("isAdmin =", isAdmin());
  return (
    <>
      <div className="dashboard-bg min-h-screen flex">
        <Sidebar />

        <main className="flex-1 min-w-0 p-8">
          <div className="page-header">
            <div>
              <h1>Exams</h1>
              <p>Create and manage exams</p>
            </div>

            <button
              className="action-btn"
              onClick={() => {
                console.log("Create Exam clicked");
                setShowCreateModal(true);
              }}
            >
              <Plus size={18} />
              Create Exam
            </button>
          </div>

          <div className="members-toolbar">
            <div className="search-box">
              <Search size={18} />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search exams..."
              />
            </div>
          </div>

          {filteredExams.length > 0 ? (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredExams.map((exam) => {
                const questionCount = exam.questions?.length || 0;
                const groupCount = exam.examGroups?.length || 0;

                return (
                  <div key={exam.id} className="exam-card">
                    <div className="exam-card-top">
                      <h2 className="exam-card-title">{exam.title}</h2>
                      <span className="exam-card-duration">
                        {exam.duration} mins
                      </span>
                    </div>

                    <p className="exam-card-desc">
                      {exam.description || "No description"}
                    </p>

                    <div className="exam-card-meta">
                      <div>
                        <p className="exam-meta-label">Pass Mark</p>
                        <p className="exam-meta-value">{exam.passMark}%</p>
                      </div>

                      <div>
                        <p className="exam-meta-label">Marking</p>
                        <p className="exam-meta-value">{exam.markingSystem}</p>
                      </div>

                      <div>
                        <p className="exam-meta-label">Questions</p>
                        <p
                          className={`exam-meta-value ${
                            questionCount === 0 ? "warn" : "ok"
                          }`}
                        >
                          {questionCount}
                        </p>
                      </div>

                      <div>
                        <p className="exam-meta-label">Groups</p>
                        <p className="exam-meta-value">{groupCount}</p>
                      </div>
                    </div>

                    <div className="exam-card-actions">
                      <button
                        className="exam-open-btn"
                        onClick={() => navigate(`/exams/${exam.id}`)}
                      >
                        Open
                      </button>

                      <button
                        className="exam-delete-link"
                        onClick={() => deleteExam(exam.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="exams-empty">
              <h3 className="font-bold" style={{ color: "var(--olive-dark)" }}>
                No exams found
              </h3>
              <p className="mt-1 text-sm">
                {search
                  ? "Try a different search term."
                  : "Create your first exam to get started."}
              </p>
            </div>
          )}
        </main>
      </div>

      {showCreateModal && (
        <CreateExamModal
          onClose={() => setShowCreateModal(false)}
          onExamCreated={loadExams}
        />
      )}
    </>
  );
}
