const router = require('express').Router();
const db = require('../db');

router.get('/patient/:id', async (req, res) => {
  const [rows] = await db.query(`
    SELECT e.*, CONCAT(d.first_name,' ',d.last_name) AS doctor_name, d.specialty
    FROM EHR e JOIN Doctor d ON e.doctor_id = d.doctor_id
    WHERE e.patient_id = ? ORDER BY e.record_date DESC`, [req.params.id]);
  res.json(rows);
});

router.post('/', async (req, res) => {
  const { patient_id, doctor_id, diagnosis, treatment, allergies, medical_history, record_date } = req.body;
  const [result] = await db.query(
    'INSERT INTO EHR (patient_id,doctor_id,diagnosis,treatment,allergies,medical_history,record_date) VALUES (?,?,?,?,?,?,?)',
    [patient_id, doctor_id, diagnosis, treatment, allergies||'', medical_history||'', record_date]
  );
  res.json({ record_id: result.insertId });
});

router.delete('/:id', async (req, res) => {
  await db.query('DELETE FROM EHR WHERE record_id=?', [req.params.id]);
  res.json({ success: true });
});

module.exports = router;
