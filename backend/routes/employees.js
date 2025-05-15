// routes/employees.js
import express from "express";
import { pool } from '../db.js';
import { authorizeRoles } from "../middleware/auth.js";

const router = express.Router();

// List employees
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM hr.employees ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Get single employee
router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM hr.employees WHERE employee_id = $1",
      [req.params.id]
    );
    if (result.rows.length === 0)
      return res.status(404).send("Employee not found");
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Create new employee (Admin only)
router.post("/", authorizeRoles("admin"), async (req, res) => {
  const {
    first_name,
    last_name,
    email,
    phone,
    department,
    position,
    supervisor_id,
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO hr.employees (first_name, last_name, email, phone, department, position, supervisor_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [first_name, last_name, email, phone, department, position, supervisor_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Update employee (Admin only for now)
router.put("/:id", authorizeRoles("admin"), async (req, res) => {
  const {
    first_name,
    last_name,
    email,
    phone,
    department,
    position,
    supervisor_id,
    status,
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE hr.employees
       SET first_name=$1, last_name=$2, email=$3, phone=$4, department=$5,
           position=$6, supervisor_id=$7, status=$8, updated_at=NOW()
       WHERE employee_id = $9 RETURNING *`,
      [
        first_name,
        last_name,
        email,
        phone,
        department,
        position,
        supervisor_id,
        status,
        req.params.id,
      ]
    );

    if (result.rows.length === 0)
      return res.status(404).send("Employee not found");
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Delete employee (Admin only)
router.delete("/:id", authorizeRoles("admin"), async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM hr.employees WHERE employee_id = $1 RETURNING *",
      [req.params.id]
    );
    if (result.rows.length === 0)
      return res.status(404).send("Employee not found");
    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

export default router;
