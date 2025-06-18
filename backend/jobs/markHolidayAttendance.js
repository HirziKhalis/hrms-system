import cron from "node-cron";
import { pool } from "../db.js";
import dayjs from "dayjs";

const markHolidayAttendance = () => {
  // Runs every weekday morning at 7:00 AM
  cron.schedule("0 7 * * 1-5", async () => {
    console.log("Running holiday attendance check...");

    const today = dayjs().format("YYYY-MM-DD");

    try {
      // 1. Check if today is a holiday
      const holidayRes = await pool.query(
        `SELECT * FROM hr.public_holidays WHERE holiday_date = $1`,
        [today]
      );

      if (holidayRes.rowCount === 0) {
        console.log("Not a holiday, skipping.");
        return;
      }

      // 2. Get all employees
      const employeesRes = await pool.query(`SELECT employee_id FROM hr.employees`);

      for (const { employee_id } of employeesRes.rows) {
        const existing = await pool.query(
          `SELECT 1 FROM hr.attendance WHERE employee_id = $1 AND attendance_date = $2`,
          [employee_id, today]
        );

        if (existing.rowCount === 0) {
          await pool.query(
            `INSERT INTO hr.attendance (employee_id, attendance_date, status)
             VALUES ($1, $2, 'Holiday')`,
            [employee_id, today]
          );
          console.log(`Marked Holiday for employee ${employee_id}`);
        }
      }

      console.log("Holiday attendance update complete.");
    } catch (err) {
      console.error("Error in holiday cron:", err);
    }
  });
};

export default markHolidayAttendance;
