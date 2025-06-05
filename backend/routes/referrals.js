import express from "express";
import { pool } from "../db.js";
import { authenticateToken, authorizeRoles } from "../middleware/auth.js";

const router = express.Router();

// Submit referral (any employee)
router.post("/", authenticateToken, async (req, res) => {
  const { candidate_name, position } = req.body;
  const employee_id = req.user.employee_id;

  try {
    const result = await pool.query(
      `INSERT INTO hr.referrals (referral_id, employee_id, candidate_name, position)
   VALUES (gen_random_uuid(), $1, $2, $3)
   RETURNING *`,
      [employee_id, candidate_name, position]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error submitting referral:", err);
    res.status(500).json({ message: "Failed to submit referral" });
  }
});

// Get all referrals (Admin only)
router.get(
  "/",
  authenticateToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const result = await pool.query(`
      SELECT r.*, e.first_name || ' ' || e.last_name AS employee_name
      FROM hr.referrals r
      JOIN hr.employees e ON r.employee_id = e.employee_id
      ORDER BY r.referred_on DESC
    `);
      res.json(result.rows);
    } catch (err) {
      console.error("Error fetching referrals:", err);
      res.status(500).json({ message: "Failed to fetch referrals" });
    }
  }
);

// Update referral status (Admin)
router.patch(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  async (req, res) => {
    const { status, reward_granted } = req.body;
    const { id } = req.params;

    try {
      const result = await pool.query(
        `UPDATE hr.referrals
       SET status = $1, reward_granted = $2
       WHERE referral_id = $3
       RETURNING *`,
        [status, reward_granted, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Referral not found" });
      }

      res.json(result.rows[0]);
    } catch (err) {
      console.error("Error updating referral:", err);
      res.status(500).json({ message: "Failed to update referral" });
    }
    console.log("Updating referral:", { id, status, reward_granted });
  }
);

export default router;
