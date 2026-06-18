import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import CreateGroupModal from "../components/CreateGroupModal";
import EditGroupModal from "../components/EditGroupModal";
import { Plus, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
    const response = await fetch("http://localhost:5000/api/groups");

    const data = await response.json();

    setGroups(data);
  }

  async function deleteGroup(id: string) {
    const confirmed = window.confirm("Delete this group?");

    if (!confirmed) return;

    await fetch(`http://localhost:5000/api/groups/${id}`, {
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

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredGroups.map((group) => (
              <div
                key={group.id}
                className="dashboard-card cursor-pointer"
                onClick={() => navigate(`/groups/${group.id}`)}
              >
                <h2>{group.name}</h2>

                <p>{group.description || "No description"}</p>

                <div className="mt-4">
                  <strong>{group.members.length}</strong> members
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    className="text-blue-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingGroup(group);
                    }}
                  >
                    Edit
                  </button>

                  <button
                    className="text-red-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteGroup(group.id);
                    }}
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
