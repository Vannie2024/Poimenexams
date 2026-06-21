import { useEffect, useState } from "react";
import {
  Users,
  FileText,
  Layers,
  BarChart3,
  Plus,
  ChevronRight,
} from "lucide-react";
import Sidebar from "../components/Sidebar";

import CreateMemberModal from "../components/CreateMemberModal";
import type { DashboardResponse } from "../types/dashboard";

export default function Dashboard() {
  const [showMemberModal, setShowMemberModal] = useState(false);

  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/dashboard");

        const data = await response.json();

        setDashboard(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <>
      <div className="dashboard-bg min-h-screen flex">
        <Sidebar />
        {/* MAIN */}
        <main className="flex-1 p-8">
          {/* HERO */}
          <section className="hero-banner">
            <img src="/shepherd.jpg" alt="" className="hero-image" />

            <div className="hero-overlay" />

            <div className="hero-content">
              <h2>Welcome Naomi</h2>

              <p>Manage members, exams, groups and results from one place.</p>
            </div>
          </section>

          {/* STATS */}
          <section className="stats-grid">
            <div className="dashboard-stat">
              <Users size={28} />
              <h3>Members</h3>
              <span>{dashboard?.stats.members}</span>
            </div>

            <div className="dashboard-stat">
              <FileText size={28} />
              <h3>Exams</h3>
              <span>{dashboard?.stats.exams}</span>
            </div>

            <div className="dashboard-stat">
              <Layers size={28} />
              <h3>Groups</h3>
              <span>{dashboard?.stats.groups}</span>
            </div>

            <div className="dashboard-stat">
              <BarChart3 size={28} />
              <h3>Average Result</h3>
              <span>{dashboard?.stats.averageScore}%</span>
            </div>
          </section>

          {/* CONTENT GRID */}
          <section className="dashboard-grid">
            <div className="dashboard-card large-card">
              <div className="section-header">
                <h2>Recent Activity</h2>

                <button>
                  View All
                  <ChevronRight size={16} />
                </button>
              </div>

              <div className="activity-feed">
                {dashboard?.recentActivity.map((activity, index) => (
                  <div key={index} className="activity-item">
                    {activity.message}
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="side-column">
              <div className="dashboard-card">
                <h2>Quick Actions</h2>

                <div className="quick-actions">
                  <button
                    className="action-btn"
                    onClick={() => setShowMemberModal(true)}
                  >
                    <Plus size={18} />
                    Create Member
                  </button>

                  <button className="action-btn">
                    <Plus size={18} />
                    Create Exam
                  </button>

                  <button className="action-btn">
                    <Plus size={18} />
                    Create Group
                  </button>
                </div>
              </div>

              {/* Keep your remaining cards here */}
            </div>
          </section>
        </main>
      </div>

      {showMemberModal && (
        <CreateMemberModal
          onClose={() => setShowMemberModal(false)}
          onMemberCreated={() => {}}
        />
      )}
    </>
  );
}
