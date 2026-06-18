import { useState } from "react";
import { X, Save } from "lucide-react";

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
      const response = await fetch(
        `http://localhost:5000/api/users/${user.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            role,
          }),
        },
      );

      if (!response.ok) {
        throw new Error();
      }

      onMemberUpdated();
      onClose();
    } catch {
      alert("Failed to update member");
    }
  }

  return (
    <div
      className="
        fixed inset-0 z-50
        bg-black/50
        backdrop-blur-md
        flex items-center justify-center
        p-6
      "
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="
          w-full
          max-w-3xl
          min-h-125
          bg-[#FBF9F4]
          rounded-2xl
          border border-[#E5DDCC]
          shadow-[0_25px_80px_rgba(0,0,0,0.15)]
        "
      >
        {/* Header */}
        <div
          className="
            flex items-center justify-between
            px-10 py-8
            border-b border-[#E5DDCC]
          "
        >
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-[#8A8250]">
              Member Management
            </p>

            <h2
              className="text-4xl text-[#605A39]"
              style={{
                fontFamily: "Cormorant Garamond",
              }}
            >
              Edit Member
            </h2>
          </div>

          <button
            onClick={onClose}
            className="
              w-10 h-10
              rounded-lg
              hover:bg-[#F2EEE3]
              flex items-center justify-center
            "
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div
          className="
            p-12
            min-h-87.5
            flex flex-col justify-center
          "
        >
          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="grid md:grid-cols-2 gap-6">
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

            <button
              type="submit"
              className="
                w-full
                bg-[#8A8250]
                hover:bg-[#746C43]
                text-white
                py-4
                rounded-xl
                flex items-center
                justify-center
                gap-3
              "
            >
              <Save size={18} />
              Save Changes
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
