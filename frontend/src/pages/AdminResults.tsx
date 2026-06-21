import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MetricCard from "../components/MetricCard";
import Sidebar from "@/components/Sidebar";

export const AdminResults = () => {
  const { examId } = useParams();
  const [data, setData] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!examId) return;
    fetch(`http://localhost:5000/api/analytics/${examId}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched data:", data);
        setData(data);
      })
      .catch((err) => console.error("Fetch error:", err));
  }, [examId]);

  if (!data) return <div>Loading...</div>;

  console.log(
    "MEMBER KEYS",
    data.members.map((m: any) => m.attemptId),
  );
  console.log(
    "QUESTION KEYS",
    data.questionStats.map((q: any) => q.id),
  );

  return (
    <div className="dashboard-bg min-h-screen p-10">
      <Sidebar />
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <MetricCard title="Average Score" value={`${data.averageScore}%`} />

          <MetricCard title="Attempts" value={data.totalAttempts} />

          <MetricCard title="Passes" value={data.passCount} />

          <MetricCard title="Pass Rate" value={`${data.passRate}%`} />
        </div>
        <div className="mb-10">
          <p className="tracking-[0.3em] uppercase text-[#8A8250] text-sm">
            Exam Analytics
          </p>

          <h1
            className="text-5xl text-[#605A39]"
            style={{
              fontFamily: "Cormorant Garamond",
            }}
          >
            {data.title}
          </h1>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="p-6 bg-white border rounded-xl shadow-sm">
            <p className="text-sm text-gray-500">Class Average</p>
            <p className="text-3xl font-bold">{data.averageScore}%</p>
          </div>
          <div className="p-6 bg-white border rounded-xl shadow-sm">
            <p className="text-sm text-gray-500">Attempts Completed</p>
            <p className="text-3xl font-bold">{data.totalAttempts}</p>
          </div>
        </div>

        <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4">Student</th>
                <th className="p-4">Score</th>
                <th className="p-4">Status</th>
                <th className="p-4">Answer Sheet</th>
              </tr>
            </thead>
            <tbody>
              {(data?.members || []).map((m: any) => (
                <tr key={m.attemptId} className="border-t">
                  <td className="p-4">{m.name}</td>

                  <td className="p-4 font-semibold">{m.percentage}%</td>

                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        m.passed
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {m.passed ? "PASSED" : "FAILED"}
                    </span>
                  </td>

                  <td className="p-4">
                    <button
                      className="
                        bg-blue-600
                        text-white
                        px-3
                        py-2
                        rounded-lg
                    "
                      onClick={() => navigate(`/answer-sheet/${m.attemptId}`)}
                    >
                      View Answer Sheet
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <h2 className="text-xl font-bold mt-10 mb-4">Question Analysis</h2>

          {(data.questionStats || []).map((q: any) => (
            <div
              key={q.id}
              className="
                    bg-white
                    border
                    p-4
                    rounded-xl
                    mb-3
                "
            >
              <div>{q.question}</div>

              <div>
                Correct Rate:
                {q.correctRate}%
              </div>

              <div>
                Difficulty:
                {q.difficulty}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
