import { useEffect, useState } from "react";
import { Plus, ToggleLeft, ToggleRight } from "lucide-react";
import CreateQuestionModal from "./CreateQuestionModal";
import { useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { API_URL } from "@/config";

export default function ExamDetails() {
  const { id } = useParams();

  const [exam, setExam] = useState<any>(null);

  const [questions, setQuestions] = useState<any[]>([]);

  const [showQuestionModal, setShowQuestionModal] = useState(false);

  const [assignedGroups, setAssignedGroups] = useState<any[]>([]);
  const [allGroups, setAllGroups] = useState<any[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [updatingPractice, setUpdatingPractice] = useState(false);

  useEffect(() => {
    loadExam();
    loadQuestions();
    loadExamGroups();
    loadAllGroups();
  }, []);

  async function togglePracticeMode() {
    if (!exam || updatingPractice) return;
    setUpdatingPractice(true);

    const originalState = exam.isPractice;
    const targetState = !originalState;

    setExam((prev: any) => ({ ...prev, isPractice: targetState }));

    try {
      const response = await fetch(`${API_URL}/api/exams/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPractice: targetState }),
      });

      if (!response.ok)
        throw new Error("Synchronization rejected by core backend handler.");

      const updatedExam = await response.json();
      setExam(updatedExam);
    } catch (err) {
      console.error("Error updating exam parameters model layout:", err);
      setExam((prev: any) => ({ ...prev, isPractice: originalState }));
    } finally {
      setUpdatingPractice(false);
    }
  }

  async function loadExam() {
    try {
      const response = await fetch(`${API_URL}/api/exams/${id}`);
      const data = await response.json();
      setExam(data);
    } catch (err) {
      console.error("Error loading core exam context:", err);
    }
  }

  async function loadExamGroups() {
    const response = await fetch(`${API_URL}/api/exams/${id}/groups`);
    const data = await response.json();
    setAssignedGroups(data);
  }

  async function loadAllGroups() {
    const response = await fetch(`${API_URL}/api/groups`);
    const data = await response.json();
    setAllGroups(data);
  }

  async function assignGroup() {
    if (!selectedGroupId) return;
    await fetch(`${API_URL}/api/exams/${id}/groups`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groupId: selectedGroupId }),
    });
    loadExamGroups();
    setSelectedGroupId("");
  }

  async function loadQuestions() {
    const response = await fetch(`${API_URL}/api/questions/exam/${id}`);
    const data = await response.json();
    console.log("QUESTIONS DATA:", data);
    setQuestions(data);
  }

  async function deleteQuestion(questionId: string) {
    await fetch(`${API_URL}/api/questions/${questionId}`, {
      method: "DELETE",
    });
    loadQuestions();
  }

  if (!exam) {
    return (
      <div className="dashboard-bg exam-detail-page items-center justify-center flex min-h-screen">
        <p
          className="text-sm font-semibold"
          style={{ color: "var(--olive-dark)" }}
        >
          Loading exam…
        </p>
      </div>
    );
  }

  return (
    <div className="dashboard-bg exam-detail-page">
      <Sidebar />

      <main className="exam-detail-main">
        <div className="mb-8 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <p className="exam-detail-kicker">Exam Details</p>
            <h1 className="exam-detail-title">{exam.title}</h1>
            <p className="exam-detail-desc">
              {exam.description || "No custom description set for this exam."}
            </p>
          </div>

          {/* Interactive Mode Configuration Control Switch */}
          <div className="flex items-center gap-3 bg-white/40 backdrop-blur-sm px-4 py-3 rounded-xl border border-stone-200/60 self-start">
            <div className="text-left">
              <p className="text-xs font-bold uppercase tracking-wide text-stone-500">
                Mode Setting
              </p>
              <p className="text-sm font-semibold text-stone-800">
                {exam.isPractice
                  ? "Practice Test Run"
                  : "Official Exam Session"}
              </p>
            </div>
            <button
              onClick={togglePracticeMode}
              disabled={updatingPractice}
              className={`transition-opacity ${updatingPractice ? "opacity-50" : "hover:opacity-80"}`}
              title="Toggle practice test parameter rules"
            >
              {exam.isPractice ? (
                <ToggleRight
                  size={40}
                  className="text-purple-600 cursor-pointer"
                />
              ) : (
                <ToggleLeft
                  size={40}
                  className="text-stone-400 cursor-pointer"
                />
              )}
            </button>
          </div>
        </div>

        <div className="audience-card">
          <h2 className="audience-card-title">Target Audiences &amp; Groups</h2>
          <p className="audience-card-hint">
            Assign specific groups to allow members to take this examination.
          </p>

          <div className="audience-row">
            <select
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              className="audience-select"
            >
              <option value="">Select an available group...</option>
              {allGroups
                .filter((g) => !assignedGroups.some((ag) => ag.id === g.id))
                .map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
            </select>
            <button
              onClick={assignGroup}
              className="action-btn px-5 py-2.5 text-sm"
            >
              Assign
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {assignedGroups.map((g) => (
              <span key={g.id} className="audience-pill">
                📍 {g.name}
              </span>
            ))}
            {assignedGroups.length === 0 && (
              <p className="audience-empty">
                No church groups assigned. This exam is currently private to
                creators.
              </p>
            )}
          </div>
        </div>

        <div>
          <div className="qbank-header">
            <div>
              <h2 className="qbank-title">Question Bank Deck</h2>
              <p className="qbank-hint">
                Manage structure parameters for your {questions.length}{" "}
                question(s)
              </p>
            </div>
            <button
              className="action-btn flex items-center gap-2 px-4 py-2 text-sm"
              onClick={() => setShowQuestionModal(true)}
            >
              <Plus size={16} /> Add Question
            </button>
          </div>

          {questions.map((q, index) => (
            <div key={q.id} className="question-card">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="question-index">Q-{index + 1}</span>
                    <span className="question-tag question-tag--type">
                      {q.type.replace("_", " ")}
                    </span>
                    <span className="question-tag question-tag--difficulty">
                      {q.difficulty}
                    </span>
                  </div>
                  <h3 className="question-text">{q.question}</h3>
                </div>

                <button
                  className="question-delete"
                  onClick={() => deleteQuestion(q.id)}
                >
                  Delete
                </button>
              </div>

              <div className="option-grid">
                {q.options &&
                  q.options.map((option: any) => (
                    <div
                      key={option.id}
                      className={`option-row ${option.isCorrect ? "option-row--correct" : ""}`}
                    >
                      <span className="truncate pr-2">{option.optionText}</span>
                      {option.isCorrect && (
                        <span className="option-correct-badge">✓ Answer</span>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          ))}

          {questions.length === 0 && (
            <div className="qbank-empty">
              <h3>No Questions Added Yet</h3>
              <p>
                Get started building your questionnaire by using the action
                builder configuration menu.
              </p>
            </div>
          )}
        </div>
      </main>

      {showQuestionModal && (
        <CreateQuestionModal
          examId={id!}
          onClose={() => setShowQuestionModal(false)}
          onQuestionCreated={loadQuestions}
        />
      )}
    </div>
  );
}
