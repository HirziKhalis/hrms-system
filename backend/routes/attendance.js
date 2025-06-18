import express from "express";
import { pool } from "../db.js";
import { authenticateToken, authorizeRoles } from "../middleware/auth.js";
import { paginateQuery } from "../utils/pagination.js";

const router = express.Router();

// Employee Check-in
router.post("/check-in", authenticateToken, async (req, res) => {
  const employeeId = req.user.employee_id;

  try {
    const { notes } = req.body;

    // Prevent multiple check-ins per day
    const existing = await pool.query(
      `SELECT 1 FROM hr.attendance
       WHERE employee_id = $1 AND attendance_date = CURRENT_DATE`,
      [employeeId]
    );

    if (existing.rowCount > 0) {
      return res.status(400).json({ message: "Already checked in today" });
    }

    const result = await pool.query(
      `INSERT INTO hr.attendance (
          attendance_id, employee_id, check_in, status, notes, attendance_date
       ) VALUES (
          gen_random_uuid(), $1, NOW(), 'present', $2, CURRENT_DATE
       )
       RETURNING *`,
      [employeeId, notes || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Employee Check-out
router.patch("/check-out", authenticateToken, async (req, res) => {
  const employeeId = req.user.employee_id;

  try {
    const { rows } = await pool.query(
      `SELECT * FROM hr.attendance
   WHERE employee_id = $1 AND attendance_date = CURRENT_DATE AND status = 'present'`,
      [employeeId]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: "No check-in found for today" });
    }

    const attendance = rows[0];

    if (attendance.check_out) {
      return res.status(400).json({ message: "Already checked out for today" });
    }

    const result = await pool.query(
      `UPDATE hr.attendance
       SET check_out = NOW(), updated_at = NOW()
       WHERE attendance_id = $1
       RETURNING *`,
      [attendance.attendance_id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Get logged-in user's attendance
router.get("/my", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, e.first_name || ' ' || e.last_name AS employee_name
       FROM hr.attendance a
       JOIN hr.employees e ON a.employee_id = e.employee_id
       WHERE a.employee_id = $1
       ORDER BY a.attendance_date DESC`,
      [req.user.employee_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Admin: Get all attendance records
router.get(
  "/",
  authenticateToken,
  authorizeRoles("admin"),
  async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const baseQuery = `
      SELECT
        a.*,
        e.first_name || ' ' || e.last_name AS employee_name
      FROM hr.attendance a
      JOIN hr.employees e ON a.employee_id = e.employee_id
      ORDER BY a.attendance_date DESC
    `;

    const countQuery = `
      SELECT COUNT(*)
      FROM hr.attendance
    `;

    try {
      const result = await paginateQuery(
        pool,
        baseQuery,
        countQuery,
        [],
        page,
        limit
      );
      res.json(result);
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  }
);

export default router;
