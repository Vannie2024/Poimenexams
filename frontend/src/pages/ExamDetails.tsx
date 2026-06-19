import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function ExamDetails() {
  const { id } = useParams();

  const [exam, setExam] = useState<any>(null);

  useEffect(() => {
    loadExam();
  }, []);

  async function loadExam() {
    const response = await fetch(`http://localhost:5000/api/exams/${id}`);

    const data = await response.json();

    setExam(data);
  }

  if (!exam) {
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

      <main className="flex-1 p-8">
        <div className="page-header">
          <div>
            <h1>{exam.title}</h1>

            <p>{exam.description}</p>
          </div>
        </div>

        <div className="table-card mb-8">
          <h2>Exam Settings</h2>

          <p>
            Duration: {exam.duration}
            mins
          </p>

          <p>Pass Mark: {exam.passMark}%</p>

          <p>Marking: {exam.markingSystem}</p>
        </div>

        <div className="table-card mb-8">
          <h2>Assigned Groups</h2>

          {exam.examGroups?.map((item: any) => (
            <div key={item.id}>{item.group.name}</div>
          ))}
        </div>

        <div className="table-card">
          <div className="flex justify-between">
            <h2>Questions ({exam.questions?.length || 0})</h2>

            <button className="action-btn">Add Question</button>
          </div>
        </div>
      </main>
    </div>
  );
}
