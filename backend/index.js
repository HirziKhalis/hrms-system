import express from "express";
import pg from "pg";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cors from "cors";
import { authenticateToken, authorizeRoles } from "./middleware/auth.js";

const { Pool } = pg;
dotenv.config();
console.log("Loaded .env:", process.env); // 👈 TEMPORARY DEBUG

const app = express();
const port = process.env.PORT || 3000;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: 5432,
});

console.log("Connecting with config:", {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

app.use(cors());
app.use(express.json());

// Middleware: Check role
function checkRole(requiredRole) {
  return (req, res, next) => {
    if (req.user.role !== requiredRole) {
      return res
        .status(403)
        .send("Forbidden: You do not have the required role");
    }
    next();
  };
}

// Protected Routes (Authentication required)
app.get("/employees", authenticateToken, async (req, res) => {
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

// Protected: Delete employee (only accessible by admin)
app.delete(
  "/employees/:id",
  authenticateToken,
  checkRole("admin"),
  async (req, res) => {
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
  }
);

/* ... */ // List employees - Any authenticated user
app.get("/employees", authenticateToken, async (req, res) => {
  /* ... */
});

// Get single employee - Any authenticated user
app.get("/employees/:id", authenticateToken, async (req, res) => {
  /* ... */
});

// Create new employee - Admin only
app.post(
  "/employees",
  authenticateToken,
  authorizeRoles("admin"),
  async (req, res) => {
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
        [
          first_name,
          last_name,
          email,
          phone,
          department,
          position,
          supervisor_id,
        ]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  }
);

// Update employee - Admin or Manager
app.put(
  "/employees/:id",
  authenticateToken,
  authorizeRoles("admin"),
  async (req, res) => {
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
        `UPDATE hr.employees SET first_name=$1, last_name=$2, email=$3, phone=$4, department=$5,
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
  }
);

// Delete employee - Admin only
app.delete(
  "/employees/:id",
  authenticateToken,
  authorizeRoles("admin"),
  async (req, res) => {
    /* ... */
  }
);

// Register new user
app.post("/auth/register", async (req, res) => {
  const { username, password, role, employee_id } = req.body;

  if (!username || !password || !role || !employee_id) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO hr.users (user_id, username, password, role, employee_id)
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

// Login route
app.post("/auth/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const userResult = await pool.query(
      `SELECT u.user_id, u.username, u.password, u.role, u.employee_id,
              e.first_name, e.last_name, e.email, e.department
       FROM hr.users u
       LEFT JOIN hr.employees e ON u.employee_id = e.employee_id
       WHERE u.username = $1`,
      [username]
    );

    const user = userResult.rows[0];
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
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

// Route: Update employee (only accessible by admin or the employee's supervisor)
app.put(
  "/employees/:id",
  authenticateToken,
  checkRole("admin"),
  async (req, res) => {
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
        `UPDATE hr.employees SET first_name=$1, last_name=$2, email=$3, phone=$4, department=$5,
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
  }
);

// /me Route to Get Logged-In User's Employee Info
app.get("/auth/me", authenticateToken, async (req, res) => {
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

app.listen(port, () => {
  console.log(`HRMS backend running on http://localhost:${port}`);
});
