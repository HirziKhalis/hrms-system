import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./db.js";
import { authenticateToken } from "./middleware/auth.js";
import authRoutes from "./routes/auth.js";
import employeeRoutes from "./routes/employees.js";
import leaveRequestRoutes from "./routes/leaveRequests.js";
import userRoutes from "./routes/users.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/employees", authenticateToken, employeeRoutes); // All employee routes are protected
app.use("/leave-requests", leaveRequestRoutes);

app.listen(port, () => {
  console.log(`HRMS backend running on http://localhost:${port}`);
});
