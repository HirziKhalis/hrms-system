// routes/employees.js
import express from "express";
import { body, validationResult } from "express-validator";
import { pool } from "../db.js";
import { authenticateToken, authorizeRoles } from "../middleware/auth.js";

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
router.post(
  "/",
  authenticateToken,
  authorizeRoles("admin"),
  [
    body("first_name").notEmpty().withMessage("First name is required"),
    body("last_name").notEmpty().withMessage("Last name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("phone").notEmpty().withMessage("Phone number is required"),
    body("department").notEmpty().withMessage("Department is required"),
    body("position").notEmpty().withMessage("Position is required"),
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
      department,
      position,
      supervisor_id,
    } = req.body;

    try {
      const result = await pool.query(
        `INSERT INTO hr.employees (employee_id, first_name, last_name, email, phone, department, position, supervisor_id)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          first_name,
          last_name,
          email,
          phone,
          department,
          position,
          supervisor_id || null,
        ]
      );

      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  }
);

// Update employee (Admin only for now)
router.put(
  "/:id",
  authorizeRoles("admin"),
  [
    body("first_name")
      .optional()
      .notEmpty()
      .withMessage("First name cannot be empty"),
    body("last_name")
      .optional()
      .notEmpty()
      .withMessage("Last name cannot be empty"),
    body("email").optional().isEmail().withMessage("A valid email is required"),
    body("phone")
      .optional()
      .notEmpty()
      .withMessage("Phone number cannot be empty"),
    body("department")
      .optional()
      .notEmpty()
      .withMessage("Department cannot be empty"),
    body("position")
      .optional()
      .notEmpty()
      .withMessage("Position cannot be empty"),
    body("supervisor_id")
      .optional()
      .isUUID()
      .withMessage("Supervisor ID must be a valid UUID"),
    body("status")
      .optional()
      .isIn(["active", "inactive", "terminated"])
      .withMessage("Invalid status"),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  async (req, res) => {
    const { id } = req.params;
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

    // Use a fallback if status is undefined
    const employeeStatus = status ?? "active";

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
          employeeStatus,
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
  }
);

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
