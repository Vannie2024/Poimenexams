import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { UserMinus, UserPlus } from "lucide-react";
import Sidebar from "../components/Sidebar";
import { API_URL } from "@/config";

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
      const response = await fetch(`${API_URL}/api/groups/${id}`);

      const data = await response.json();

      setGroup(data);
    } catch (error) {
      console.error(error);
    }
  }

  async function loadUsers() {
    try {
      const response = await fetch(`${API_URL}/api/users`);

      const data = await response.json();

      setUsers(data);
    } catch (error) {
      console.error(error);
    }
  }

  async function addMember(userId: string) {
    try {
      await fetch(`${API_URL}/api/groups/${id}/members`, {
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
      await fetch(`${API_URL}/api/groups/${id}/members/${userId}`, {
        method: "DELETE",
      });

      loadGroup();
    } catch (error) {
      console.error(error);
    }
  }

  function initials(name: string) {
    return name
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
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

      <main className="group-detail-main">
        <p className="group-detail-kicker">Group Profile</p>
        <h1 className="group-detail-title">{group.name}</h1>
        <p className="group-detail-desc">
          {group.description || "No description provided for this group."}
        </p>

        <div className="group-detail-body">
          {/* MEMBERS */}
          <div className="member-list-card">
            <div className="member-list-header">
              <span className="member-list-title">Group Members</span>
              <span className="member-list-count">
                {group.members?.length || 0} total
              </span>
            </div>

            {!group.members || group.members.length === 0 ? (
              <div className="member-list-empty">
                No members in this group yet.
              </div>
            ) : (
              group.members.map((member: any) => (
                <div key={member.id} className="member-row">
                  <div className="member-row-left">
                    <div className="member-avatar">
                      {initials(member.user.name)}
                    </div>

                    <div>
                      <p className="member-name">{member.user.name}</p>
                      <p className="member-username">{member.user.username}</p>
                    </div>
                  </div>

                  <button
                    className="member-row-action member-row-action--remove"
                    onClick={() => removeMember(member.user.id)}
                  >
                    <UserMinus size={14} />
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>

          {/* ADD MEMBERS */}
          <div className="member-list-card">
            <div className="member-list-header">
              <span className="member-list-title">Add Members</span>
              <span className="member-list-count">{users.length} total</span>
            </div>

            {users.length === 0 ? (
              <div className="member-list-empty">No members available.</div>
            ) : (
              users.map((user) => (
                <div key={user.id} className="member-row">
                  <div className="member-row-left">
                    <div className="member-avatar">{initials(user.name)}</div>

                    <div>
                      <p className="member-name">{user.name}</p>
                      <p className="member-username">{user.username}</p>
                    </div>
                  </div>

                  <button
                    className="member-row-action member-row-action--add"
                    onClick={() => addMember(user.id)}
                  >
                    <UserPlus size={14} />
                    Add
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
