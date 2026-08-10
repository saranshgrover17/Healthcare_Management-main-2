const router = require('express').Router();
const db = require('../db');

router.get('/', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM Patient ORDER BY created_at DESC');
  res.json(rows);
});

router.get('/:id', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM Patient WHERE patient_id = ?', [req.params.id]);
  res.json(rows[0]);
});

router.get('/:id/timeline', async (req, res) => {
  const id = req.params.id;
  const [rows] = await db.query(`
    SELECT 'Appointment' AS event_type, appointment_date AS event_date, status AS detail FROM Appointment WHERE patient_id = ?
    UNION ALL
    SELECT 'Diagnosis', record_date, diagnosis FROM EHR WHERE patient_id = ?
    UNION ALL
    SELECT 'Lab Test', test_date, CONCAT(test_name, ': ', IFNULL(result,'Pending')) FROM LabTest WHERE patient_id = ?
    UNION ALL
    SELECT 'Bill', bill_date, CONCAT('Rs.',amount,' - ',payment_status) FROM Bill WHERE patient_id = ?
    ORDER BY event_date DESC`, [id, id, id, id]);
  res.json(rows);
});

router.post('/', async (req, res) => {
  const { first_name, last_name, dob, gender, phone, email, address, insurance_id, emergency_contact } = req.body;
  const [result] = await db.query(
    'INSERT INTO Patient (first_name,last_name,dob,gender,phone,email,address,insurance_id,emergency_contact) VALUES (?,?,?,?,?,?,?,?,?)',
    [first_name, last_name, dob, gender, phone, email, address, insurance_id, emergency_contact]
  );
  res.json({ patient_id: result.insertId });
});

router.patch('/:id', async (req, res) => {
  const { first_name, last_name, dob, gender, phone, email, address, insurance_id, emergency_contact } = req.body;
  await db.query(
    'UPDATE Patient SET first_name=?,last_name=?,dob=?,gender=?,phone=?,email=?,address=?,insurance_id=?,emergency_contact=? WHERE patient_id=?',
    [first_name, last_name, dob, gender, phone, email, address, insurance_id, emergency_contact, req.params.id]
  );
  res.json({ success: true });
});

router.delete('/:id', async (req, res) => {
  await db.query('DELETE FROM Patient WHERE patient_id=?', [req.params.id]);
  res.json({ success: true });
});

module.exports = router;
