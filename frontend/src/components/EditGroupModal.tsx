import { useState } from "react";
import { X, Save } from "lucide-react";

interface Props {
  group: {
    id: string;
    name: string;
    description?: string;
  };

  onClose: () => void;
  onGroupUpdated: () => void;
}

export default function EditGroupModal({
  group,
  onClose,
  onGroupUpdated,
}: Props) {
  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState(group.description || "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    await fetch(`http://localhost:5000/api/groups/${group.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        description,
      }),
    });

    onGroupUpdated();
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-shell" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <p className="modal-kicker">Group Management</p>
            <h2 className="modal-heading">Edit Group</h2>
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
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="modal-label">Description</label>
              <textarea
                className="modal-input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
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
