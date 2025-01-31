const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const technicianRoutes = require('./routes/technicianRoutes'); // เพิ่ม technicianRoutes
const customerRoutes = require('./routes/customerRoutes'); // เพิ่ม customerRoutes
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes); // ใช้ customerRoutes
app.use('/api/technicians', technicianRoutes); // ใช้ technicianRoutes

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});