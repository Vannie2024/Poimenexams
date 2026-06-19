import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { isAdmin } from "../utilis/auth";

interface Props {
  onClose: () => void;
  onExamCreated: () => void;
}

export default function CreateExamModal({ onClose, onExamCreated }: Props) {
  const [groups, setGroups] = useState<any[]>([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(60);
  const [passMark, setPassMark] = useState(50);

  const [markingSystem, setMarkingSystem] = useState("STANDARD");

  const [correctMarks, setCorrectMarks] = useState(1);

  const [wrongMarks, setWrongMarks] = useState(0);

  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);

  if (!isAdmin()) {
    return null;
  }

  useEffect(() => {
    loadGroups();
  }, []);

  async function loadGroups() {
    const response = await fetch("http://localhost:5000/api/groups");

    const data = await response.json();

    setGroups(data);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    await fetch("http://localhost:5000/api/exams", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        description,
        duration,
        passMark,
        markingSystem,
        correctMarks,
        wrongMarks,
        creatorId: localStorage.getItem("userId"),
        groupIds: selectedGroups,
      }),
    });

    onExamCreated();
    onClose();
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-8 w-full max-w-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between mb-6">
          <h2>Create Exam</h2>

          <button onClick={onClose}>
            <X />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="modal-input"
            placeholder="Exam title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea
            className="modal-input"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <input
            className="modal-input"
            type="number"
            placeholder="Duration"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
          />

          <input
            className="modal-input"
            type="number"
            placeholder="Pass Mark"
            value={passMark}
            onChange={(e) => setPassMark(Number(e.target.value))}
          />

          <select
            className="modal-input"
            value={markingSystem}
            onChange={(e) => setMarkingSystem(e.target.value)}
          >
            <option value="STANDARD">Standard</option>

            <option value="NEGATIVE">Negative</option>

            <option value="CUSTOM">Custom</option>
          </select>

          <input
            className="modal-input"
            type="number"
            placeholder="Correct Marks"
            value={correctMarks}
            onChange={(e) => setCorrectMarks(Number(e.target.value))}
          />

          <input
            className="modal-input"
            type="number"
            placeholder="Wrong Marks"
            value={wrongMarks}
            onChange={(e) => setWrongMarks(Number(e.target.value))}
          />

          <div>
            <h3 className="mb-3">Assign Groups</h3>

            {groups.map((group) => (
              <label key={group.id} className="block">
                <input
                  type="checkbox"
                  checked={selectedGroups.includes(group.id)}
                  onChange={() => {
                    if (selectedGroups.includes(group.id)) {
                      setSelectedGroups(
                        selectedGroups.filter((id) => id !== group.id),
                      );
                    } else {
                      setSelectedGroups([...selectedGroups, group.id]);
                    }
                  }}
                />

                <span className="ml-2">{group.name}</span>
              </label>
            ))}
          </div>

          <button className="action-btn w-full" type="submit">
            Create Exam
          </button>
        </form>
      </div>
    </div>
  );
}
