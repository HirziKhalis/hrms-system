// routes/employees.js
import express from "express";
import { body, validationResult } from "express-validator";
import { pool } from "../db.js";
import {
  authenticateToken,
  authorizePermissions,
} from "../middleware/auth.js";

const router = express.Router();

// Utility: Validate UUID
const isValidUUID = (uuid) => /^[0-9a-fA-F-]{36}$/.test(uuid);

// List employees
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT e.employee_id, e.first_name, e.last_name, e.email,
              d.name AS department, p.title AS position
       FROM hr.employees e
       LEFT JOIN hr.departments d ON e.department_id = d.department_id
       LEFT JOIN hr.positions p ON e.position_id = p.position_id
       ORDER BY e.last_name`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get single employee
router.get("/:id", async (req, res) => {
  if (!isValidUUID(req.params.id)) {
    return res.status(400).json({ message: "Invalid UUID format" });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM hr.employees WHERE employee_id = $1",
      [req.params.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: "Employee not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Create new employee (Admin only)
router.post(
  "/",
  authenticateToken,
  authorizePermissions("create_employee"),
  [
    body("first_name").notEmpty().withMessage("First name is required"),
    body("last_name").notEmpty().withMessage("Last name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("phone").notEmpty().withMessage("Phone number is required"),
    body("department_id").isUUID().withMessage("Department must be a valid UUID"),
    body("position_id").isUUID().withMessage("Position must be a valid UUID"),
    body("supervisor_id")
      .optional()
      .isUUID()
      .withMessage("Supervisor ID must be a valid UUID"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      first_name,
      last_name,
      email,
      phone,
      department_id,
      position_id,
      supervisor_id,
    } = req.body;

    try {
      const result = await pool.query(
        `INSERT INTO hr.employees (
          employee_id, first_name, last_name, email, phone,
          department_id, position_id, supervisor_id
        ) VALUES (
          gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7
        ) RETURNING *`,
        [
          first_name,
          last_name,
          email,
          phone,
          department_id,
          position_id,
          supervisor_id ?? null,
        ]
      );

      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Update employee
router.put(
  "/:id",
  authenticateToken,
  authorizePermissions("update_employee"),
  [
    body("first_name").optional().notEmpty(),
    body("last_name").optional().notEmpty(),
    body("email").optional().isEmail(),
    body("phone").optional().notEmpty(),
    body("department_id").optional().notEmpty(),
    body("position_id").optional().notEmpty(),
    body("supervisor_id").optional().isUUID(),
    body("status").optional().isIn(["active", "inactive", "terminated"]),
  ],

  async (req, res) => {
    if (!isValidUUID(req.params.id)) {
      return res.status(400).json({ message: "Invalid UUID format" });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      first_name,
      last_name,
      email,
      phone,
      department_id,
      position_id,
      supervisor_id,
      status,
    } = req.body;

    try {
      const result = await pool.query(
        `UPDATE hr.employees
         SET first_name = $1, last_name = $2, email = $3, phone = $4,
             department_id = $5, position_id = $6, supervisor_id = $7,
             status = $8, updated_at = NOW()
         WHERE employee_id = $9 RETURNING *`,
        [
          first_name,
          last_name,
          email,
          phone,
          department_id,
          position_id,
          supervisor_id,
          status ?? "active",
          req.params.id,
        ]
      );

      if (result.rows.length === 0)
        return res.status(404).json({ message: "Employee not found" });

      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Partial update
router.patch(
  "/:id",
  authenticateToken,
  authorizePermissions("update_employee"),
  [
    body("email").optional().isEmail(),
    body("phone").optional().notEmpty(),
    body("first_name").optional().notEmpty(),
    body("last_name").optional().notEmpty(),
    body("department_id").optional().notEmpty(),
    body("position_id").optional().notEmpty(),
    body("supervisor_id").optional().isUUID(),
    body("status").optional().isIn(["active", "inactive", "terminated"]),
  ],
  async (req, res) => {
    if (!isValidUUID(req.params.id)) {
      return res.status(400).json({ message: "Invalid UUID format" });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const fields = req.body;
    const keys = Object.keys(fields);

    if (keys.length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    const setClauses = keys.map((key, index) => `${key} = $${index + 1}`);
    const values = keys.map((key) => fields[key]);

    try {
      const result = await pool.query(
        `UPDATE hr.employees
         SET ${setClauses.join(", ")}, updated_at = NOW()
         WHERE employee_id = $${keys.length + 1}
         RETURNING *`,
        [...values, req.params.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Employee not found" });
      }

      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Delete employee
router.delete(
  "/:id",
  authenticateToken,
  authorizePermissions("delete_employee"),
  async (req, res) => {
    if (!isValidUUID(req.params.id)) {
      return res.status(400).json({ message: "Invalid UUID format" });
    }

    try {
      const result = await pool.query(
        "DELETE FROM hr.employees WHERE employee_id = $1 RETURNING *",
        [req.params.id]
      );
      if (result.rows.length === 0)
        return res.status(404).json({ message: "Employee not found" });
      res.sendStatus(204);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

export default router;
