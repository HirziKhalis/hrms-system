import cron from "node-cron";
import { pool } from "../db.js";

const markAbsentees = () => {
  // Runs every minute for testing — change to "30 9 * * 1-5" in production
  cron.schedule("30 9 * * 1-5", async () => {
    console.log("Running absentee check...");
    try {
      const result = await pool.query(`
        INSERT INTO hr.attendance (attendance_id, employee_id, check_in, status, attendance_date)
        SELECT gen_random_uuid(), e.employee_id, NULL, 'absent', CURRENT_DATE
        FROM hr.employees e
        WHERE NOT EXISTS (
          SELECT 1 FROM hr.attendance a
          WHERE a.employee_id = e.employee_id AND a.attendance_date = CURRENT_DATE
        )
      `);

      console.log(
        `[${new Date().toLocaleString()}] Marked absentees: ${result.rowCount}`
      );
    } catch (err) {
      console.error("Cron job failed:", err);
    }
  });
};

export default markAbsentees;
