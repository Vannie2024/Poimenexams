// EditMemberModal.tsx
import { useState } from "react";
import { X, Save } from "lucide-react";
import toast from "react-hot-toast";
import { API_URL } from "@/config";

interface User {
  id: string;
  name: string;
  email?: string;
  role: string;
}

interface Props {
  user: User;
  onClose: () => void;
  onMemberUpdated: () => void;
}

export default function EditMemberModal({
  user,
  onClose,
  onMemberUpdated,
}: Props) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email || "");
  const [role, setRole] = useState(user.role);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/api/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          role,
        }),
      });

      if (!response.ok) {
        throw new Error();
      }

      onMemberUpdated();
      onClose();
    } catch {
      toast("Failed to update member");
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-shell" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <p className="modal-kicker">Member Management</p>
            <h2 className="modal-heading">Edit Member</h2>
          </div>

          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmit} className="modal-form">
            <div className="modal-form-grid">
              <div>
                <label className="modal-label">Full Name</label>
                <input
                  className="modal-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="modal-label">Email</label>
                <input
                  className="modal-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="modal-label">Role</label>
              <select
                className="modal-input"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="ADMIN">Administrator</option>
                <option value="TEACHER">Teacher</option>
                <option value="STUDENT">Student</option>
              </select>
            </div>

            <button className="modal-submit-btn" type="submit">
              <Save size={18} />
              Save Changes
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
