const router = require('express').Router();
const db = require('../db');

router.get('/kpis', async (req, res) => {
  try {
    const [[{ total_patients }]]      = await db.query('SELECT COUNT(*) as total_patients FROM Patient');
    const [[{ todays_appointments }]] = await db.query("SELECT COUNT(*) as todays_appointments FROM Appointment WHERE DATE(appointment_date) = CURDATE()");
    const [[{ pending_bills }]]       = await db.query("SELECT COUNT(*) as pending_bills FROM Bill WHERE payment_status = 'Pending'");
    const [[{ occupied_rooms }]]      = await db.query("SELECT COUNT(*) as occupied_rooms FROM Room WHERE is_occupied = 1");
    const [[{ total_rooms }]]         = await db.query("SELECT COUNT(*) as total_rooms FROM Room");
    res.json({ total_patients, todays_appointments, pending_bills, occupied_rooms, total_rooms });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/revenue-by-specialty', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT d.specialty, COUNT(a.appointment_id) AS total_appointments, SUM(b.amount) AS total_billed
      FROM Doctor d
      JOIN Appointment a ON d.doctor_id = a.doctor_id
      JOIN Bill b ON a.appointment_id = b.appointment_id
      GROUP BY d.specialty ORDER BY total_billed DESC`);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/appointments-trend', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT DATE(appointment_date) as date, COUNT(*) as count
      FROM Appointment GROUP BY DATE(appointment_date) ORDER BY date DESC LIMIT 7`);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
