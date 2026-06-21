import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/Sidebar";

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
    <div className="dashboard-bg min-h-screen p-10">
      <Sidebar />
      <div className="max-w-7xl mx-auto">
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
            Results & Performance
          </h1>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {exams.map((exam) => (
            <div
              key={exam.id}
              className="
                bg-white
                rounded-3xl
                p-8
                border
                border-[#E5DDCC]
                shadow-sm
                "
            >
              <h2 className="text-2xl font-semibold text-[#605A39]">
                {exam.title}
              </h2>

              <p className="text-gray-500 mt-2">
                {exam.description || "No description available"}
              </p>

              <button
                onClick={() => navigate(`/admin-results/${exam.id}`)}
                className="
                    mt-6
                    bg-[#8A8250]
                    hover:bg-[#746c43]
                    text-white
                    px-5
                    py-3
                    rounded-xl
                    transition
                "
              >
                View Analytics
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
