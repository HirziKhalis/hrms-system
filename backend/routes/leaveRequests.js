import express from "express";
import { body, validationResult } from "express-validator";
import { pool } from "../db.js";
import { authenticateToken, authorizeRoles } from "../middleware/auth.js";

const router = express.Router();

// Create a leave request
router.post(
  "/",
  authenticateToken,
  [
    body("start_date")
      .isISO8601()
      .toDate()
      .withMessage("Start date is required"),
    body("end_date").isISO8601().toDate().withMessage("End date is required"),
    body("leave_type_id").notEmpty().withMessage("Leave type ID is required"),

    body("notes").optional().isString(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { start_date, end_date, leave_type_id, notes } = req.body;
    const employee_id = req.user.employee_id;

    try {
      const result = await pool.query(
        `INSERT INTO hr.leave_requests (request_id, employee_id, leave_type_id, start_date, end_date, status, request_date, notes)
   VALUES (gen_random_uuid(), $1, $2, $3, $4, 'pending', CURRENT_DATE, $5)
   RETURNING *`,
        [employee_id, leave_type_id, start_date, end_date, notes]
      );

      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  }
);

// Get all leave requests (admin only)
router.get(
  "/",
  authenticateToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT lr.request_id, lr.employee_id, lr.start_date, lr.end_date,
             lr.status, lr.notes, lr.request_date, lr.approved_by,
             lt.type_name AS leave_type
      FROM hr.leave_requests lr
      JOIN hr.leave_types lt ON lr.leave_type_id = lt.leave_type_id
      ORDER BY lr.request_date DESC
    `);

      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  }
);

// Get leave requests for the logged-in user
router.get("/my", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT lr.request_id, lr.start_date, lr.end_date, lr.status, lr.notes, lr.request_date,
              lt.type_name AS leave_type
       FROM hr.leave_requests lr
       JOIN hr.leave_types lt ON lr.leave_type_id = lt.leave_type_id
       WHERE lr.employee_id = $1
       ORDER BY lr.request_date DESC`,
      [req.user.employee_id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Update status of a leave request (admin only)
router.patch(
  "/:id/status",
  authenticateToken,
  authorizeRoles("admin"),
  [
    body("status")
      .isIn(["approved", "rejected"])
      .withMessage("Status must be either 'approved' or 'rejected'"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    try {
      const result = await pool.query(
        `UPDATE hr.leave_requests SET status = $1, updated_at = NOW()
         WHERE request_id = $2 RETURNING *
`,
        [req.body.status, req.params.id]
      );

      if (result.rows.length === 0)
        return res.status(404).send("Leave request not found");
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  }
);

// Get all leave types (for dropdowns etc.)
router.get("/types", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT leave_type_id, type_name
      FROM hr.leave_types
      ORDER BY type_name
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching leave types:", err);
    res.status(500).send("Server error");
  }
});

export default router;
