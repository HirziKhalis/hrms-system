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
  authorizeRoles("admin"),
  async (req, res) => {
    const { status } = req.body;
    const approved_by = req.user.employee_id;
    const { id } = req.params;

    try {
      const result = await pool.query(
        `UPDATE hr.overtimes
       SET status = $1, approved_by = $2, approved_at = NOW()
       WHERE overtime_id = $3
       RETURNING *`,
        [status, approved_by, id]
      );
      res.json(result.rows[0]);
    } catch (err) {
      console.error("Error updating overtime:", err);
      res.status(500).json({ message: "Failed to update overtime" });
    }
  }
);

export default router;
