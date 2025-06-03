import express from "express";
import { pool } from "../db.js";
import { authenticateToken, authorizeRoles } from "../middleware/auth.js";

const router = express.Router();

// GET all payrolls (admin only)
router.get(
  "/",
  authenticateToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const result = await pool.query(`
       SELECT
        p.payroll_id,
        CONCAT(e.first_name, ' ', e.last_name) AS full_name,
        p.month,
        p.base_salary,
        p.bonus,
        p.deductions,
        p.net_salary
      FROM hr.payrolls p
      JOIN hr.employees e ON p.employee_id = e.employee_id
      ORDER BY p.month DESC;
    `);
      res.json(result.rows);
    } catch (err) {
      console.error("Error fetching payrolls:", err);
      res.status(500).send("Server error");
    }
  }
);

// POST a new payroll entry (admin only)
router.post(
  "/",
  authenticateToken,
  authorizeRoles("admin"),
  async (req, res) => {
    const { employee_id, month, base_salary, bonus, deductions } = req.body;
    const net_salary = base_salary + bonus - deductions;

    try {
      const result = await pool.query(
        `
      INSERT INTO hr.payrolls (employee_id, month, base_salary, bonus, deductions, net_salary)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `,
        [employee_id, month, base_salary, bonus, deductions, net_salary]
      );

      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error("Error creating payroll:", err);
      res.status(500).send("Failed to create payroll entry");
    }
  }
);

export default router;
