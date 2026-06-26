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
  FileText,
  CheckCircle2,
  BarChart3,
  ChevronRight,
  GraduationCap,
} from "lucide-react";
import { API_URL } from "@/config";

export default function StudentDashboard() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<
    "dashboard" | "exams" | "practice" | "results" | "profile"
  >("dashboard");

  const [exams, setExams] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [user, setUser] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

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
      const response = await fetch(`${API_URL}/api/students/${userId}/exams`);

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
      const response = await fetch(`${API_URL}/api/students/${userId}/history`);

      if (response.ok) {
        const data = await response.json();
        setResults(data);
      }
    } catch (err) {
      console.error("Error loading results:", err);
    }
  }

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const getExamLockStatus = (exam: any) => {
    const attemptsUsed = exam.attemptsUsed || 0;
    const maxAttempts = exam.maxAttempts || 1;

    const start = exam.startTime ? new Date(exam.startTime) : null;
    const end = exam.endTime ? new Date(exam.endTime) : null;

    const isNotStartedYet = start
      ? currentTime.getTime() < start.getTime()
      : false;
    const isEnded = end ? currentTime.getTime() > end.getTime() : false;
    const isAttemptsSpent = attemptsUsed >= maxAttempts;

    const isLocked = isNotStartedYet || isEnded || isAttemptsSpent;

    let statusLabel = "Start Exam Session";
    if (isNotStartedYet)
      statusLabel = `Unlocks: ${start?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    else if (isEnded) statusLabel = "Exam Window Closed";
    else if (isAttemptsSpent) statusLabel = "Attempts Expired";

    return { isLocked, statusLabel };
  };

  const standardExams = exams.filter((exam) => !exam.isPractice);
  const practiceExams = exams.filter((exam) => exam.isPractice);

  const availableExamsCount = standardExams.filter((exam) => {
    const { isLocked } = getExamLockStatus(exam);
    return !isLocked;
  }).length;

  const availableExams = standardExams.filter(
    (exam) => (exam.attemptsUsed || 0) < (exam.maxAttempts || 1),
  );

  const averageGrade = results.length
    ? Math.round(
        results.reduce((acc, curr) => acc + (curr.percentage || 0), 0) /
          results.length,
      )
    : 0;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f1e8]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#8f895f] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="dashboard-bg min-h-screen flex">
      <aside className="sidebar">
        <div>
          <div className="mb-12">
            <h1 className="sidebar-logo">POIMEN</h1>
            <p className="sidebar-subtitle">Candidate Workspace</p>
          </div>

          <nav className="sidebar-nav">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex h-19.5 w-full items-center gap-6 rounded-[18px] px-7 text-[24px] font-semibold transition ${
                activeTab === "dashboard"
                  ? "bg-white/20 text-white"
                  : "text-white hover:bg-white/10"
              }`}
            >
              <LayoutDashboard size={24} />
              Dashboard
            </button>

            <button
              onClick={() => setActiveTab("exams")}
              className={`flex h-19.5 w-full items-center gap-5 rounded-[18px] px-6 text-[24px] font-semibold transition ${
                activeTab === "exams"
                  ? "bg-white/20 text-white"
                  : "text-white hover:bg-white/10"
              }`}
            >
              <BookOpen size={24} />
              My Exams
            </button>

            <button
              onClick={() => setActiveTab("practice")}
              className={`flex h-19.5 w-full items-center gap-5 rounded-[18px] px-6 text-[24px] font-semibold transition ${
                activeTab === "practice"
                  ? "bg-white/20 text-white"
                  : "text-white hover:bg-white/10"
              }`}
            >
              <GraduationCap size={24} />
              Practice Tests
            </button>

            <button
              onClick={() => setActiveTab("results")}
              className={`flex h-19.5 w-full items-center gap-5 rounded-[18px] px-6 text-[24px] font-semibold transition ${
                activeTab === "results"
                  ? "bg-white/20 text-white"
                  : "text-white hover:bg-white/10"
              }`}
            >
              <Award size={24} />
              My Results
            </button>

            <button
              onClick={() => setActiveTab("profile")}
              className={`flex h-19.5 w-full items-center gap-5 rounded-[18px] px-6 text-[24px] font-semibold transition ${
                activeTab === "profile"
                  ? "bg-white/20 text-white"
                  : "text-white hover:bg-white/10"
              }`}
            >
              <User size={24} />
              Profile
            </button>
          </nav>
        </div>

        <div className="sidebar-user mb-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/25 text-2xl font-bold">
            {user.name ? user.name[0].toUpperCase() : "S"}
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-xl font-bold text-white">
              {user.name || "Student"}
            </h3>

            <p className="mt-1 text-sm uppercase tracking-[1px] text-white/50">
              Student
            </p>

            <button
              onClick={handleLogout}
              className="mt-3 flex items-center gap-2 text-xl text-red-500 transition hover:text-red-400"
            >
              <LogOut size={18} />
              Log Out
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-8">
        {activeTab === "dashboard" && (
          <>
            <section className="hero-banner">
              <img src="/shepherd.jpg" alt="" className="hero-image" />
              <div className="hero-overlay" />
              <div className="hero-content">
                <h2>Welcome Back, {user.name || "Student"}</h2>
                <p className="mt-8 max-w-190 text-[28px] font-normal leading-[1.35]">
                  View available exams, Completed exams and results from one
                  place.
                </p>
              </div>
            </section>

            <div className="stats-grid">
              <div className="dashboard-stat">
                <FileText size={28} />
                <div>
                  <h3>Available Tests</h3>
                  <span>{availableExamsCount}</span>
                </div>
              </div>

              <div className="dashboard-stat">
                <CheckCircle2 size={28} />
                <div>
                  <h3>Completed Exams</h3>
                  <span>{results.length}</span>
                </div>
              </div>

              <div className="dashboard-stat">
                <BarChart3 size={28} />
                <div>
                  <h3>Average Grade</h3>
                  <span>{results.length ? `${averageGrade}%` : "N/A"}</span>
                </div>
              </div>
            </div>

            <section className="dashboard-grid">
              <div className="dashboard-card large-card">
                <div className="section-header">
                  <h2>Urgent Actions</h2>
                  <button onClick={() => setActiveTab("exams")}>
                    View All
                    <ChevronRight size={16} />
                  </button>
                </div>

                <div className="activity-feed">
                  {availableExams.slice(0, 5).map((exam) => {
                    const { isLocked } = getExamLockStatus(exam);
                    return (
                      <div
                        key={exam.id}
                        className={`activity-item transition-all ${isLocked ? "opacity-40 pointer-events-none" : ""}`}
                      >
                        <div>
                          <h3>{exam.title}</h3>
                          <p>
                            <Clock size={16} /> {exam.duration} mins
                            <span>•</span> Cutoff: {exam.passMark}%
                          </p>
                        </div>
                        <button
                          disabled={isLocked}
                          onClick={() => navigate(`/takeexam/${exam.id}`)}
                        >
                          <ArrowRight size={16} />
                        </button>
                      </div>
                    );
                  })}
                  {availableExams.length === 0 && (
                    <p className="text-[18px] italic text-[#8f895f]">
                      No pending exam interactions required.
                    </p>
                  )}
                </div>
              </div>

              <div className="side-column">
                <div className="dashboard-column">
                  <h2>Quick Actions</h2>
                  <div className="flex flex-col gap-6">
                    <button
                      onClick={() => setActiveTab("exams")}
                      className="action-btn"
                    >
                      <BookOpen size={22} />
                      My Exams
                    </button>

                    <button
                      onClick={() => setActiveTab("results")}
                      className="action-btn"
                    >
                      <BarChart3 size={22} />
                      My Results
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {activeTab === "exams" && (
          <div className="space-y-8">
            <div>
              <h2 className="tab-heading">My Graded Exams</h2>
              <p className="tab-subheading">
                Official evaluated exams registered in active tracking channels.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {standardExams.length === 0 ? (
                <p className="text-[18px] italic text-[#8f895f]">
                  No official assignments allocated currently.
                </p>
              ) : (
                standardExams.map((exam) => {
                  const { isLocked, statusLabel } = getExamLockStatus(exam);
                  const attemptsUsed = exam.attemptsUsed || 0;
                  const maxAttempts = exam.maxAttempts || 1;

                  return (
                    <div
                      key={exam.id}
                      className={`student-exam-card panel-card transition-all ${isLocked ? "opacity-50 select-none" : ""}`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="student-exam-title">{exam.title}</h3>
                          <span
                            className={`student-exam-badge ${isLocked ? "student-exam-badge--locked" : ""}`}
                          >
                            {attemptsUsed}/{maxAttempts} Attempts
                          </span>
                        </div>
                        <p className="student-exam-desc">
                          {exam.description || "No description available."}
                        </p>
                        <div className="student-exam-meta">
                          <span className="flex items-center gap-1">
                            <Clock size={14} /> {exam.duration} mins
                          </span>
                          <span>
                            Pass Mark: <strong>{exam.passMark}%</strong>
                          </span>
                        </div>
                      </div>
                      <button
                        disabled={isLocked}
                        onClick={() => navigate(`/takeexam/${exam.id}`)}
                        className={`student-exam-cta ${isLocked ? "student-exam-cta--locked" : ""}`}
                      >
                        {statusLabel}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {activeTab === "practice" && (
          <div className="space-y-8">
            <div>
              <h2 className="tab-heading">Practice Evaluation Sandbox</h2>
              <p className="tab-subheading">
                Practice runs for different exams
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {practiceExams.length === 0 ? (
                <p className="text-[18px] italic text-[#8f895f]">
                  No practice tests configured yet.
                </p>
              ) : (
                practiceExams.map((exam) => {
                  const { isLocked, statusLabel } = getExamLockStatus(exam);

                  return (
                    <div
                      key={exam.id}
                      className={`student-exam-card panel-card transition-all ${isLocked ? "opacity-50 select-none" : ""}`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="student-exam-title">{exam.title}</h3>
                          <span className="student-exam-badge">
                            Practice Track
                          </span>
                        </div>
                        <p className="student-exam-desc">
                          {exam.description || "No description available."}
                        </p>
                        <div className="student-exam-meta">
                          <span className="flex items-center gap-1">
                            <Clock size={14} /> {exam.duration} mins
                          </span>
                          <span>
                            Target: <strong>{exam.passMark}%</strong>
                          </span>
                        </div>
                      </div>
                      <button
                        disabled={isLocked}
                        onClick={() => navigate(`/takeexam/${exam.id}`)}
                        className={`student-exam-cta ${isLocked ? "student-exam-cta--locked" : ""}`}
                      >
                        {isLocked ? statusLabel : "Launch Session"}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {activeTab === "results" && (
          <div className="space-y-8">
            <div>
              <h2 className="tab-heading">My Results</h2>
              <p className="tab-subheading">Your saved exam results.</p>
            </div>

            <div className="results-history-card panel-card">
              <table className="results-history-table">
                <thead>
                  <tr>
                    <th>Exam Name</th>
                    <th>Submission Date</th>
                    <th className="text-center">Score Profile</th>
                    <th className="text-center">Percentage</th>
                    <th className="text-center">Evaluation</th>
                    <th className="text-right">Review</th>
                  </tr>
                </thead>

                <tbody>
                  {results.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="p-6 text-center italic"
                        style={{ color: "var(--olive)" }}
                      >
                        No historical evaluations saved yet.
                      </td>
                    </tr>
                  ) : (
                    results.map((res) => (
                      <tr key={res.id}>
                        <td
                          className="font-medium"
                          style={{ color: "#302f24" }}
                        >
                          {res.exam?.title || "Assessment Runtime"}
                          {res.exam?.isPractice && (
                            <span className="ml-2 text-[10px] bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wide border border-purple-100">
                              Practice
                            </span>
                          )}
                        </td>

                        <td style={{ color: "var(--olive)" }}>
                          {res.submittedAt
                            ? new Date(res.submittedAt).toLocaleDateString()
                            : new Date(res.startedAt).toLocaleDateString()}
                        </td>

                        <td
                          className="text-center font-mono"
                          style={{ color: "var(--olive)" }}
                        >
                          {res.score ?? 0} pts
                        </td>

                        <td
                          className="text-center font-mono font-bold"
                          style={{ color: "var(--olive-dark)" }}
                        >
                          {Math.round(res.percentage || 0)}%
                        </td>

                        <td className="text-center">
                          <span
                            className={`status-pill ${
                              res.passed
                                ? "status-pill--passed"
                                : "status-pill--failed"
                            }`}
                          >
                            {res.passed ? "Pass" : "Fail"}
                          </span>
                        </td>

                        <td className="text-right">
                          <button
                            type="button"
                            onClick={() =>
                              navigate(`/student/results/${res.id}`)
                            }
                            className="results-view-btn"
                          >
                            <Eye size={12} />
                            View Details
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
          <div className="max-w-2xl space-y-8">
            <div>
              <h2 className="tab-heading">Identity Profile</h2>
              <p className="tab-subheading">Your details.</p>
            </div>

            <div className="profile-card panel-card">
              <div>
                <label className="profile-field-label">Display Name</label>
                <div className="profile-field-value">{user.name || "N/A"}</div>
              </div>

              {user.email && (
                <div>
                  <label className="profile-field-label">
                    Email Registry String
                  </label>
                  <div className="profile-field-value">{user.email}</div>
                </div>
              )}

              <div>
                <label className="profile-field-label">
                  Unique Reference Handle
                </label>
                <div className="profile-field-value font-mono">
                  {user.username || "N/A"}
                </div>
              </div>

              <div>
                <label className="profile-field-label">
                  Authorization Tier Status
                </label>
                <div className="profile-field-value text-xs font-bold uppercase tracking-wide">
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
