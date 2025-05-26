// backend/cron/markAbsentees.js
import cron from "node-cron";
import { pool } from "../db.js";

const markAbsentees = () => {
  // Runs at 9:30 AM every weekday (Mon–Fri)
  cron.schedule("30 9 * * 1-5", async () => {
    try {
      const result = await pool.query(
        `INSERT INTO hr.attendance (attendance_id, employee_id, check_in, status)
         SELECT gen_random_uuid(), e.employee_id, NULL, 'absent'
         FROM hr.employees e
         WHERE NOT EXISTS (
           SELECT 1 FROM hr.attendance a
           WHERE a.employee_id = e.employee_id AND DATE(a.check_in) = CURRENT_DATE
         )`
      );

      console.log(`[${new Date().toLocaleString()}] Marked absentees:`, result.rowCount);
    } catch (err) {
      console.error("Cron job failed:", err);
    }
  });
};

export default markAbsentees;
