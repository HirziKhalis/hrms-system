// routes/users.js
import express from "express";
import { pool } from "../db.js";
import { authenticateToken, authorizePermissions } from "../middleware/auth.js";
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
  authorizePermissions("read_users"), // ✅
  async (req, res) => {
    try {
      const result = await pool.query(`
  SELECT u.user_id, u.username, r.role_name AS role, u.employee_id
  FROM hr.users u
  LEFT JOIN hr.roles r ON u.role_id = r.role_id
  ORDER BY u.username ASC
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
  authorizePermissions("read_users"),
  async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT u.user_id, u.username, r.role_name AS role, u.employee_id
         FROM hr.users u
         LEFT JOIN hr.roles r ON u.role_id = r.role_id
         WHERE u.user_id = $1`,
        [req.params.id]
      );

      if (result.rows.length === 0)
        return res.status(404).json({ message: "User not found" });

      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Update user role
router.patch(
  "/:id",
  authenticateToken,
  authorizePermissions("update_users"),
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
      // Update the user's role_id using the role_name
      const updateResult = await pool.query(
        `UPDATE hr.users
         SET role_id = (
           SELECT role_id FROM hr.roles WHERE role_name = $1
         )
         WHERE user_id = $2
         RETURNING user_id, username, employee_id, role_id`,
        [role, req.params.id]
      );

      if (updateResult.rows.length === 0)
        return res.status(404).send("User not found");

      const updatedUser = updateResult.rows[0];

      // Fetch the full role details
      const roleResult = await pool.query(
        `SELECT role_name FROM hr.roles WHERE role_id = $1`,
        [updatedUser.role_id]
      );

      const roleName = roleResult.rows[0]?.role_name || null;

      res.json({
        user_id: updatedUser.user_id,
        username: updatedUser.username,
        employee_id: updatedUser.employee_id,
        role: roleName,
      });
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  }
);

// Delete user
router.delete(
  "/:id",
  authenticateToken,
  authorizePermissions("delete_users"),
  async (req, res) => {
    try {
      const result = await pool.query(
        `DELETE FROM hr.users
         WHERE user_id = $1
         RETURNING user_id, username, employee_id`,
        [req.params.id]
      );

      if (result.rows.length === 0)
        return res.status(404).json({ message: "User not found" });

      res.sendStatus(204);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

export default router;
