import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import CreateGroupModal from "../components/CreateGroupModal";
import EditGroupModal from "../components/EditGroupModal";
import { Plus, Search, Users, FolderOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "@/config";

interface Group {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  members: [];
}

export default function Groups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [search, setSearch] = useState("");

  const [showCreateModal, setShowCreateModal] = useState(false);

  const [editingGroup, setEditingGroup] = useState<Group | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    loadGroups();
  }, []);

  async function loadGroups() {
    const response = await fetch(`${API_URL}/api/groups`);

    const data = await response.json();

    setGroups(data);
  }

  async function deleteGroup(id: string) {
    const confirmed = window.confirm("Delete this group?");

    if (!confirmed) return;

    await fetch(`${API_URL}/api/groups/${id}`, {
      method: "DELETE",
    });

    loadGroups();
  }

  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      <div className="dashboard-bg min-h-screen flex">
        <Sidebar />

        <main className="flex-1 p-8">
          <div className="page-header">
            <div>
              <h1>Groups</h1>
              <p>Manage church groups</p>
            </div>

            <button
              className="action-btn"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus size={18} />
              Create Group
            </button>
          </div>

          <div className="members-toolbar">
            <div className="search-box">
              <Search size={18} />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search groups..."
              />
            </div>
          </div>

          {filteredGroups.length === 0 ? (
            <div className="groups-empty">
              <FolderOpen size={32} />
              <h3>No groups found</h3>
              <p>
                {search
                  ? "Try a different search term."
                  : "Create your first group to get started."}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredGroups.map((group) => (
                <div
                  key={group.id}
                  className="group-card cursor-pointer"
                  onClick={() => navigate(`/groups/${group.id}`)}
                >
                  <div className="group-card-top">
                    <div className="group-card-icon">
                      <Users size={20} />
                    </div>

                    <div>
                      <h2 className="group-card-title">{group.name}</h2>
                      <p className="group-card-desc">
                        {group.description || "No description"}
                      </p>
                    </div>
                  </div>

                  <div className="group-card-meta">
                    <span className="group-member-count">
                      <strong>{group.members.length}</strong> members
                    </span>

                    <div className="group-card-actions">
                      <button
                        className="group-action-btn group-action-btn--edit"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingGroup(group);
                        }}
                      >
                        Edit
                      </button>

                      <button
                        className="group-action-btn group-action-btn--delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteGroup(group.id);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {showCreateModal && (
        <CreateGroupModal
          onClose={() => setShowCreateModal(false)}
          onGroupCreated={loadGroups}
        />
      )}

      {editingGroup && (
        <EditGroupModal
          group={editingGroup}
          onClose={() => setEditingGroup(null)}
          onGroupUpdated={loadGroups}
        />
      )}
    </>
  );
}
