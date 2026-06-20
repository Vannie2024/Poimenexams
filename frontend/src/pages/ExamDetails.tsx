import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import CreateQuestionModal from "./CreateQuestionModal";
import { useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function ExamDetails() {
  const { id } = useParams();

  const [exam, setExam] = useState<any>(null);

  const [questions, setQuestions] = useState<any[]>([]);

  const [showQuestionModal, setShowQuestionModal] = useState(false);

  const [assignedGroups, setAssignedGroups] = useState<any[]>([]);
  const [allGroups, setAllGroups] = useState<any[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState("");

  useEffect(() => {
    loadExam();
    loadQuestions();
    loadExamGroups();
    loadAllGroups();
  }, []);

  async function loadExam() {
    const response = await fetch(`http://localhost:5000/api/exams/${id}`);

    const data = await response.json();

    setExam(data);
  }

  async function loadExamGroups() {
    const response = await fetch(
      `http://localhost:5000/api/exams/${id}/groups`,
    );
    const data = await response.json();
    setAssignedGroups(data);
  }

  async function loadAllGroups() {
    const response = await fetch("http://localhost:5000/api/groups");
    const data = await response.json();
    setAllGroups(data);
  }

  async function assignGroup() {
    if (!selectedGroupId) return;
    await fetch(`http://localhost:5000/api/exams/${id}/groups`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groupId: selectedGroupId }),
    });
    loadExamGroups();
    setSelectedGroupId("");
  }

  async function loadQuestions() {
    const response = await fetch(
      `http://localhost:5000/api/questions/exam/${id}`,
    );

    const data = await response.json();

    console.log("QUESTIONS DATA:", data);
    setQuestions(data);
  }

  async function deleteQuestion(questionId: string) {
    await fetch(`http://localhost:5000/api/questions/${questionId}`, {
      method: "DELETE",
    });

    loadQuestions();
  }
  console.log("QUESTIONS:", questions);

  if (!exam) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dashboard-bg min-h-screen flex text-gray-800">
      <Sidebar />

      <main className="flex-1 p-8 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {exam.title}
          </h1>
          <p className="text-gray-500 mt-2 max-w-2xl text-sm leading-relaxed">
            {exam.description || "No custom description set for this exam."}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-sm mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-1">
            Target Audiences & Groups
          </h2>
          <p className="text-xs text-gray-500 mb-4">
            Assign specific groups to allow members to take this examination.
          </p>

          <div className="flex gap-3 mb-5 max-w-md">
            <select
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              className="flex-1 rounded-xl border border-gray-200 px-3.5 py-2.5 bg-gray-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
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
              className="bg-blue-600 text-white font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-blue-700 transition shadow-sm"
            >
              Assign
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {assignedGroups.map((g) => (
              <span
                key={g.id}
                className="inline-flex items-center bg-blue-50/60 border border-blue-200/60 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-xl"
              >
                📍 {g.name}
              </span>
            ))}
            {assignedGroups.length === 0 && (
              <p className="text-xs text-gray-400 italic bg-gray-50 border border-dashed rounded-xl px-4 py-3 w-full">
                No church groups assigned. This exam is currently private to
                creators.
              </p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center pb-2">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Question Bank Deck
              </h2>
              <p className="text-xs text-gray-500">
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
            <div
              key={q.id}
              className="bg-white rounded-2xl border border-gray-200/70 shadow-sm p-6 hover:border-gray-300 transition"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-black tracking-wider text-gray-400 uppercase">
                      Q-{index + 1}
                    </span>
                    <span className="bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-extrabold px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                      {q.type.replace("_", " ")}
                    </span>
                    <span className="bg-purple-50 text-purple-700 border border-purple-100 text-[10px] font-extrabold px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                      {q.difficulty}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-gray-800 leading-relaxed">
                    {q.question}
                  </h3>
                </div>

                <button
                  className="text-xs font-bold text-red-500 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-100 px-3 py-1.5 rounded-xl transition shrink-0"
                  onClick={() => deleteQuestion(q.id)}
                >
                  Delete
                </button>
              </div>

              <div className="mt-5 grid sm:grid-cols-2 gap-3">
                {q.options.map((option: any) => (
                  <div
                    key={option.id}
                    className={`flex items-center justify-between p-3.5 rounded-xl border text-sm transition ${
                      option.isCorrect
                        ? "bg-green-50 border-green-200 text-green-900 font-medium"
                        : "bg-gray-50/60 border-gray-200 text-gray-600"
                    }`}
                  >
                    <span className="truncate pr-2">{option.optionText}</span>
                    {option.isCorrect && (
                      <span className="text-[10px] font-black uppercase tracking-wider bg-green-200 text-green-800 px-2 py-0.5 rounded-md shrink-0">
                        ✓ Answer
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {questions.length === 0 && (
            <div className="bg-white rounded-2xl p-10 text-center border border-dashed border-gray-300">
              <h3 className="text-lg font-bold text-gray-700">
                No Questions Added Yet
              </h3>
              <p className="text-sm text-gray-400 mt-1 max-w-sm mx-auto">
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
