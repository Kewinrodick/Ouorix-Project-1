const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tourists', require('./routes/tourists'));
app.use('/api/incidents', require('./routes/incidents'));
app.use('/api/geofence', require('./routes/geofence'));
app.use('/api/authorities', require('./routes/authorities'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/blockchain', require('./routes/blockchain'));

// Socket.io for real-time communications
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Join room based on user type
  socket.on('join-room', (data) => {
    const { userType, location } = data;
    socket.join(userType);
    if (location) {
      socket.join(`location-${location.zone}`);
    }
  });

  // Handle panic button activation
  socket.on('panic-alert', (data) => {
    console.log('Panic alert received:', data);
    io.to('authorities').emit('panic-alert', data);
    io.to(`location-${data.location.zone}`).emit('area-alert', data);
  });

  // Handle location updates
  socket.on('location-update', (data) => {
    socket.to('authorities').emit('tourist-location', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ouorix-safety', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    services: {
      database: db.readyState === 1 ? 'connected' : 'disconnected',
      ai: 'active',
      blockchain: 'active'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Smart Tourist Safety Server running on port ${PORT}`);
});

module.exports = app;