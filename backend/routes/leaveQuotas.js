// backend/routes/leaveQuotas.js

import express from "express";
import { pool } from "../db.js";
import { authenticateToken } from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/auth.js";

const router = express.Router();

router.get(
  "/",
  authenticateToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const year = new Date().getFullYear();
      const limit = parseInt(req.query.limit) || 8;
      const page = parseInt(req.query.page) || 1;
      const offset = (page - 1) * limit;

      // Step 1: Get total number of employees
      const totalEmployeesRes = await pool.query(
        "SELECT COUNT(*) FROM hr.employees"
      );
      const totalEmployees = parseInt(totalEmployeesRes.rows[0].count);

      // Step 2: Get paginated employees
      const employeesRes = await pool.query(
        `SELECT employee_id, first_name, last_name FROM hr.employees ORDER BY last_name, first_name LIMIT $1 OFFSET $2`,
        [limit, offset]
      );
      const employees = employeesRes.rows;

      // Step 3: Get all leave types
      const leaveTypesRes = await pool.query(
        "SELECT leave_type_id, type_name, default_days FROM hr.leave_types"
      );
      const leaveTypes = leaveTypesRes.rows;

      const results = [];

      // Step 4: Build quota data for each employee and leave type
      for (const emp of employees) {
        for (const lt of leaveTypes) {
          // Get quota
          const quotaRes = await pool.query(
            `SELECT total_days FROM hr.leave_quotas
           WHERE employee_id = $1 AND leave_type_id = $2 AND year = $3`,
            [emp.employee_id, lt.leave_type_id, year]
          );

          const total_days = quotaRes.rows[0]?.total_days ?? lt.default_days;

          // Get used days
          const usedDaysRes = await pool.query(
            `SELECT COALESCE(SUM(DATE(end_date) - DATE(start_date) + 1), 0) AS used
           FROM hr.leave_requests
           WHERE employee_id = $1 AND leave_type_id = $2 AND status = 'approved' AND EXTRACT(YEAR FROM start_date) = $3`,
            [emp.employee_id, lt.leave_type_id, year]
          );

          const used_days = parseInt(usedDaysRes.rows[0].used);
          const remaining_days = total_days - used_days;

          results.push({
            employee_id: emp.employee_id,
            employee_name: `${emp.first_name} ${emp.last_name}`,
            leave_type_id: lt.leave_type_id,
            type_name: lt.type_name,
            total_days,
            used_days,
            remaining_days,
          });
        }
      }

      res.json({
        data: results,
        currentPage: page,
        totalPages: Math.ceil(totalEmployees / limit),
      });
    } catch (err) {
      console.error("Error fetching paginated leave quotas:", err);
      res.status(500).send("Server error");
    }
  }
);

// 🔹 Update quotas for an employee
router.put(
  "/:employeeId",
  authenticateToken,
  authorizeRoles("admin"),
  async (req, res) => {
    const { employeeId } = req.params;
    const { quotas, year } = req.body;

    try {
      for (const { leave_type_id, total_days } of quotas) {
        await pool.query(
          `INSERT INTO hr.leave_quotas (employee_id, leave_type_id, year, total_days)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (employee_id, leave_type_id, year)
         DO UPDATE SET total_days = EXCLUDED.total_days`,
          [employeeId, leave_type_id, year, total_days]
        );
      }

      res.status(200).send("Quotas updated");
    } catch (err) {
      console.error("Error updating quotas:", err);
      res.status(500).send("Failed to update quotas");
    }
  }
);

export default router;
