const router = require('express').Router();
const db = require('../db');

router.get('/', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM Notification ORDER BY created_at DESC LIMIT 20');
  res.json(rows);
});

router.patch('/:id/read', async (req, res) => {
  await db.query('UPDATE Notification SET is_read = 1 WHERE notif_id = ?', [req.params.id]);
  res.json({ success: true });
});

module.exports = router;
