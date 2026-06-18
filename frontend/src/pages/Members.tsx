import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import CreateMemberModal from "../components/CreateMemberModal";
import { Plus, Search } from "lucide-react";
import EditMemberModal from "../components/EditMemberModal";

interface User {
  id: string;
  name: string;
  username: string;
  email?: string;
  role: string;
  createdAt: string;
}

export default function Members() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const response = await fetch("http://localhost:5000/api/users");

      const data = await response.json();

      setUsers(data);
    } catch (error) {
      console.error(error);
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm("Delete this member?");

    if (!confirmed) return;

    try {
      await fetch(`http://localhost:5000/api/users/${id}`, {
        method: "DELETE",
      });

      loadUsers();
    } catch {
      alert("Failed to delete member");
    }
  }

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      <div className="dashboard-bg min-h-screen flex">
        <Sidebar />

        <main className="flex-1 p-8">
          <div className="page-header">
            <div>
              <h1>Members</h1>

              <p>Manage church members and login credentials</p>
            </div>

            <button
              className="action-btn"
              onClick={() => setShowMemberModal(true)}
            >
              <Plus size={18} />
              Add Member
            </button>
          </div>

          <div className="members-toolbar">
            <div className="search-box">
              <Search size={18} />

              <input
                type="text"
                placeholder="Search members..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="table-card">
            <table className="members-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>

                    <td>{user.username}</td>

                    <td>{user.email || "-"}</td>

                    <td>{user.role}</td>

                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>

                    <td>
                      <button
                        className="mr-3 text-blue-600"
                        onClick={() => {
                          setEditingUser(user);
                        }}
                      >
                        Edit
                      </button>

                      <button
                        className="text-red-600"
                        onClick={() => handleDelete(user.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {showMemberModal && (
        <CreateMemberModal
          onClose={() => setShowMemberModal(false)}
          onMemberCreated={loadUsers}
        />
      )}

      {editingUser && (
        <EditMemberModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onMemberUpdated={loadUsers}
        />
      )}
    </>
  );
}
