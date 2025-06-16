// routes/overtime.js
import express from "express";
import { authenticateToken, authorizeRoles } from "../middleware/auth.js";
import { pool } from "../db.js";

const router = express.Router();

// GET /api/overtime — Get current user's overtime requests
router.get("/", authenticateToken, async (req, res) => {
  const employee_id = req.user.employee_id;

  try {
    const result = await pool.query(
      `SELECT * FROM hr.overtimes WHERE employee_id = $1 ORDER BY date DESC`,
      [employee_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching overtime:", err);
    res.status(500).json({ message: "Failed to fetch overtime records" });
  }
});

// GET /api/overtime/all — Admin: Get all overtime requests with employee name
router.get(
  "/all",
  authenticateToken,
  authorizeRoles("admin", "manager"),
  async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT
        o.overtime_id,
        o.employee_id,
        e.first_name || ' ' || e.last_name AS employee_name,
        sup.first_name || ' ' || sup.last_name AS supervisor_name,
        o.date,
        o.hours,
        o.reason,
        o.status,
        o.submitted_at,
        o.approved_at,
        o.approved_by
        FROM hr.overtimes o
        JOIN hr.employees e ON o.employee_id = e.employee_id
        JOIN hr.employees sup ON e.supervisor_id = sup.employee_id
        ORDER BY o.date DESC
`);

      res.json(result.rows);
    } catch (err) {
      console.error("Error fetching overtime:", err);
      res.status(500).json({ message: "Failed to fetch overtime records" });
    }
  }
);

// POST /api/overtime — Submit overtime request
router.post("/", authenticateToken, async (req, res) => {
  const { date, hours, reason } = req.body;
  const employee_id = req.user.employee_id;

  try {
    const result = await pool.query(
      `INSERT INTO hr.overtimes (employee_id, date, hours, reason)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [employee_id, date, hours, reason]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error submitting overtime:", err);
    res.status(500).json({ message: "Failed to submit overtime" });
  }
});

// PATCH /api/overtime/:id — Admin approves/rejects
router.patch(
  "/:id",
  authenticateToken,
  authorizeRoles("admin", "manager"),
  async (req, res) => {
    const { status } = req.body;
    const supervisorId = req.user.employee_id;
    const role = req.user.role || req.user.role_name;
    const { id } = req.params;

    try {
      // Get the employee ID of the overtime request
      const overtimeResult = await pool.query(
        `SELECT employee_id FROM hr.overtimes WHERE overtime_id = $1`,
        [id]
      );

      if (overtimeResult.rowCount === 0) {
        return res.status(404).json({ message: "Overtime request not found" });
      }

      const { employee_id } = overtimeResult.rows[0];

      // If not admin, enforce supervisor check
      if (role !== "admin") {
        const checkSupervisor = await pool.query(
          `SELECT 1 FROM hr.employees WHERE employee_id = $1 AND supervisor_id = $2`,
          [employee_id, supervisorId]
        );

        if (checkSupervisor.rowCount === 0) {
          return res.status(403).json({
            message: "You are not authorized to approve this request",
          });
        }
      }

      // Proceed to approve/reject
      const result = await pool.query(
        `UPDATE hr.overtimes
         SET status = $1, approved_by = $2, approved_at = NOW()
         WHERE overtime_id = $3
         RETURNING *`,
        [status, supervisorId, id]
      );

      res.json(result.rows[0]);
    } catch (err) {
      console.error("Error updating overtime:", err);
      res.status(500).json({ message: "Failed to update overtime" });
    }
  }
);

export default router;
