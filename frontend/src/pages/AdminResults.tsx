import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export const AdminResults = () => {
  const { examId } = useParams();
  const [data, setData] = useState<any>(null);

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

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">{data.title} - Analytics</h1>

      {/* Metric Cards */}
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

      {/* Results Table */}
      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4">Student</th>
              <th className="p-4">Score</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {data?.members?.map((m: any) => (
              <tr key={m.id} className="border-t">
                <td className="p-4">{m.name}</td>
                <td className="p-4 font-semibold">{m.score}%</td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 rounded text-xs ${m.passed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                  >
                    {m.passed ? "PASSED" : "FAILED"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
