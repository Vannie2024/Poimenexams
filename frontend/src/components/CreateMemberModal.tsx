// CreateMemberModal.tsx
import { useState } from "react";
import { X, Copy, CheckCircle2, UserPlus } from "lucide-react";

interface Props {
  onClose: () => void;
  onMemberCreated: () => void;
}

export default function CreateMemberModal({ onClose, onMemberCreated }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [createdUser, setCreatedUser] = useState<{
    username: string;
    password: string;
  } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const generatedUsername =
      name.toLowerCase().replace(/\s+/g, "") + Math.floor(Math.random() * 1000);

    const generatedPassword = Math.random().toString(36).slice(-8);

    try {
      const response = await fetch("http://localhost:5000/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          username: generatedUsername,
          password: generatedPassword,
        }),
      });

      if (!response.ok) {
        throw new Error();
      }

      setCreatedUser({
        username: generatedUsername,
        password: generatedPassword,
      });

      onMemberCreated();
    } catch {
      alert("Failed to create member");
    }
  }

  function copyCredentials() {
    if (!createdUser) return;

    navigator.clipboard.writeText(`
Username: ${createdUser.username}
Password: ${createdUser.password}
    `);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-shell modal-shell--lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <p className="modal-kicker">Member Management</p>
            <h2 className="modal-heading">Add New Member</h2>
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
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter full name"
                  className="modal-input"
                />
              </div>

              <div>
                <label className="modal-label">Email (Optional)</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  className="modal-input"
                />
              </div>
            </div>

            <button className="modal-submit-btn" type="submit">
              <UserPlus size={18} />
              Create Member
            </button>
          </form>

          {createdUser && (
            <div className="modal-success-panel">
              <div className="modal-success-header">
                <CheckCircle2 size={22} />
                <h3>Member Created Successfully</h3>
              </div>

              <div className="modal-credentials-grid">
                <div className="modal-credential-box">
                  <p className="modal-credential-label">Username</p>
                  <p className="modal-credential-value">
                    {createdUser.username}
                  </p>
                </div>

                <div className="modal-credential-box">
                  <p className="modal-credential-label">Password</p>
                  <p className="modal-credential-value">
                    {createdUser.password}
                  </p>
                </div>
              </div>

              <button className="modal-copy-btn" onClick={copyCredentials}>
                <Copy size={16} />
                Copy Credentials
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
