import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import "./index.css";
import Members from "./pages/Members";
import Groups from "./pages/Groups";
import GroupDetails from "./pages/GroupDetails";
import Exams from "./pages/Exam";
import ExamDetails from "./pages/ExamDetails";
import StudentDashboard from "./pages/StudentDashboard";
import { ExamResults } from "./pages/ExamResults";
import { TakeExam } from "./pages/TakeExam";
import { AdminResults } from "./pages/AdminResults";
import { AdminExamList } from "./pages/AdminExamList";
import AnswerSheet from "./pages/AnswerSheet";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/members" element={<Members />} />
        <Route path="/groups" element={<Groups />} />
        <Route path="/groups/:id" element={<GroupDetails />} />
        <Route path="/exams" element={<Exams />} />
        <Route path="/exams/:id" element={<ExamDetails />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/exam-results/:attemptId" element={<ExamResults />} />
        <Route path="/takeexam/:examId" element={<TakeExam />} />
        <Route path="/admin-results/:examId" element={<AdminResults />} />
        <Route path="/admin-results" element={<AdminExamList />} />
        <Route path="/answer-sheet/:attemptId" element={<AnswerSheet />} />
        <Route path="/results" element={<AdminExamList />} />
        <Route path="/student/results/:attemptId" element={<AnswerSheet />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
