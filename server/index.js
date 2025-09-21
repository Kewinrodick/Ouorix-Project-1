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

// MongoDB connection (optional for demo)
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ouorix-safety', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.log('MongoDB not available, running in demo mode without database');
    // Continue without database for demo purposes
  }
};

// Initialize database connection
connectDB();

const db = mongoose.connection;
db.on('error', (error) => {
  console.log('MongoDB connection error (demo mode):', error.message);
});
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    services: {
      database: mongoose.connection.readyState === 1 ? 'connected' : 'demo-mode',
      ai: 'active',
      blockchain: 'active'
    }
  });
});

// Demo endpoint to show system capabilities
app.get('/api/demo/system-info', (req, res) => {
  res.json({
    system: 'Ouorix Smart Tourist Safety & Incident Response System',
    version: '1.0.0',
    capabilities: {
      mobile_app: {
        digital_id: 'Blockchain-secured digital identity for tourists',
        panic_button: 'One-touch emergency alert system',
        geo_fencing: 'Real-time location-based safety alerts',
        family_tracking: 'Opt-in location sharing with family members',
        iot_integration: 'Wearable device health monitoring'
      },
      authority_dashboard: {
        real_time_monitoring: 'Live tourist location clusters and heatmaps',
        incident_management: 'Complete incident lifecycle management',
        automated_efir: 'Automated police report filing',
        performance_analytics: 'Authority performance metrics and reporting'
      },
      ai_anomaly_detection: {
        route_deviation: 'Detects when tourists deviate from expected routes',
        inactivity_monitoring: 'Identifies unusual periods of inactivity',
        distress_patterns: 'ML-based behavioral analysis for distress signals',
        vitals_monitoring: 'IoT device health and vitals analysis'
      },
      blockchain_integration: {
        secure_identity: 'Tamper-proof digital identity verification',
        immutable_records: 'Permanent incident and emergency records',
        smart_contracts: 'Automated emergency response protocols',
        privacy_protection: 'Decentralized data storage with privacy controls'
      }
    },
    demo_endpoints: {
      health_check: '/health',
      system_info: '/api/demo/system-info',
      mock_panic_alert: '/api/demo/panic-alert',
      mock_tourist_data: '/api/demo/tourist-status',
      mock_analytics: '/api/demo/analytics'
    },
    status: 'Running in demo mode - Ready for production deployment'
  });
});

// Demo panic alert endpoint
app.post('/api/demo/panic-alert', (req, res) => {
  const alertId = `DEMO${Date.now()}`;
  const mockLocation = {
    latitude: 40.7128 + (Math.random() - 0.5) * 0.01,
    longitude: -74.0060 + (Math.random() - 0.5) * 0.01,
    address: 'Times Square, New York, NY'
  };

  res.json({
    message: 'DEMO: Panic alert received and processed',
    alertId,
    status: 'emergency_response_initiated',
    location: mockLocation,
    authorities_notified: true,
    response_time_estimate: '3-5 minutes',
    timestamp: new Date().toISOString(),
    demo_note: 'This is a demonstration. In production, this would trigger real emergency protocols.'
  });
});

// Demo tourist status endpoint
app.get('/api/demo/tourist-status', (req, res) => {
  const mockTourists = [
    {
      digitalId: 'TUR20250921001',
      name: 'John Doe',
      status: 'safe',
      location: { lat: 40.7589, lng: -73.9851, zone: 'Times Square' },
      lastActivity: new Date(Date.now() - 5 * 60 * 1000).toISOString()
    },
    {
      digitalId: 'TUR20250921002', 
      name: 'Jane Smith',
      status: 'at-risk',
      location: { lat: 40.7505, lng: -73.9934, zone: 'Central Park' },
      lastActivity: new Date(Date.now() - 45 * 60 * 1000).toISOString()
    },
    {
      digitalId: 'TUR20250921003',
      name: 'Bob Johnson',
      status: 'emergency',
      location: { lat: 40.7282, lng: -74.0776, zone: 'Financial District' },
      lastActivity: new Date(Date.now() - 2 * 60 * 1000).toISOString()
    }
  ];

  res.json({
    total_tourists: mockTourists.length,
    active_emergencies: mockTourists.filter(t => t.status === 'emergency').length,
    at_risk_count: mockTourists.filter(t => t.status === 'at-risk').length,
    safe_count: mockTourists.filter(t => t.status === 'safe').length,
    tourists: mockTourists,
    last_updated: new Date().toISOString()
  });
});

// Demo analytics endpoint
app.get('/api/demo/analytics', (req, res) => {
  res.json({
    overview: {
      total_tourists: 156,
      active_incidents: 3,
      resolved_today: 12,
      average_response_time: '4.2 minutes'
    },
    ai_anomalies_detected: {
      route_deviations: 2,
      inactivity_alerts: 1,
      vitals_anomalies: 0,
      behavioral_patterns: 1
    },
    geofence_alerts: {
      high_risk_zone_entries: 5,
      restricted_area_alerts: 1,
      capacity_warnings: 0
    },
    blockchain_transactions: {
      identity_verifications: 23,
      incident_records: 15,
      smart_contract_executions: 8
    },
    generated_at: new Date().toISOString(),
    demo_note: 'This data is simulated for demonstration purposes'
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