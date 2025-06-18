import cron from "node-cron";
import { pool } from "../db.js";

const autoCheckout = () => {
  // Runs every weekday at 5:30 PM
  cron.schedule("30 17 * * 1-5", async () => {
    console.log("Running auto-checkout...");

    try {
      const result = await pool.query(`
        UPDATE hr.attendance
        SET check_out = CURRENT_DATE + INTERVAL '17 hours 30 minutes',
            status = CASE
              WHEN check_in IS NOT NULL THEN 'present'
              ELSE status
            END
        WHERE attendance_date = CURRENT_DATE
          AND check_in IS NOT NULL
          AND check_out IS NULL
      `);

      console.log(`[${new Date().toLocaleString()}] Auto checked-out: ${result.rowCount} employees`);
    } catch (err) {
      console.error("Auto-checkout cron job failed:", err);
    }
  });
};

export default autoCheckout;
