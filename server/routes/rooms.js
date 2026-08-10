const router = require('express').Router();
const db = require('../db');

router.get('/', async (req, res) => {
  const [rows] = await db.query(`
    SELECT r.*,
      COALESCE(
        CONCAT(p.first_name,' ',p.last_name),
        ec.patient_name
      ) AS patient_name
    FROM Room r
    LEFT JOIN Patient p ON r.patient_id = p.patient_id
    LEFT JOIN EmergencyCase ec ON ec.assigned_room = r.room_id
      AND ec.status NOT IN ('Discharged')
    ORDER BY r.ward_type, r.room_number`);
  res.json(rows);
});

router.patch('/:id', async (req, res) => {
  const { is_occupied, patient_id, ward_type, floor } = req.body;
  await db.query(
    'UPDATE Room SET is_occupied=?, patient_id=?, ward_type=?, floor=? WHERE room_id=?',
    [is_occupied, patient_id||null, ward_type, floor, req.params.id]
  );
  res.json({ success: true });
});

module.exports = router;
