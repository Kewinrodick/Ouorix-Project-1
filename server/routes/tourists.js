const express = require('express');
const Tourist = require('../models/Tourist');
const Geofence = require('../models/Geofence');
const { authenticateToken } = require('../middleware/auth');
const { calculateDistance } = require('../utils/geoUtils');

const router = express.Router();

// Get tourist profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const tourist = await Tourist.findById(req.user.id);
    if (!tourist) {
      return res.status(404).json({ error: 'Tourist not found' });
    }
    
    res.json(tourist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update location
router.post('/location', authenticateToken, async (req, res) => {
  try {
    const { latitude, longitude, address, zone } = req.body;
    
    const tourist = await Tourist.findById(req.user.id);
    if (!tourist) {
      return res.status(404).json({ error: 'Tourist not found' });
    }
    
    // Update current location
    tourist.currentLocation = {
      latitude,
      longitude,
      address,
      zone,
      lastUpdated: new Date()
    };
    
    // Add to location history
    tourist.locationHistory.push({
      latitude,
      longitude,
      timestamp: new Date(),
      zone
    });
    
    // Keep only last 100 location points
    if (tourist.locationHistory.length > 100) {
      tourist.locationHistory = tourist.locationHistory.slice(-100);
    }
    
    // Update last activity
    tourist.safetyStatus.lastActivity = new Date();
    
    await tourist.save();
    
    // Check geofences and trigger alerts if needed
    const nearbyGeofences = await checkGeofences(latitude, longitude);
    
    res.json({
      message: 'Location updated successfully',
      currentLocation: tourist.currentLocation,
      nearbyGeofences
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Panic button activation
router.post('/panic', authenticateToken, async (req, res) => {
  try {
    const { location, message, severity } = req.body;
    
    const tourist = await Tourist.findById(req.user.id);
    if (!tourist) {
      return res.status(404).json({ error: 'Tourist not found' });
    }
    
    // Update safety status to emergency
    tourist.safetyStatus.status = 'emergency';
    tourist.safetyStatus.lastActivity = new Date();
    
    if (location) {
      tourist.currentLocation = {
        ...tourist.currentLocation,
        ...location,
        lastUpdated: new Date()
      };
    }
    
    await tourist.save();
    
    // Create incident record
    const Incident = require('../models/Incident');
    const incidentId = `INC${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    
    const incident = new Incident({
      incidentId,
      type: 'panic',
      severity: severity || 'high',
      location: location || tourist.currentLocation,
      reporter: {
        touristId: tourist._id,
        digitalId: tourist.digitalId,
        name: `${tourist.personalInfo.firstName} ${tourist.personalInfo.lastName}`,
        phone: tourist.personalInfo.phone,
        reporterType: 'tourist'
      },
      timeline: [{
        action: 'Panic button activated',
        actor: tourist.digitalId,
        timestamp: new Date(),
        description: message || 'Emergency assistance requested'
      }]
    });
    
    await incident.save();
    
    res.json({
      message: 'Panic alert sent successfully',
      incidentId: incident.incidentId,
      status: 'emergency_response_initiated'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Enable/disable family tracking
router.post('/family-tracking', authenticateToken, async (req, res) => {
  try {
    const { enabled, familyMembers } = req.body;
    
    const tourist = await Tourist.findById(req.user.id);
    if (!tourist) {
      return res.status(404).json({ error: 'Tourist not found' });
    }
    
    tourist.familyTracking.enabled = enabled;
    if (familyMembers) {
      tourist.familyTracking.familyMembers = familyMembers;
    }
    
    await tourist.save();
    
    res.json({
      message: 'Family tracking preferences updated',
      familyTracking: tourist.familyTracking
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get family member locations (if tracking enabled)
router.get('/family-locations', authenticateToken, async (req, res) => {
  try {
    const tourist = await Tourist.findById(req.user.id);
    if (!tourist || !tourist.familyTracking.enabled) {
      return res.status(403).json({ error: 'Family tracking not enabled' });
    }
    
    const familyDigitalIds = tourist.familyTracking.familyMembers.map(member => member.digitalId);
    
    const familyLocations = await Tourist.find({
      digitalId: { $in: familyDigitalIds },
      'familyTracking.enabled': true
    }).select('digitalId personalInfo.firstName personalInfo.lastName currentLocation safetyStatus.status');
    
    res.json(familyLocations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update IoT device data
router.post('/iot-sync', authenticateToken, async (req, res) => {
  try {
    const { deviceId, deviceType, vitals, batteryLevel } = req.body;
    
    const tourist = await Tourist.findById(req.user.id);
    if (!tourist) {
      return res.status(404).json({ error: 'Tourist not found' });
    }
    
    tourist.wearableDevice = {
      deviceId,
      deviceType,
      lastSync: new Date(),
      batteryLevel,
      vitals: {
        ...vitals,
        lastReading: new Date()
      }
    };
    
    await tourist.save();
    
    res.json({
      message: 'IoT device data synchronized',
      deviceStatus: tourist.wearableDevice
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper function to check geofences
async function checkGeofences(latitude, longitude) {
  try {
    const geofences = await Geofence.find({ isActive: true });
    const alerts = [];
    
    for (const geofence of geofences) {
      const distance = calculateDistance(
        latitude, longitude,
        geofence.boundary.center.latitude,
        geofence.boundary.center.longitude
      );
      
      if (geofence.boundary.type === 'Circle' && distance <= geofence.boundary.radius) {
        alerts.push({
          zoneId: geofence.zoneId,
          name: geofence.name,
          type: geofence.type,
          riskLevel: geofence.riskLevel,
          entryAlert: geofence.alerts.entryAlert
        });
      }
    }
    
    return alerts;
  } catch (error) {
    console.error('Error checking geofences:', error);
    return [];
  }
}

module.exports = router;