// routes/auth.js
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  const { username, password, role, employee_id } = req.body;

  if (!username || !password || !role || !employee_id) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO hr.users (user_id, username, password_hash, role, employee_id)
   VALUES (gen_random_uuid(), $1, $2, $3, $4)
   RETURNING user_id, username, role, employee_id`,
      [username, hashedPassword, role, employee_id]
    );

    res.status(201).json({ message: "User registered", user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const userResult = await pool.query(
      `SELECT u.user_id, u.username, u.password_hash, u.role, u.employee_id,
              e.first_name, e.last_name, e.email, e.department
       FROM hr.users u
       LEFT JOIN hr.employees e ON u.employee_id = e.employee_id
       WHERE u.username = $1`,
      [username]
    );

    const user = userResult.rows[0];
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { user_id: user.user_id, role: user.role, employee_id: user.employee_id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      token,
      user: {
        user_id: user.user_id,
        username: user.username,
        role: user.role,
        employee_id: user.employee_id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        department: user.department,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// /auth/me route
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.user_id, u.username, u.role, u.employee_id,
              e.first_name, e.last_name, e.email, e.department
       FROM hr.users u
       LEFT JOIN hr.employees e ON u.employee_id = e.employee_id
       WHERE u.user_id = $1`,
      [req.user.user_id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

export default router;
