const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Global Middlewares
app.use(cors());
app.use(express.json());

// Main Router Mount
app.use('/api/auth', authRoutes);

module.exports = app;