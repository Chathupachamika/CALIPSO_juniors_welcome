const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Connection
connectDB().catch(err => {
  console.error('[Fatal Error] Database connection failed:', err);
  process.exit(1);
});

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/users.routes'));
app.use('/api/teams', require('./routes/teams.routes'));
app.use('/api/events', require('./routes/events.routes'));
app.use('/api/scores', require('./routes/scores.routes'));
app.use('/api/qrcodes', require('./routes/qrcode.routes'));
// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend is running!' });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('[Error]', err);
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

module.exports = app;
