const express = require('express');
const Geofence = require('../models/Geofence');
const Tourist = require('../models/Tourist');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { isPointInCircle, isPointInPolygon } = require('../utils/geoUtils');

const router = express.Router();

// Create new geofence (authorities only)
router.post('/', authenticateToken, authorizeRole(['authority']), async (req, res) => {
  try {
    const { name, description, type, boundary, riskLevel, alerts } = req.body;
    
    const zoneId = `ZONE${Date.now()}${Math.random().toString(36).substr(2, 3).toUpperCase()}`;
    
    const geofence = new Geofence({
      zoneId,
      name,
      description,
      type,
      boundary,
      riskLevel,
      alerts,
      createdBy: req.user.badgeNumber || req.user.id
    });
    
    await geofence.save();
    
    res.status(201).json({
      message: 'Geofence created successfully',
      geofence
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all geofences
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { type, riskLevel, active } = req.query;
    
    const filter = {};
    if (type) filter.type = type;
    if (riskLevel) filter.riskLevel = riskLevel;
    if (active !== undefined) filter.isActive = active === 'true';
    
    const geofences = await Geofence.find(filter);
    
    res.json(geofences);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get specific geofence
router.get('/:zoneId', authenticateToken, async (req, res) => {
  try {
    const geofence = await Geofence.findOne({ zoneId: req.params.zoneId });
    
    if (!geofence) {
      return res.status(404).json({ error: 'Geofence not found' });
    }
    
    res.json(geofence);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check if point is in any geofence
router.post('/check', authenticateToken, async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    
    const geofences = await Geofence.find({ isActive: true });
    const matchingZones = [];
    
    for (const geofence of geofences) {
      let isInside = false;
      
      if (geofence.boundary.type === 'Circle') {
        isInside = isPointInCircle(
          latitude, longitude,
          geofence.boundary.center.latitude,
          geofence.boundary.center.longitude,
          geofence.boundary.radius
        );
      } else if (geofence.boundary.type === 'Polygon') {
        isInside = isPointInPolygon(latitude, longitude, geofence.boundary.coordinates);
      }
      
      if (isInside) {
        matchingZones.push({
          zoneId: geofence.zoneId,
          name: geofence.name,
          type: geofence.type,
          riskLevel: geofence.riskLevel,
          alerts: geofence.alerts
        });
        
        // Update tourist count in zone
        geofence.currentStatus.touristCount++;
        geofence.currentStatus.lastUpdated = new Date();
        await geofence.save();
      }
    }
    
    res.json({
      zones: matchingZones,
      alertsTriggered: matchingZones.filter(zone => 
        zone.alerts.entryAlert || zone.riskLevel === 'high' || zone.riskLevel === 'very_high'
      )
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get tourists in specific zone
router.get('/:zoneId/tourists', authenticateToken, authorizeRole(['authority']), async (req, res) => {
  try {
    const geofence = await Geofence.findOne({ zoneId: req.params.zoneId });
    
    if (!geofence) {
      return res.status(404).json({ error: 'Geofence not found' });
    }
    
    // Find all tourists currently in this zone
    const tourists = await Tourist.find({
      'currentLocation.zone': req.params.zoneId,
      isActive: true
    }).select('digitalId personalInfo currentLocation safetyStatus');
    
    res.json({
      zone: {
        zoneId: geofence.zoneId,
        name: geofence.name,
        type: geofence.type,
        riskLevel: geofence.riskLevel
      },
      tourists,
      count: tourists.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update geofence
router.put('/:zoneId', authenticateToken, authorizeRole(['authority']), async (req, res) => {
  try {
    const geofence = await Geofence.findOne({ zoneId: req.params.zoneId });
    
    if (!geofence) {
      return res.status(404).json({ error: 'Geofence not found' });
    }
    
    // Update allowed fields
    const allowedUpdates = ['name', 'description', 'riskLevel', 'alerts', 'isActive'];
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        geofence[field] = req.body[field];
      }
    });
    
    await geofence.save();
    
    res.json({
      message: 'Geofence updated successfully',
      geofence
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete geofence
router.delete('/:zoneId', authenticateToken, authorizeRole(['authority']), async (req, res) => {
  try {
    const geofence = await Geofence.findOneAndDelete({ zoneId: req.params.zoneId });
    
    if (!geofence) {
      return res.status(404).json({ error: 'Geofence not found' });
    }
    
    res.json({ message: 'Geofence deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get zone statistics
router.get('/:zoneId/stats', authenticateToken, authorizeRole(['authority']), async (req, res) => {
  try {
    const { timeRange = '24h' } = req.query;
    const geofence = await Geofence.findOne({ zoneId: req.params.zoneId });
    
    if (!geofence) {
      return res.status(404).json({ error: 'Geofence not found' });
    }
    
    // Calculate time range
    const now = new Date();
    let startTime;
    switch (timeRange) {
      case '1h':
        startTime = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '24h':
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      default:
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }
    
    // Get tourists who visited this zone in the time range
    const visitors = await Tourist.find({
      'locationHistory': {
        $elemMatch: {
          zone: req.params.zoneId,
          timestamp: { $gte: startTime }
        }
      }
    }).countDocuments();
    
    // Get incidents in this zone
    const Incident = require('../models/Incident');
    const incidents = await Incident.find({
      'location.zone': req.params.zoneId,
      createdAt: { $gte: startTime }
    }).countDocuments();
    
    res.json({
      zone: {
        zoneId: geofence.zoneId,
        name: geofence.name,
        type: geofence.type,
        riskLevel: geofence.riskLevel
      },
      timeRange,
      statistics: {
        visitors,
        incidents,
        currentTourists: geofence.currentStatus.touristCount,
        averageRiskScore: geofence.currentStatus.averageRiskScore,
        capacity: geofence.alerts.capacityAlert?.maxCapacity || 'unlimited'
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;