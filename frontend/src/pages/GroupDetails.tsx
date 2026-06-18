import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function GroupDetails() {
  const { id } = useParams();

  const [group, setGroup] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    loadGroup();
    loadUsers();
  }, []);

  async function loadGroup() {
    try {
      const response = await fetch(`http://localhost:5000/api/groups/${id}`);

      const data = await response.json();

      setGroup(data);
    } catch (error) {
      console.error(error);
    }
  }

  async function loadUsers() {
    try {
      const response = await fetch("http://localhost:5000/api/users");

      const data = await response.json();

      setUsers(data);
    } catch (error) {
      console.error(error);
    }
  }

  async function addMember(userId: string) {
    try {
      await fetch(`http://localhost:5000/api/groups/${id}/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
        }),
      });

      loadGroup();
    } catch (error) {
      console.error(error);
    }
  }

  async function removeMember(userId: string) {
    try {
      await fetch(`http://localhost:5000/api/groups/${id}/members/${userId}`, {
        method: "DELETE",
      });

      loadGroup();
    } catch (error) {
      console.error(error);
    }
  }

  if (!group) {
    return (
      <div className="dashboard-bg min-h-screen flex">
        <Sidebar />

        <main className="flex-1 p-8">Loading...</main>
      </div>
    );
  }

  return (
    <div className="dashboard-bg min-h-screen flex">
      <Sidebar />

      <main className="flex-1 p-8">
        <div className="page-header">
          <div>
            <h1>{group.name}</h1>

            <p>{group.description || "No description"}</p>
          </div>
        </div>

        {/* MEMBERS */}
        <div className="table-card mb-8">
          <h2 className="mb-6 text-xl font-semibold">Group Members</h2>

          <div className="space-y-3">
            {group.members?.map((member: any) => (
              <div
                key={member.id}
                className="flex justify-between items-center border-b pb-3"
              >
                <div>
                  <p className="font-medium">{member.user.name}</p>

                  <p className="text-sm text-gray-500">
                    {member.user.username}
                  </p>
                </div>

                <button
                  className="text-red-600"
                  onClick={() => removeMember(member.user.id)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ADD MEMBERS */}
        <div className="table-card">
          <h2 className="mb-6 text-xl font-semibold">Add Members</h2>

          <div className="space-y-3">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex justify-between items-center border-b pb-3"
              >
                <div>
                  <p className="font-medium">{user.name}</p>

                  <p className="text-sm text-gray-500">{user.username}</p>
                </div>

                <button
                  className="text-green-600"
                  onClick={() => addMember(user.id)}
                >
                  Add
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
