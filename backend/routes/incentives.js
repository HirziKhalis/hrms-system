import express from "express";
import { pool } from "../db.js";
import { authenticateToken, authorizeRoles } from "../middleware/auth.js";

const router = express.Router();

// Get all incentives (Admin only)
router.get("/", authenticateToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT i.*, e.first_name || ' ' || e.last_name AS employee_name
      FROM hr.incentives i
      JOIN hr.employees e ON i.employee_id = e.employee_id
      ORDER BY date_awarded DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching incentives:", err);
    res.status(500).json({ message: "Failed to fetch incentives" });
  }
});

// Create new incentive (Admin only)
router.post("/", authenticateToken, authorizeRoles("admin"), async (req, res) => {
  const { employee_id, title, description, points, monetary_value } = req.body;
  const awarded_by = req.user.employee_id;

  try {
    const result = await pool.query(
      `INSERT INTO hr.incentives (employee_id, title, description, points, monetary_value, awarded_by)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [employee_id, title, description, points, monetary_value, awarded_by]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating incentive:", err);
    res.status(500).json({ message: "Failed to create incentive" });
  }
});

export default router;
