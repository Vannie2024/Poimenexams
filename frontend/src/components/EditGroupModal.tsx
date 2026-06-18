import { useState } from "react";
import { X } from "lucide-react";

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
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white p-8 rounded-2xl w-full max-w-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between mb-6">
          <h2>Edit Group</h2>

          <button onClick={onClose}>
            <X />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="modal-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <textarea
            className="modal-input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <button className="action-btn w-full" type="submit">
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}
