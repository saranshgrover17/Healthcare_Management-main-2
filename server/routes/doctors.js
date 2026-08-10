const router = require('express').Router();
const db = require('../db');

router.get('/', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM Doctor');
  res.json(rows);
});

router.get('/available', async (req, res) => {
  const [rows] = await db.query("SELECT * FROM Doctor WHERE is_available = 1");
  res.json(rows);
});

router.get('/check-availability', async (req, res) => {
  const { doctor_id, appt_time } = req.query;
  const [rows] = await db.query('SELECT IsDoctorAvailable(?, ?) AS available', [doctor_id, appt_time]);
  res.json({ available: rows[0].available });
});

router.post('/', async (req, res) => {
  const { first_name, last_name, specialty, phone, email, is_available } = req.body;
  const [result] = await db.query(
    'INSERT INTO Doctor (first_name,last_name,specialty,phone,email,is_available) VALUES (?,?,?,?,?,?)',
    [first_name, last_name, specialty, phone, email, is_available ?? 1]
  );
  res.json({ doctor_id: result.insertId });
});

router.patch('/:id', async (req, res) => {
  const { first_name, last_name, specialty, phone, email, is_available } = req.body;
  await db.query(
    'UPDATE Doctor SET first_name=?,last_name=?,specialty=?,phone=?,email=?,is_available=? WHERE doctor_id=?',
    [first_name, last_name, specialty, phone, email, is_available, req.params.id]
  );
  res.json({ success: true });
});

router.delete('/:id', async (req, res) => {
  await db.query('DELETE FROM Doctor WHERE doctor_id=?', [req.params.id]);
  res.json({ success: true });
});

module.exports = router;
