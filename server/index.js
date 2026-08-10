const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth',          require('./routes/auth'));
app.use('/api/patients',      require('./routes/patients'));
app.use('/api/doctors',       require('./routes/doctors'));
app.use('/api/appointments',  require('./routes/appointments'));
app.use('/api/dashboard',     require('./routes/dashboard'));
app.use('/api/billing',       require('./routes/billing'));
app.use('/api/inventory',     require('./routes/inventory'));
app.use('/api/emergency',     require('./routes/emergency'));
app.use('/api/ehr',           require('./routes/ehr'));
app.use('/api/medications', require('./routes/medications'));
app.use('/api/prescriptions', require('./routes/prescriptions'));
app.use('/api/rooms',         require('./routes/rooms'));
app.use('/api/notifications', require('./routes/notifications'));

app.listen(process.env.PORT, () => {
  console.log(`HMS Server running on port ${process.env.PORT}`);
});
