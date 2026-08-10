const router = require('express').Router();
const db = require('../db');

router.get('/', async (req, res) => {
  const [rows] = await db.query(`
    SELECT a.*, CONCAT(p.first_name,' ',p.last_name) AS patient_name,
    CONCAT(d.first_name,' ',d.last_name) AS doctor_name, d.specialty
    FROM Appointment a
    JOIN Patient p ON a.patient_id = p.patient_id
    JOIN Doctor d ON a.doctor_id = d.doctor_id
    ORDER BY a.appointment_date DESC`);
  res.json(rows);
});

router.post('/', async (req, res) => {
  const { patient_id, doctor_id, appointment_date, notes } = req.body;
  const [result] = await db.query(
    "INSERT INTO Appointment (patient_id,doctor_id,appointment_date,status,notes) VALUES (?,?,?,'Scheduled',?)",
    [patient_id, doctor_id, appointment_date, notes]
  );
  res.json({ appointment_id: result.insertId });
});

router.patch('/:id', async (req, res) => {
  const { status, notes, appointment_date } = req.body;
  await db.query(
    'UPDATE Appointment SET status=?, notes=?, appointment_date=? WHERE appointment_id=?',
    [status, notes, appointment_date, req.params.id]
  );
  res.json({ success: true });
});

router.delete('/:id', async (req, res) => {
  await db.query('DELETE FROM Appointment WHERE appointment_id=?', [req.params.id]);
  res.json({ success: true });
});

module.exports = router;
