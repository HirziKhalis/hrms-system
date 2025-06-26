import express from "express";
import { body, validationResult } from "express-validator";
import { pool } from "../db.js";
import { authenticateToken, authorizeRoles } from "../middleware/auth.js";
import { paginateQuery } from "../utils/pagination.js";

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
      const duplicateCheck = await pool.query(
        `SELECT 1 FROM hr.leave_requests
         WHERE employee_id = $1 AND leave_type_id = $2 AND start_date = $3 AND end_date = $4`,
        [employee_id, leave_type_id, start_date, end_date]
      );

      if (duplicateCheck.rowCount > 0) {
        return res
          .status(409)
          .json({ message: "Duplicate leave request already exists." });
      }

      // ✅ Calculate inclusive duration
      const duration =
        Math.ceil((end_date - start_date) / (1000 * 60 * 60 * 24)) + 1;

      const result = await pool.query(
        `INSERT INTO hr.leave_requests
         (request_id, employee_id, leave_type_id, start_date, end_date, duration, status, request_date, notes)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, 'pending', CURRENT_DATE, $6)
         RETURNING *`,
        [employee_id, leave_type_id, start_date, end_date, duration, notes]
      );

      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error("Error creating leave request:", err);
      res.status(500).send("Server error");
    }
  }
);

// Get all leave requests (admin only)
router.get(
  "/",
  authenticateToken,
  authorizeRoles("admin", "manager"),
  async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;

    const baseQuery = `
  SELECT
    lr.request_id,
    lr.employee_id,
    e.first_name || ' ' || e.last_name AS employee_name,
    sup.first_name || ' ' || sup.last_name AS supervisor_name,
    lr.start_date,
    lr.end_date,
    lr.status,
    lr.notes,
    lr.request_date,
    lr.approved_by,
    lt.type_name AS leave_type,
    lt.is_quota_limited,
    COALESCE(lq.total_days, 12) AS total_days,

    -- Dynamically calculated used_days (only approved requests)
    COALESCE((
      SELECT SUM(DATE(end_date) - DATE(start_date) + 1)
      FROM hr.leave_requests lr2
      WHERE
        lr2.employee_id = lr.employee_id
        AND lr2.leave_type_id = lr.leave_type_id
        AND lr2.status = 'approved'
        AND EXTRACT(YEAR FROM lr2.start_date) = EXTRACT(YEAR FROM CURRENT_DATE)
    ), 0) AS used_days,

    -- Remaining days based on total_days - dynamic used_days
    (
      COALESCE(lq.total_days, 12) - COALESCE((
        SELECT SUM(DATE(end_date) - DATE(start_date) + 1)
        FROM hr.leave_requests lr2
        WHERE
          lr2.employee_id = lr.employee_id
          AND lr2.leave_type_id = lr.leave_type_id
          AND lr2.status = 'approved'
          AND EXTRACT(YEAR FROM lr2.start_date) = EXTRACT(YEAR FROM CURRENT_DATE)
      ), 0)
    ) AS remaining_days,

    (DATE(lr.end_date) - DATE(lr.start_date) + 1) AS requested_days
  FROM hr.leave_requests lr
  JOIN hr.leave_types lt ON lr.leave_type_id = lt.leave_type_id
  JOIN hr.employees e ON lr.employee_id = e.employee_id
  LEFT JOIN hr.leave_quotas lq
    ON lr.employee_id = lq.employee_id
    AND lq.leave_type_id = lr.leave_type_id
    AND lq.year = EXTRACT(YEAR FROM CURRENT_DATE)
  LEFT JOIN hr.employees sup ON e.supervisor_id = sup.employee_id
  ORDER BY lr.request_date DESC
`;

    const countQuery = `
  SELECT COUNT(*) FROM hr.leave_requests lr
  JOIN hr.leave_types lt ON lr.leave_type_id = lt.leave_type_id
  JOIN hr.employees e ON lr.employee_id = e.employee_id
  LEFT JOIN hr.leave_quotas lq
    ON lr.employee_id = lq.employee_id
    AND lq.leave_type_id = lr.leave_type_id
    AND lq.year = EXTRACT(YEAR FROM CURRENT_DATE)
  LEFT JOIN hr.employees sup ON e.supervisor_id = sup.employee_id
`;

    try {
      const result = await paginateQuery(
        pool,
        baseQuery,
        countQuery,
        [],
        page,
        limit
      );
      res.json(result);
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

//Retrieve Quota
router.get("/quota", authenticateToken, async (req, res) => {
  try {
    const year = new Date().getFullYear();
    const employeeId = req.user.employee_id;

    const query = `
      SELECT
  lt.leave_type_id,
  lt.type_name,
  lt.is_quota_limited,
  CASE WHEN lt.is_quota_limited
       THEN COALESCE(lq.total_days, lt.default_days)
       ELSE -1
  END AS total_days,
  CASE WHEN lt.is_quota_limited
       THEN COALESCE((
         SELECT SUM(DATE(lr.end_date) - DATE(lr.start_date) + 1)
         FROM hr.leave_requests lr
         WHERE
           lr.employee_id = $1
           AND lr.leave_type_id = lt.leave_type_id
           AND lr.status = 'approved'
           AND EXTRACT(YEAR FROM lr.start_date) = $2
       ), 0)
       ELSE 0
  END AS used_days,
  CASE WHEN lt.is_quota_limited
       THEN (
         COALESCE(lq.total_days, lt.default_days) -
         COALESCE((
           SELECT SUM(DATE(lr.end_date) - DATE(lr.start_date) + 1)
           FROM hr.leave_requests lr
           WHERE
             lr.employee_id = $1
             AND lr.leave_type_id = lt.leave_type_id
             AND lr.status = 'approved'
             AND EXTRACT(YEAR FROM lr.start_date) = $2
         ), 0)
       )
       ELSE -1
  END AS remaining_days
FROM hr.leave_types lt
LEFT JOIN hr.leave_quotas lq
  ON lq.leave_type_id = lt.leave_type_id
  AND lq.employee_id = $1
  AND lq.year = $2
ORDER BY lt.type_name;
    `;

    const result = await pool.query(query, [employeeId, year]);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching leave quota:", err);
    res.status(500).send("Server error");
  }
});

//Helper function to get working days
async function getWorkingDays(startDate, endDate) {
  const result = await pool.query(
    `
    SELECT COUNT(*) FROM generate_series($1::date, $2::date, interval '1 day') AS d
    WHERE
      EXTRACT(DOW FROM d) NOT IN (0, 6) -- not Saturday or Sunday
      AND d NOT IN (SELECT holiday_date FROM hr.public_holidays)
  `,
    [startDate, endDate]
  );

  return parseInt(result.rows[0].count, 10);
}

// Update status of a leave request (admin only)
router.patch(
  "/:id/status",
  authenticateToken,
  authorizeRoles("admin", "manager"),
  [
    body("status")
      .isIn(["approved", "rejected"])
      .withMessage("Status must be either 'approved' or 'rejected'"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { status } = req.body;
    const request_id = req.params.id;
    const approverId = req.user.employee_id;
    const role = req.user.role || req.user.role_name;

    try {
      // 1. Fetch the leave request
      const leaveResult = await pool.query(
        `SELECT employee_id, leave_type_id, start_date, end_date
   FROM hr.leave_requests
   WHERE request_id = $1`,
        [request_id]
      );

      if (leaveResult.rows.length === 0)
        return res.status(404).send("Leave request not found");

      const { employee_id, leave_type_id, start_date, end_date } =
        leaveResult.rows[0];

      // ✅ Supervisor authorization check (skip if admin)
      if (role !== "admin") {
        const checkSupervisor = await pool.query(
          `SELECT 1 FROM hr.employees WHERE employee_id = $1 AND supervisor_id = $2`,
          [employee_id, approverId]
        );

        if (checkSupervisor.rowCount === 0) {
          return res.status(403).json({
            message: "You are not authorized to approve this request",
          });
        }
      }

      // 2. If approved, check quota before proceeding
      if (status === "approved") {
        const leaveDays = await getWorkingDays(start_date, end_date);
        const year = new Date().getFullYear();

        // Get default days from leave_types
        // Get leave type info
        const leaveTypeResult = await pool.query(
          `SELECT default_days, is_quota_limited
   FROM hr.leave_types
   WHERE leave_type_id = $1`,
          [leave_type_id]
        );

        const { default_days, is_quota_limited } = leaveTypeResult.rows[0];

        // If quota is enforced, perform quota logic
        if (is_quota_limited) {
          await pool.query(
            `INSERT INTO hr.leave_quotas (employee_id, year, leave_type_id, total_days, used_days)
     VALUES ($1, $2, $3, $4, 0)
     ON CONFLICT (employee_id, leave_type_id, year) DO NOTHING`,
            [employee_id, year, leave_type_id, default_days]
          );

          const quotaResult = await pool.query(
            `SELECT total_days, used_days FROM hr.leave_quotas
     WHERE employee_id = $1 AND year = $2 AND leave_type_id = $3`,
            [employee_id, year, leave_type_id]
          );

          const { total_days, used_days } = quotaResult.rows[0];

          if (is_quota_limited && used_days + leaveDays > total_days) {
            return res
              .status(400)
              .json({ message: "Not enough leave quota remaining." });
          }

          // Update used days
          if (is_quota_limited) {
            await pool.query(
              `UPDATE hr.leave_quotas
     SET used_days = used_days + $1, updated_at = NOW()
     WHERE employee_id = $2 AND year = $3 AND leave_type_id = $4`,
              [leaveDays, employee_id, year, leave_type_id]
            );
          }
        } else {
          console.log("Skipping quota check: unlimited leave type");
        }

        // Fetch current quota
        const quotaResult = await pool.query(
          `SELECT total_days, used_days FROM hr.leave_quotas
   WHERE employee_id = $1 AND year = $2 AND leave_type_id = $3`,
          [employee_id, year, leave_type_id]
        );

        const { total_days, used_days } = quotaResult.rows[0];

        if (is_quota_limited && used_days + leaveDays > total_days) {
          return res
            .status(400)
            .json({ message: "Not enough leave quota remaining." });
        }

        // 3. Deduct leave days
        await pool.query(
          `UPDATE hr.leave_quotas
   SET used_days = used_days + $1, updated_at = NOW()
   WHERE employee_id = $2 AND year = $3 AND leave_type_id = $4`,
          [leaveDays, employee_id, year, leave_type_id]
        );

        console.log(
          "Approved leave days (excluding weekends & holidays):",
          leaveDays
        );
      }

      // 4. Update leave request status
      const updateResult = await pool.query(
        `UPDATE hr.leave_requests
         SET status = $1, updated_at = NOW(), approved_by = $2
         WHERE request_id = $3
         RETURNING *`,
        [status, approverId, request_id]
      );
      console.log("Approver ID:", approverId);

      res.json(updateResult.rows[0]);
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
