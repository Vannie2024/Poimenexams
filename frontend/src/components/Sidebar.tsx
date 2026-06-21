import { Home, Users, FileText, Layers, BarChart3, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role") || "Administrator";
  const name = localStorage.getItem("name") || "Admin";

  const avatarInitial = name.charAt(0).toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    localStorage.removeItem("userId");

    navigate("/");
  };

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

          <button className="sidebar-link" onClick={() => navigate("/results")}>
            <BarChart3 size={18} />
            Results
          </button>
        </nav>
      </div>

      <div className="mt-auto">
        <div className="sidebar-user mb-4">
          <div className="sidebar-avatar">{avatarInitial}</div>

          <div>
            <p className="font-semibold">{name}</p>
            <span className="text-xs text-gray-500 capitalize">
              {role.toLowerCase()}
            </span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors rounded-xl font-medium"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
