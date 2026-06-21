import { useState } from "react";
import { X, FolderPlus } from "lucide-react";

interface Props {
  onClose: () => void;
  onGroupCreated: () => void;
}

export default function CreateGroupModal({ onClose, onGroupCreated }: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    await fetch("http://localhost:5000/api/groups", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        description,
      }),
    });

    onGroupCreated();
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-shell" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <p className="modal-kicker">Group Management</p>
            <h2 className="modal-heading">Create Group</h2>
          </div>

          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmit} className="modal-form">
            <div>
              <label className="modal-label">Group Name</label>
              <input
                className="modal-input"
                placeholder="e.g. Youth Ministry"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="modal-label">Description</label>
              <textarea
                className="modal-input"
                placeholder="What is this group about?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <button className="modal-submit-btn" type="submit">
              <FolderPlus size={18} />
              Create Group
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
