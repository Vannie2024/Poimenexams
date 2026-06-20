import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const AdminExamList = () => {
  const [exams, setExams] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/api/exams")
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched exams:", data);
        setExams(data);
      });
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Select Exam to View Analytics</h1>
      <div className="grid gap-4">
        {exams.map((exam) => (
          <div
            key={exam.id}
            className="p-4 bg-white border rounded shadow flex justify-between items-center"
          >
            <span>{exam.title}</span>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded"
              onClick={() => navigate(`/admin-results/${exam.id}`)}
            >
              View Results
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
