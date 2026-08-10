const router = require('express').Router();
const db = require('../db');

router.get('/', async (req, res) => {
  const [rows] = await db.query(`
    SELECT b.*, CONCAT(p.first_name,' ',p.last_name) AS patient_name
    FROM Bill b JOIN Patient p ON b.patient_id = p.patient_id
    ORDER BY b.bill_date DESC`);
  res.json(rows);
});

router.get('/patient/:id', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM Bill WHERE patient_id = ?', [req.params.id]);
  const [[{ total }]] = await db.query('SELECT GetTotalBill(?) AS total', [req.params.id]);
  res.json({ bills: rows, total });
});

router.patch('/:id/pay', async (req, res) => {
  await db.query("UPDATE Bill SET payment_status = 'Paid' WHERE bill_id = ?", [req.params.id]);
  res.json({ success: true });
});

module.exports = router;
