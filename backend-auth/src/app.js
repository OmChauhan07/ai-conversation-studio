const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Global Middlewares
app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'backend-auth',
  });
});

// Main Router Mount
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

module.exports = app;