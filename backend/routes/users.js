import express from "express";
import { pool } from "../db.js";
import { authenticateToken, authorizeRoles } from "../middleware/auth.js";
import { body, validationResult } from "express-validator";

const router = express.Router();

// Middleware to check for validation errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });
  next();
};

// List all users
router.get(
  "/",
  authenticateToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const result = await pool.query(`
      SELECT user_id, username, role, employee_id
      FROM hr.users
      ORDER BY username ASC
    `);
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  }
);

// Get specific user
router.get(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const result = await pool.query(
        `
      SELECT user_id, username, role, employee_id
      FROM hr.users
      WHERE user_id = $1
    `,
        [req.params.id]
      );

      if (result.rows.length === 0)
        return res.status(404).send("User not found");
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  }
);

// Update user role
router.patch(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  [
    body("role")
      .optional()
      .isIn(["admin", "manager", "employee"])
      .withMessage("Role must be admin, manager, or employee"),
  ],
  validate,
  async (req, res) => {
    const { role } = req.body;
    if (!role) return res.status(400).json({ message: "Nothing to update" });

    try {
      const result = await pool.query(
        `
        UPDATE hr.users
        SET role = $1
        WHERE user_id = $2
        RETURNING user_id, username, role, employee_id
      `,
        [role, req.params.id]
      );

      if (result.rows.length === 0)
        return res.status(404).send("User not found");
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  }
);

// Delete user (optional: could be a soft delete)
router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const result = await pool.query(
        `
      DELETE FROM hr.users
      WHERE user_id = $1
      RETURNING *
    `,
        [req.params.id]
      );

      if (result.rows.length === 0)
        return res.status(404).send("User not found");
      res.sendStatus(204);
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  }
);

export default router;
