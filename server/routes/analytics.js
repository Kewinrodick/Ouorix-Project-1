const express = require('express');
const Tourist = require('../models/Tourist');
const Incident = require('../models/Incident');
const Geofence = require('../models/Geofence');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { generateGrid } = require('../utils/geoUtils');

const router = express.Router();

// Get tourist clusters and heatmap data
router.get('/heatmap', authenticateToken, authorizeRole(['authority']), async (req, res) => {
  try {
    const { bounds, timeRange = '24h' } = req.query;
    
    if (!bounds) {
      return res.status(400).json({ error: 'Bounds parameter required (north,south,east,west)' });
    }
    
    const [north, south, east, west] = bounds.split(',').map(Number);
    
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
    
    // Get tourist location data within bounds and time range
    const tourists = await Tourist.find({
      'currentLocation.latitude': { $gte: south, $lte: north },
      'currentLocation.longitude': { $gte: west, $lte: east },
      'currentLocation.lastUpdated': { $gte: startTime },
      isActive: true
    });
    
    // Generate grid for heatmap
    const grid = generateGrid({ north, south, east, west }, 20);
    
    // Calculate density for each grid point
    tourists.forEach(tourist => {
      const lat = tourist.currentLocation.latitude;
      const lon = tourist.currentLocation.longitude;
      
      // Find nearest grid points and add weight
      grid.forEach(point => {
        const distance = Math.sqrt(
          Math.pow(lat - point.lat, 2) + Math.pow(lon - point.lon, 2)
        );
        
        if (distance < 0.01) { // Approximately 1km
          point.weight += 1 / (distance + 0.001); // Inverse distance weighting
        }
      });
    });
    
    // Get incidents in the area
    const incidents = await Incident.find({
      'location.latitude': { $gte: south, $lte: north },
      'location.longitude': { $gte: west, $lte: east },
      createdAt: { $gte: startTime }
    });
    
    res.json({
      timeRange,
      bounds: { north, south, east, west },
      heatmapData: grid.filter(point => point.weight > 0),
      touristClusters: groupTouristsByProximity(tourists),
      incidents: incidents.map(inc => ({
        incidentId: inc.incidentId,
        type: inc.type,
        severity: inc.severity,
        location: inc.location,
        timestamp: inc.createdAt
      })),
      statistics: {
        totalTourists: tourists.length,
        totalIncidents: incidents.length,
        averageDensity: tourists.length / ((north - south) * (east - west))
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get comprehensive analytics dashboard
router.get('/dashboard', authenticateToken, authorizeRole(['authority']), async (req, res) => {
  try {
    const { timeRange = '24h' } = req.query;
    
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
      case '30d':
        startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }
    
    // Tourist statistics
    const totalTourists = await Tourist.countDocuments({ isActive: true });
    const activeTourists = await Tourist.countDocuments({
      isActive: true,
      'safetyStatus.lastActivity': { $gte: startTime }
    });
    
    const touristsByStatus = await Tourist.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$safetyStatus.status', count: { $sum: 1 } } }
    ]);
    
    // Incident statistics
    const totalIncidents = await Incident.countDocuments({
      createdAt: { $gte: startTime }
    });
    
    const incidentsByType = await Incident.aggregate([
      { $match: { createdAt: { $gte: startTime } } },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);
    
    const incidentsBySeverity = await Incident.aggregate([
      { $match: { createdAt: { $gte: startTime } } },
      { $group: { _id: '$severity', count: { $sum: 1 } } }
    ]);
    
    // Zone statistics
    const zoneStatistics = await Geofence.aggregate([
      { $match: { isActive: true } },
      {
        $lookup: {
          from: 'tourists',
          localField: 'zoneId',
          foreignField: 'currentLocation.zone',
          as: 'currentTourists'
        }
      },
      {
        $project: {
          zoneId: 1,
          name: 1,
          type: 1,
          riskLevel: 1,
          touristCount: { $size: '$currentTourists' }
        }
      }
    ]);
    
    // Response time analysis
    const resolvedIncidents = await Incident.find({
      createdAt: { $gte: startTime },
      status: 'resolved',
      'resolution.resolvedAt': { $exists: true }
    });
    
    const averageResponseTime = resolvedIncidents.length > 0
      ? resolvedIncidents.reduce((acc, inc) => {
          return acc + (new Date(inc.resolution.resolvedAt) - new Date(inc.createdAt));
        }, 0) / resolvedIncidents.length / (1000 * 60) // Convert to minutes
      : 0;
    
    res.json({
      timeRange,
      overview: {
        totalTourists,
        activeTourists,
        totalIncidents,
        averageResponseTime: Math.round(averageResponseTime)
      },
      touristAnalytics: {
        byStatus: touristsByStatus,
        activePercentage: totalTourists > 0 ? Math.round((activeTourists / totalTourists) * 100) : 0
      },
      incidentAnalytics: {
        byType: incidentsByType,
        bySeverity: incidentsBySeverity,
        resolutionRate: totalIncidents > 0 
          ? Math.round((resolvedIncidents.length / totalIncidents) * 100)
          : 0
      },
      zoneAnalytics: zoneStatistics,
      trends: await generateTrendData(startTime, now)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get AI anomaly detection results
router.get('/anomalies', authenticateToken, authorizeRole(['authority']), async (req, res) => {
  try {
    const aiService = require('../services/aiAnomalyDetection');
    const anomalies = await aiService.detectAnomalies();
    
    res.json({
      detectionTime: new Date(),
      anomalies,
      totalDetected: anomalies.length,
      riskLevels: {
        high: anomalies.filter(a => a.riskScore > 0.8).length,
        medium: anomalies.filter(a => a.riskScore > 0.5 && a.riskScore <= 0.8).length,
        low: anomalies.filter(a => a.riskScore <= 0.5).length
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate activity report
router.get('/report', authenticateToken, authorizeRole(['authority']), async (req, res) => {
  try {
    const { startDate, endDate, format = 'json' } = req.query;
    
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    
    const tourists = await Tourist.find({
      registrationDate: { $gte: start, $lte: end }
    });
    
    const incidents = await Incident.find({
      createdAt: { $gte: start, $lte: end }
    }).populate('reporter.touristId', 'personalInfo');
    
    const reportData = {
      period: { start, end },
      summary: {
        newTourists: tourists.length,
        totalIncidents: incidents.length,
        resolvedIncidents: incidents.filter(i => i.status === 'resolved').length,
        averageResolutionTime: calculateAverageResolutionTime(incidents)
      },
      detailedAnalysis: {
        incidentsByLocation: groupIncidentsByLocation(incidents),
        touristsByNationality: groupTouristsByNationality(tourists),
        incidentTrends: generateIncidentTrends(incidents, start, end)
      }
    };
    
    if (format === 'csv') {
      // Convert to CSV format
      const csv = convertToCSV(reportData);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=tourism-safety-report.csv');
      return res.send(csv);
    }
    
    res.json(reportData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper functions
function groupTouristsByProximity(tourists, threshold = 0.001) {
  const clusters = [];
  const visited = new Set();
  
  tourists.forEach((tourist, index) => {
    if (visited.has(index)) return;
    
    const cluster = [tourist];
    visited.add(index);
    
    tourists.forEach((other, otherIndex) => {
      if (visited.has(otherIndex)) return;
      
      const distance = Math.sqrt(
        Math.pow(tourist.currentLocation.latitude - other.currentLocation.latitude, 2) +
        Math.pow(tourist.currentLocation.longitude - other.currentLocation.longitude, 2)
      );
      
      if (distance < threshold) {
        cluster.push(other);
        visited.add(otherIndex);
      }
    });
    
    if (cluster.length > 1) {
      clusters.push({
        center: {
          latitude: cluster.reduce((sum, t) => sum + t.currentLocation.latitude, 0) / cluster.length,
          longitude: cluster.reduce((sum, t) => sum + t.currentLocation.longitude, 0) / cluster.length
        },
        count: cluster.length,
        tourists: cluster.map(t => ({
          digitalId: t.digitalId,
          name: `${t.personalInfo.firstName} ${t.personalInfo.lastName}`,
          status: t.safetyStatus.status
        }))
      });
    }
  });
  
  return clusters;
}

async function generateTrendData(startTime, endTime) {
  const intervals = 24; // 24 data points
  const intervalDuration = (endTime - startTime) / intervals;
  const trends = [];
  
  for (let i = 0; i < intervals; i++) {
    const intervalStart = new Date(startTime.getTime() + i * intervalDuration);
    const intervalEnd = new Date(startTime.getTime() + (i + 1) * intervalDuration);
    
    const tourists = await Tourist.countDocuments({
      'safetyStatus.lastActivity': { $gte: intervalStart, $lt: intervalEnd }
    });
    
    const incidents = await Incident.countDocuments({
      createdAt: { $gte: intervalStart, $lt: intervalEnd }
    });
    
    trends.push({
      timestamp: intervalStart,
      tourists,
      incidents
    });
  }
  
  return trends;
}

function calculateAverageResolutionTime(incidents) {
  const resolved = incidents.filter(i => i.status === 'resolved' && i.resolution?.resolvedAt);
  if (resolved.length === 0) return 0;
  
  return resolved.reduce((acc, inc) => {
    return acc + (new Date(inc.resolution.resolvedAt) - new Date(inc.createdAt));
  }, 0) / resolved.length / (1000 * 60); // Convert to minutes
}

function groupIncidentsByLocation(incidents) {
  return incidents.reduce((acc, incident) => {
    const zone = incident.location.zone || 'Unknown';
    if (!acc[zone]) acc[zone] = 0;
    acc[zone]++;
    return acc;
  }, {});
}

function groupTouristsByNationality(tourists) {
  return tourists.reduce((acc, tourist) => {
    const nationality = tourist.personalInfo.nationality || 'Unknown';
    if (!acc[nationality]) acc[nationality] = 0;
    acc[nationality]++;
    return acc;
  }, {});
}

function generateIncidentTrends(incidents, start, end) {
  // Group incidents by day
  const days = Math.ceil((end - start) / (24 * 60 * 60 * 1000));
  const trends = [];
  
  for (let i = 0; i < days; i++) {
    const dayStart = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
    const dayEnd = new Date(start.getTime() + (i + 1) * 24 * 60 * 60 * 1000);
    
    const dayIncidents = incidents.filter(inc => 
      inc.createdAt >= dayStart && inc.createdAt < dayEnd
    );
    
    trends.push({
      date: dayStart.toISOString().split('T')[0],
      count: dayIncidents.length
    });
  }
  
  return trends;
}

function convertToCSV(data) {
  // Simple CSV conversion - in production, use a proper CSV library
  let csv = 'Date,New Tourists,Total Incidents,Resolved Incidents,Avg Resolution Time\n';
  csv += `${data.period.start.toISOString().split('T')[0]},${data.summary.newTourists},${data.summary.totalIncidents},${data.summary.resolvedIncidents},${data.summary.averageResolutionTime}\n`;
  return csv;
}

module.exports = router;