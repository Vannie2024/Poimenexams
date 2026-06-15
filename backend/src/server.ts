import express from "express";
import authRoutes from "./routes/auth.routes.ts";
import userRoutes from "./routes/user.routes.ts";
import cors from "cors";


const app = express();
app.use(cors());
app.use(express.json());


app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.listen(5000, () => {
  console.log("Server running on port 5000");
});