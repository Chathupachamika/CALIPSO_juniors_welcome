require('dotenv').config();
const app = require('./app');
const { Server } = require('socket.io');
const http = require('http');

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.SOCKET_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Socket.io namespace
io.on('connection', (socket) => {
  console.log(`[Socket.io] User connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`[Socket.io] User disconnected: ${socket.id}`);
  });

  // Listen for score updates
  socket.on('scoreUpdate', (data) => {
    io.emit('scoreUpdated', data);
  });

  // Listen for event updates
  socket.on('eventUpdate', (data) => {
    io.emit('eventUpdated', data);
  });
});

// Make io accessible to routes
app.io = io;

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`[Server] Running on http://localhost:${PORT}`);
  console.log(`[Environment] ${process.env.NODE_ENV}`);
});

module.exports = server;
