import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./db.js";
import { authenticateToken } from "./middleware/auth.js";
import authRoutes from "./routes/auth.js";
import employeeRoutes from "./routes/employees.js";
import leaveRequestRoutes from "./routes/leaveRequests.js";
import leaveQuotasRouter from "./routes/leaveQuotas.js";
import overtimeRoutes from "./routes/overtime.js";
import userRoutes from "./routes/users.js";
import attendanceRoutes from "./routes/attendance.js";
import payrollRoutes from "./routes/payroll.js";
import incentivesRouter from "./routes/incentives.js";
import referralsRouter from "./routes/referrals.js";
import holidayRoutes from "./routes/holidays.js";
import "./jobs/cronJobs.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/employees", authenticateToken, employeeRoutes);
app.use("/api/leave-requests", leaveRequestRoutes);
app.use("/api/leave-quotas", leaveQuotasRouter);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/payroll", payrollRoutes);
app.use("/api/incentives", incentivesRouter);
app.use("/api/referrals", referralsRouter);
app.use("/api/overtime", overtimeRoutes);
app.use("/api/holidays", holidayRoutes);

app.get("/", (req, res) => {
  res.send("HRMS API is running 🚀");
});

app.listen(port, () => {
  console.log(`HRMS backend running on http://localhost:${port}`);
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong" });
});
