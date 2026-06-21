import { useEffect, useState } from "react";
import { X, FileSpreadsheet } from "lucide-react";

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
    console.log("userId =", localStorage.getItem("userId"));

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
        groupIds: selectedGroups || [],
      }),
    });

    onExamCreated();
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-shell modal-shell--lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <p className="modal-kicker">Exam Management</p>
            <h2 className="modal-heading">Create Exam</h2>
          </div>

          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmit} className="modal-form">
            <div>
              <label className="modal-label">Exam Title</label>
              <input
                className="modal-input"
                placeholder="e.g. Midterm Bible Study"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="modal-label">Description</label>
              <textarea
                className="modal-input"
                placeholder="Brief description of the exam"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="modal-form-grid">
              <div>
                <label className="modal-label">Duration (minutes)</label>
                <input
                  className="modal-input"
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                />
              </div>

              <div>
                <label className="modal-label">Pass Mark (%)</label>
                <input
                  className="modal-input"
                  type="number"
                  value={passMark}
                  onChange={(e) => setPassMark(Number(e.target.value))}
                />
              </div>
            </div>

            <div>
              <label className="modal-label">Marking System</label>
              <select
                className="modal-input"
                value={markingSystem}
                onChange={(e) => setMarkingSystem(e.target.value)}
              >
                <option value="STANDARD">Standard</option>
                <option value="NEGATIVE">Negative</option>
                <option value="CUSTOM">Custom</option>
              </select>
            </div>

            <div className="modal-form-grid">
              <div>
                <label className="modal-label">Marks for Correct Answer</label>
                <input
                  className="modal-input"
                  type="number"
                  value={correctMarks}
                  onChange={(e) => setCorrectMarks(Number(e.target.value))}
                />
              </div>

              <div>
                <label className="modal-label">Marks for Wrong Answer</label>
                <input
                  className="modal-input"
                  type="number"
                  value={wrongMarks}
                  onChange={(e) => setWrongMarks(Number(e.target.value))}
                />
              </div>
            </div>

            <div>
              <p className="modal-section-label">Assign Groups</p>
              <p className="modal-section-hint">
                Choose which groups can take this exam
              </p>

              <div className="modal-checklist">
                {groups.map((group) => (
                  <label key={group.id} className="modal-checkbox-item">
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
                    <span>{group.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <button className="modal-submit-btn" type="submit">
              <FileSpreadsheet size={18} />
              Create Exam
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
