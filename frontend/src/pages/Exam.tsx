import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import CreateExamModal from "../components/CreateExamModal";
import { Search, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { isAdmin } from "@/utilis/auth";

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
    const response = await fetch("http://localhost:5000/api/exams");

    const data = await response.json();

    setExams(data);
  }

  async function deleteExam(id: string) {
    const confirmed = window.confirm("Delete this exam?");

    if (!confirmed) return;

    await fetch(`http://localhost:5000/api/exams/${id}`, {
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

        <main className="flex-1 p-8">
          <div className="page-header">
            <div>
              <h1>Exams</h1>
              <p>Create and manage exams</p>
            </div>

            {isAdmin() && (
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
            )}
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

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredExams.map((exam) => (
              <div key={exam.id} className="dashboard-card">
                <h2>{exam.title}</h2>

                <p>{exam.description || "No description"}</p>

                <div className="mt-4 space-y-2">
                  <div>Duration: {exam.duration} mins</div>

                  <div>Pass Mark: {exam.passMark}%</div>

                  <div>Marking: {exam.markingSystem}</div>

                  <div>Questions: {exam.questions?.length || 0}</div>

                  <div>Groups: {exam.examGroups?.length || 0}</div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    className="text-blue-600"
                    onClick={() => navigate(`/exams/${exam.id}`)}
                  >
                    Open
                  </button>

                  <button
                    className="text-red-600"
                    onClick={() => deleteExam(exam.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
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
