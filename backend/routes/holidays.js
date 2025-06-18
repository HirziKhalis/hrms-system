import express from "express";
import fetch from "node-fetch";
import { pool } from "../db.js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const CALENDARIFIC_API_KEY = process.env.CALENDARIFIC_API_KEY;

router.post("/sync", async (req, res) => {
  const year = new Date().getFullYear();
  const country = "ID"; // ISO country code

  const url = `https://calendarific.com/api/v2/holidays?api_key=${CALENDARIFIC_API_KEY}&country=${country}&year=${year}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    const holidays = data.response?.holidays || [];

    const client = await pool.connect();

    try {
      for (const holiday of holidays) {
        const date = holiday.date.iso;
        const name = holiday.name;

        await client.query(
          `INSERT INTO hr.public_holidays (holiday_date, name, country_code)
           VALUES ($1, $2, $3)
           ON CONFLICT (holiday_date) DO NOTHING`,
          [date, name, country]
        );
      }

      res.status(200).json({ message: `${holidays.length} holidays synced.` });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("Failed to fetch holidays:", err);
    res.status(500).json({ message: "Error syncing holidays" });
  }
});

export default router;
