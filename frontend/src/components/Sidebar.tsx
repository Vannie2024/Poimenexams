import { Home, Users, FileText, Layers, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  <p className="text-xs">{role}</p>;
  return (
    <aside className="sidebar">
      <div>
        <div className="mb-12">
          <h1
            className="sidebar-logo"
            style={{
              fontFamily: "Cormorant Garamond",
            }}
          >
            POIMEN
          </h1>

          <p className="sidebar-subtitle">Examination Portal</p>
        </div>

        <nav className="sidebar-nav">
          <button
            className="sidebar-link active"
            onClick={() => navigate("/dashboard")}
          >
            <Home size={18} />
            Dashboard
          </button>

          <button className="sidebar-link" onClick={() => navigate("/members")}>
            <Users size={18} />
            Members
          </button>

          <button className="sidebar-link" onClick={() => navigate("/exams")}>
            <FileText size={18} />
            Exams
          </button>

          <button className="sidebar-link" onClick={() => navigate("/groups")}>
            <Layers size={18} />
            Groups
          </button>

          <button
            className="sidebar-link"
            onClick={() => navigate("/admin-results/${exam.id}")}
          >
            <BarChart3 size={18} />
            Results
          </button>
        </nav>
      </div>

      <div className="sidebar-user">
        <div className="sidebar-avatar">N</div>

        <div>
          <p>Naomi</p>
          <span>Administrator</span>
        </div>
      </div>
    </aside>
  );
}
