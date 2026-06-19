import "dotenv/config";
import express from "express";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import groupRoutes from "./routes/group.routes";
import examRoutes from "./routes/exam.routes";
import cors from "cors";


const app = express();
app.use(cors());
app.use(express.json());


app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/exams", examRoutes);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});