const router = require('express').Router();
const db = require('../db');
const jwt = require('jsonwebtoken');

router.post('/login', async (req, res) => {
  const { email, role } = req.body;
  try {
    let user = null;
    if (role === 'patient') {
      const [rows] = await db.query('SELECT * FROM Patient WHERE email = ?', [email]);
      user = rows[0];
      if (user) user.name = `${user.first_name} ${user.last_name}`;
    } else if (role === 'doctor') {
      const [rows] = await db.query('SELECT * FROM Doctor WHERE email = ?', [email]);
      user = rows[0];
      if (user) user.name = `${user.first_name} ${user.last_name}`;
    } else if (role === 'admin') {
      if (email === 'admin@hms.com') user = { id: 0, name: 'Admin', email };
    }
    if (!user) return res.status(404).json({ error: 'User not found' });
    const id = user.patient_id || user.doctor_id || 0;
    const token = jwt.sign({ id, role, name: user.name }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, role, name: user.name, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
