const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const config = require('./config/config');

const parkingRoutes = require('./routes/parkingRoutes');
const aiRoutes = require('./routes/aiRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.url}`);
  console.log('Query params:', req.query);
  console.log('Body:', req.body);
  next();
});

// Routes
app.use('/api/parking', parkingRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/auth', authRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Smart Parking API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message,
  });
});

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`🚀 Smart Parking Backend running on port ${PORT}`);
  console.log(`🌍 Environment: ${config.nodeEnv}`);
});

module.exports = app;
