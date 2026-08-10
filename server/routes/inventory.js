const router = require('express').Router();
const db = require('../db');

router.get('/', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM Inventory ORDER BY quantity ASC');
  res.json(rows);
});

router.get('/low-stock', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM Inventory WHERE quantity < min_threshold ORDER BY quantity ASC');
  res.json(rows);
});

router.post('/', async (req, res) => {
  const { item_name, category, quantity, min_threshold, unit } = req.body;
  const [result] = await db.query(
    'INSERT INTO Inventory (item_name,category,quantity,min_threshold,unit) VALUES (?,?,?,?,?)',
    [item_name, category, quantity, min_threshold, unit]
  );
  res.json({ item_id: result.insertId });
});

router.patch('/:id', async (req, res) => {
  const { item_name, category, quantity, min_threshold, unit } = req.body;
  await db.query(
    'UPDATE Inventory SET item_name=?,category=?,quantity=?,min_threshold=?,unit=? WHERE item_id=?',
    [item_name, category, quantity, min_threshold, unit, req.params.id]
  );
  res.json({ success: true });
});

router.patch('/:id/quantity', async (req, res) => {
  const { quantity } = req.body;
  await db.query('UPDATE Inventory SET quantity=? WHERE item_id=?', [quantity, req.params.id]);
  res.json({ success: true });
});

router.delete('/:id', async (req, res) => {
  await db.query('DELETE FROM Inventory WHERE item_id=?', [req.params.id]);
  res.json({ success: true });
});

module.exports = router;
