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
          max-w-6xl
          min-h-100
          bg-[#FBF9F4]
          shadow-[0_25px_80px_rgba(0,0,0,0.15)]
          overflow-hidden
          border border-[#E5DDCC]
        "
      >
        {/* HEADER */}
        <div
          className="
            px-12 py-10
            border-b border-[#E5DDCC]
            flex items-center justify-between
          "
        >
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-[#8A8250]">
              Member Management
            </p>

            <h2
              className="
                text-4xl
                text-[#605A39]
                mt-1
              "
              style={{
                fontFamily: "Cormorant Garamond",
              }}
            >
              Add New Member
            </h2>
          </div>

          <button
            onClick={onClose}
            className="
              w-11 h-11
              rounded-xl
              bg-white
              hover:bg-[#F2EEE3]
              transition
              flex items-center justify-center
            "
          >
            <X size={22} />
          </button>
        </div>

        {/* FORM */}
        <div className="p-10">
          <form onSubmit={handleSubmit} className="space-y-6 ">
            <div className="grid md:grid-cols-2 gap-6">
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

            <button
              type="submit"
              className="
                w-full
                bg-[#8A8250]
                hover:bg-[#746C43]
                text-white
                py-4
                rounded-2xl
                font-medium
                transition
                flex items-center justify-center gap-3
              "
            >
              <UserPlus size={18} />
              Create Member
            </button>
          </form>

          {createdUser && (
            <div
              className="
                mt-8
                bg-white
                border border-[#E5DDCC]
                rounded-3xl
                p-6
              "
            >
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle2 className="text-green-600" size={22} />

                <h3 className="font-semibold text-lg">
                  Member Created Successfully
                </h3>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div
                  className="
                    bg-[#F6F1E8]
                    rounded-2xl
                    p-4
                  "
                >
                  <p className="text-sm text-[#8A8250]">Username</p>

                  <p className="font-semibold text-lg">
                    {createdUser.username}
                  </p>
                </div>

                <div
                  className="
                    bg-[#F6F1E8]
                    rounded-2xl
                    p-4
                  "
                >
                  <p className="text-sm text-[#8A8250]">Password</p>

                  <p className="font-semibold text-lg">
                    {createdUser.password}
                  </p>
                </div>
              </div>

              <button
                onClick={copyCredentials}
                className="
                  mt-5
                  bg-[#605A39]
                  hover:bg-[#4E482C]
                  text-white
                  px-5
                  py-3
                  rounded-xl
                  flex items-center gap-2
                "
              >
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
