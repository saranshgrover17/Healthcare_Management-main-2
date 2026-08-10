const router = require('express').Router();
const db = require('../db');

router.get('/patient/:id', async (req, res) => {
  const [rows] = await db.query(`
    SELECT pr.*, m.name AS medication_name, m.dosage_form,
    CONCAT(d.first_name,' ',d.last_name) AS doctor_name
    FROM Prescription pr
    JOIN Medication m ON pr.medication_id = m.medication_id
    JOIN Doctor d ON pr.doctor_id = d.doctor_id
    WHERE pr.patient_id = ? ORDER BY pr.prescribed_date DESC`, [req.params.id]);
  res.json(rows);
});

router.post('/', async (req, res) => {
  const { patient_id, doctor_id, medication_id, dosage_instructions, prescribed_date, refill_count } = req.body;
  const [result] = await db.query(
    'INSERT INTO Prescription (patient_id,doctor_id,medication_id,dosage_instructions,prescribed_date,refill_count) VALUES (?,?,?,?,?,?)',
    [patient_id, doctor_id, medication_id, dosage_instructions, prescribed_date, refill_count||0]
  );
  res.json({ prescription_id: result.insertId });
});

router.delete('/:id', async (req, res) => {
  await db.query('DELETE FROM Prescription WHERE prescription_id=?', [req.params.id]);
  res.json({ success: true });
});

module.exports = router;
