const router = require('express').Router();
const db = require('../db');

router.get('/', async (req, res) => {
  const [rows] = await db.query(`
    SELECT e.*,
      COALESCE(e.patient_name, CONCAT(p.first_name,' ',p.last_name)) AS patient_name,
      CONCAT(d.first_name,' ',d.last_name) AS doctor_name,
      r.room_number
    FROM EmergencyCase e
    LEFT JOIN Patient p ON e.patient_id = p.patient_id
    LEFT JOIN Doctor d ON e.assigned_doctor = d.doctor_id
    LEFT JOIN Room r ON e.assigned_room = r.room_id
    ORDER BY e.arrived_at DESC`);
  res.json(rows);
});

router.post('/', async (req, res) => {
  const { patient_name, severity, description, assigned_room, assigned_doctor, status } = req.body;
  const [result] = await db.query(
    `INSERT INTO EmergencyCase (patient_name, severity, description, assigned_room, assigned_doctor, status)
     VALUES (?,?,?,?,?,?)`,
    [patient_name, severity, description, assigned_room||null, assigned_doctor||null, status||'Waiting']
  );
  if (assigned_room) {
    await db.query('UPDATE Room SET is_occupied=1 WHERE room_id=?', [assigned_room]);
  }
  res.json({ emergency_id: result.insertId });
});

router.patch('/:id', async (req, res) => {
  const { patient_name, severity, description, assigned_room, assigned_doctor, status } = req.body;
  const [old] = await db.query('SELECT assigned_room FROM EmergencyCase WHERE emergency_id=?', [req.params.id]);
  await db.query(
    `UPDATE EmergencyCase SET patient_name=?,severity=?,description=?,assigned_room=?,assigned_doctor=?,status=? WHERE emergency_id=?`,
    [patient_name, severity, description, assigned_room||null, assigned_doctor||null, status, req.params.id]
  );
  if (old[0]?.assigned_room && old[0].assigned_room !== assigned_room) {
    await db.query('UPDATE Room SET is_occupied=0, patient_id=NULL WHERE room_id=?', [old[0].assigned_room]);
  }
  if (assigned_room) {
    await db.query('UPDATE Room SET is_occupied=1 WHERE room_id=?', [assigned_room]);
  }
  res.json({ success: true });
});

router.delete('/:id', async (req, res) => {
  const [old] = await db.query('SELECT assigned_room FROM EmergencyCase WHERE emergency_id=?', [req.params.id]);
  if (old[0]?.assigned_room) {
    await db.query('UPDATE Room SET is_occupied=0 WHERE room_id=?', [old[0].assigned_room]);
  }
  await db.query('DELETE FROM EmergencyCase WHERE emergency_id=?', [req.params.id]);
  res.json({ success: true });
});

module.exports = router;
