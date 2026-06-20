import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Award,
  User,
  Clock,
  ArrowRight,
  LogOut,
  Eye,
} from "lucide-react";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "exams" | "results" | "profile"
  >("dashboard");
  const [exams, setExams] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [user, setUser] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const activeUser = JSON.parse(localStorage.getItem("user") || "{}");
    setUser(activeUser);
    if (activeUser.id) {
      Promise.all([
        loadAssignedExams(activeUser.id),
        loadPastResults(activeUser.id),
      ]).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  async function loadAssignedExams(userId: string) {
    try {
      const response = await fetch(
        `http://localhost:5000/api/students/${userId}/exams`,
      );
      if (response.ok) {
        const data = await response.json();
        setExams(data);
      }
    } catch (err) {
      console.error("Error loading assigned exams:", err);
    }
  }

  async function loadPastResults(userId: string) {
    try {
      const response = await fetch(
        `http://localhost:5000/api/students/${userId}/history`,
      );
      if (response.ok) {
        const data = await response.json();
        setResults(data); // Expecting array of ExamAttempt records
      }
    } catch (err) {
      console.error("Error loading results:", err);
    }
  }

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F6F1E8]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#8A8250] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F6F1E8] text-[#3F3A25]">
      {/* Symmetrical Custom Sidebar Layout */}
      <aside className="w-72 bg-[#605A39] text-white p-8 flex flex-col justify-between shrink-0 shadow-xl">
        <div>
          <div className="mb-12">
            <h1 className="text-5xl font-serif tracking-tight leading-none">
              POIMEN
            </h1>
            <p className="text-xs tracking-[0.2em] opacity-70 mt-1 uppercase">
              Candidate Workspace
            </p>
          </div>

          <nav className="flex flex-col gap-1.5">
            {[
              {
                id: "dashboard",
                label: "Dashboard",
                icon: <LayoutDashboard size={18} />,
              },
              { id: "exams", label: "My Exams", icon: <BookOpen size={18} /> },
              { id: "results", label: "My Results", icon: <Award size={18} /> },
              { id: "profile", label: "Profile", icon: <User size={18} /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-3.5 w-full px-5 py-4 rounded-xl transition font-medium text-sm ${
                  activeTab === tab.id
                    ? "bg-white/20 text-white shadow-sm"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* User Account Info Box Footer */}
        <div className="border-t border-white/10 pt-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold font-serif text-lg text-white">
              {user.name ? user.name[0].toUpperCase() : "S"}
            </div>
            <div className="overflow-hidden">
              <p className="font-medium text-sm truncate leading-snug text-white">
                {user.name || "Student"}
              </p>
              <span className="text-xs opacity-60 uppercase tracking-wider block mt-0.5 text-white/80">
                STUDENT
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs font-medium text-white/60 hover:text-red-300 w-full transition"
          >
            <LogOut size={14} /> Log Out
          </button>
        </div>
      </aside>

      <main className="flex-1 p-12 overflow-y-auto">
        {activeTab === "dashboard" && (
          <div className="space-y-10">
            <div>
              <h2 className="text-4xl font-serif text-[#605A39]">
                Welcome Back, {user.name || "Student"}
              </h2>
              <p className="text-sm text-[#8A8250] mt-1">Overview</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border border-[#D8CCB1] p-6 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
                <span className="text-xs uppercase tracking-wider text-[#8A8250] font-semibold">
                  Available Tests
                </span>
                <p className="text-3xl font-serif text-[#3F3A25] font-bold mt-2">
                  {exams.length}
                </p>
              </div>
              <div className="bg-white border border-[#D8CCB1] p-6 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
                <span className="text-xs uppercase tracking-wider text-[#8A8250] font-semibold">
                  Completed Runs
                </span>
                <p className="text-3xl font-serif text-[#3F3A25] font-bold mt-2">
                  {results.length}
                </p>
              </div>
              <div className="bg-white border border-[#D8CCB1] p-6 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
                <span className="text-xs uppercase tracking-wider text-[#8A8250] font-semibold">
                  Average Grade
                </span>
                <p className="text-3xl font-serif text-[#3F3A25] font-bold mt-2">
                  {results.length
                    ? `${Math.round(results.reduce((acc, curr) => acc + (curr.percentage || 0), 0) / results.length)}%`
                    : "N/A"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <div className="bg-white border border-[#D8CCB1] rounded-2xl p-6">
                <h3 className="text-lg font-serif text-[#605A39] mb-4">
                  Urgent Actions
                </h3>
                {exams
                  .filter((e) => (e.attemptsUsed || 0) < (e.maxAttempts || 1))
                  .slice(0, 2)
                  .map((exam) => (
                    <div
                      key={exam.id}
                      className="flex items-center justify-between p-4 bg-[#FBF9F4] rounded-xl border border-[#EBE5D7] mb-3"
                    >
                      <div>
                        <h4 className="font-medium text-[#3F3A25] text-sm">
                          {exam.title}
                        </h4>
                        <p className="text-xs text-[#8A8250] flex items-center gap-1.5 mt-1">
                          <Clock size={12} /> {exam.duration} mins • Cutoff:{" "}
                          {exam.passMark}%
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveTab("exams")}
                        className="p-2.5 bg-white text-[#8A8250] border border-[#D8CCB1] rounded-xl hover:bg-[#8A8250] hover:text-white transition"
                      >
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  ))}
                {exams.length === 0 && (
                  <p className="text-sm text-[#8A8250] italic">
                    No pending exam interactions required.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "exams" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-serif text-[#605A39]">My Exams</h2>
              <p className="text-sm text-[#8A8250]">Exams registered in</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {exams.length === 0 ? (
                <p className="text-sm text-[#8A8250] italic">
                  No assignments allocated to your student dashboard currently.
                </p>
              ) : (
                exams.map((exam) => {
                  const attemptsUsed = exam.attemptsUsed || 0;
                  const maxAttempts = exam.maxAttempts || 1;
                  const isLockedOut = attemptsUsed >= maxAttempts;

                  return (
                    <div
                      key={exam.id}
                      className="bg-white border border-[#D8CCB1] rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex flex-col justify-between min-h-55"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-xl font-serif text-[#3F3A25] font-medium leading-snug">
                            {exam.title}
                          </h3>
                          <span
                            className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border whitespace-nowrap ${
                              isLockedOut
                                ? "bg-red-50 text-red-700 border-red-200"
                                : "bg-[#F7F4EC] text-[#605A39] border-[#D8CCB1]"
                            }`}
                          >
                            {attemptsUsed}/{maxAttempts} Attempts
                          </span>
                        </div>
                        <p className="text-xs text-[#8A8250] mt-2 line-clamp-2">
                          {exam.description || "No description available."}
                        </p>

                        <div className="mt-4 flex items-center gap-4 text-xs font-medium text-[#8A8250]">
                          <span className="flex items-center gap-1">
                            <Clock size={12} /> {exam.duration} mins
                          </span>
                          <span>
                            Pass Mark:{" "}
                            <strong className="text-[#3F3A25]">
                              {exam.passMark}%
                            </strong>
                          </span>
                        </div>
                      </div>

                      <button
                        disabled={isLockedOut}
                        className={`mt-6 w-full py-3 rounded-xl text-xs font-semibold text-white transition duration-150 ${
                          isLockedOut
                            ? "bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-300"
                            : "bg-[#8A8250] hover:bg-[#605A39] shadow-sm"
                        }`}
                        onClick={() => navigate(`/takeexam/${exam.id}`)}
                      >
                        {isLockedOut
                          ? "Attempt Limit Spent"
                          : "Start Exam Session"}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {activeTab === "results" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-serif text-[#605A39]">My Results</h2>
              <p className="text-sm text-[#8A8250]">your results</p>
            </div>

            <div className="bg-white border border-[#D8CCB1] rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-[#F7F4EC] text-[#605A39] text-xs font-semibold uppercase tracking-wider border-b border-[#D8CCB1]">
                  <tr>
                    <th className="p-4 pl-6">Exam Name</th>
                    <th className="p-4">Submission Date</th>
                    <th className="p-4 text-center">Score Profile</th>
                    <th className="p-4 text-center">Percentage</th>
                    <th className="p-4 pr-6 text-center">Evaluation</th>
                    <th className="p-4 pr-6 text-right">Review</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1EFEA]">
                  {results.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="p-6 text-center text-[#8A8250] italic"
                      >
                        No historical evaluations saved yet.
                      </td>
                    </tr>
                  ) : (
                    results.map((res) => (
                      <tr
                        key={res.id}
                        className="hover:bg-[#FBF9F4]/50 transition"
                      >
                        <td className="p-4 pl-6 font-medium text-[#3F3A25]">
                          {res.exam?.title || "Assessment Runtime"}
                        </td>
                        <td className="p-4 text-[#8A8250]">
                          {res.submittedAt
                            ? new Date(res.submittedAt).toLocaleDateString()
                            : new Date(res.startedAt).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-center font-mono text-[#8A8250]">
                          {res.score ?? 0} pts
                        </td>
                        <td className="p-4 text-center font-mono font-bold text-[#605A39]">
                          {Math.round(res.percentage || 0)}%
                        </td>
                        <td className="p-4 pr-6 text-right">
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase ${
                              res.passed
                                ? "bg-green-50 text-green-700 border border-green-200"
                                : "bg-red-50 text-red-700 border border-red-200"
                            }`}
                          >
                            {res.passed ? "PASS" : "FAIL"}
                          </span>
                        </td>

                        <td className="p-4 pr-6 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              navigate(`/student/results/${res.id}`)
                            }
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#D8CCB1] text-xs font-semibold rounded-lg text-[#8A8250] bg-white hover:bg-[#8A8250] hover:text-white transition shadow-sm"
                          >
                            <Eye size={12} /> View Details
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "profile" && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h2 className="text-3xl font-serif text-[#605A39]">
                Identity Profile
              </h2>
              <p className="text-sm text-[#8A8250]">Your details.</p>
            </div>
            <div className="bg-white border border-[#D8CCB1] rounded-2xl p-6 space-y-4 shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
              <div>
                <label className="text-[10px] text-[#8A8250] uppercase font-bold tracking-wider">
                  Display Name
                </label>
                <div className="mt-1 p-3 bg-[#FBF9F4] border border-[#EBE5D7] rounded-xl font-medium text-[#3F3A25]">
                  {user.name || "N/A"}
                </div>
              </div>
              {user.email && (
                <div>
                  <label className="text-[10px] text-[#8A8250] uppercase font-bold tracking-wider">
                    Email Registry String
                  </label>
                  <div className="mt-1 p-3 bg-[#FBF9F4] border border-[#EBE5D7] rounded-xl font-medium text-[#3F3A25]">
                    {user.email}
                  </div>
                </div>
              )}
              <div>
                <label className="text-[10px] text-[#8A8250] uppercase font-bold tracking-wider">
                  Unique Reference Handle
                </label>
                <div className="mt-1 p-3 bg-[#FBF9F4] border border-[#EBE5D7] rounded-xl font-medium font-mono text-[#3F3A25]">
                  {user.username || "N/A"}
                </div>
              </div>
              <div>
                <label className="text-[10px] text-[#8A8250] uppercase font-bold tracking-wider">
                  Authorization Tier Status
                </label>
                <div className="mt-1 p-3 bg-[#FBF9F4] border border-[#EBE5D7] rounded-xl text-xs font-bold text-[#605A39] tracking-wide uppercase">
                  {user.role || "STUDENT"}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
