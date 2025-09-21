const express = require('express');
const Authority = require('../models/Authority');
const Tourist = require('../models/Tourist');
const Incident = require('../models/Incident');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

// Get authority dashboard data
router.get('/dashboard', authenticateToken, authorizeRole(['authority']), async (req, res) => {
  try {
    const authority = await Authority.findById(req.user.id);
    
    if (!authority) {
      return res.status(404).json({ error: 'Authority not found' });
    }
    
    // Get real-time statistics
    const activeTourists = await Tourist.countDocuments({ 
      isActive: true,
      'safetyStatus.status': { $in: ['safe', 'at-risk'] }
    });
    
    const emergencyAlerts = await Tourist.countDocuments({
      'safetyStatus.status': 'emergency'
    });
    
    const openIncidents = await Incident.countDocuments({
      status: { $in: ['open', 'in_progress'] }
    });
    
    const assignedIncidents = await Incident.countDocuments({
      'assignedAuthority.authorityId': authority._id,
      status: { $in: ['open', 'in_progress'] }
    });
    
    // Get recent incidents
    const recentIncidents = await Incident.find({
      status: { $in: ['open', 'in_progress'] }
    })
    .sort({ createdAt: -1 })
    .limit(10)
    .populate('reporter.touristId', 'digitalId personalInfo');
    
    res.json({
      authority: {
        name: `${authority.personalInfo.firstName} ${authority.personalInfo.lastName}`,
        badge: authority.badgeNumber,
        department: authority.personalInfo.department,
        status: authority.currentStatus.status
      },
      statistics: {
        activeTourists,
        emergencyAlerts,
        openIncidents,
        assignedIncidents
      },
      recentIncidents
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get real-time tourist locations for map view
router.get('/tourists/locations', authenticateToken, authorizeRole(['authority']), async (req, res) => {
  try {
    const { zone, status } = req.query;
    
    const filter = { isActive: true };
    if (zone) filter['currentLocation.zone'] = zone;
    if (status) filter['safetyStatus.status'] = status;
    
    const tourists = await Tourist.find(filter)
      .select('digitalId personalInfo currentLocation safetyStatus wearableDevice')
      .sort({ 'currentLocation.lastUpdated': -1 });
    
    // Group tourists by location zones for clustering
    const clusters = tourists.reduce((acc, tourist) => {
      const zone = tourist.currentLocation.zone || 'unknown';
      if (!acc[zone]) {
        acc[zone] = [];
      }
      acc[zone].push({
        digitalId: tourist.digitalId,
        name: `${tourist.personalInfo.firstName} ${tourist.personalInfo.lastName}`,
        location: tourist.currentLocation,
        safetyStatus: tourist.safetyStatus.status,
        lastActivity: tourist.safetyStatus.lastActivity,
        deviceConnected: !!tourist.wearableDevice.deviceId
      });
      return acc;
    }, {});
    
    res.json({
      totalTourists: tourists.length,
      clusters
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update authority status
router.post('/status', authenticateToken, authorizeRole(['authority']), async (req, res) => {
  try {
    const { status, location } = req.body;
    
    const authority = await Authority.findById(req.user.id);
    if (!authority) {
      return res.status(404).json({ error: 'Authority not found' });
    }
    
    authority.currentStatus.status = status;
    if (location) {
      authority.currentStatus.location = {
        ...location,
        lastUpdated: new Date()
      };
    }
    authority.lastActivity = new Date();
    
    await authority.save();
    
    res.json({
      message: 'Status updated successfully',
      status: authority.currentStatus
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get authority performance metrics
router.get('/performance', authenticateToken, authorizeRole(['authority']), async (req, res) => {
  try {
    const authority = await Authority.findById(req.user.id);
    
    if (!authority) {
      return res.status(404).json({ error: 'Authority not found' });
    }
    
    // Calculate additional metrics
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const recentIncidents = await Incident.find({
      'assignedAuthority.authorityId': authority._id,
      createdAt: { $gte: thirtyDaysAgo }
    });
    
    const resolvedIncidents = recentIncidents.filter(inc => inc.status === 'resolved');
    const averageResolutionTime = resolvedIncidents.length > 0 
      ? resolvedIncidents.reduce((acc, inc) => {
          if (inc.resolution?.resolvedAt) {
            return acc + (new Date(inc.resolution.resolvedAt) - new Date(inc.createdAt));
          }
          return acc;
        }, 0) / resolvedIncidents.length / (1000 * 60) // Convert to minutes
      : 0;
    
    res.json({
      period: '30 days',
      metrics: {
        totalIncidents: recentIncidents.length,
        resolvedIncidents: resolvedIncidents.length,
        pendingIncidents: recentIncidents.filter(inc => inc.status !== 'resolved').length,
        averageResolutionTime: Math.round(averageResolutionTime),
        successRate: recentIncidents.length > 0 
          ? Math.round((resolvedIncidents.length / recentIncidents.length) * 100)
          : 0
      },
      ratings: authority.performance.ratings
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all authorities (admin only)
router.get('/', authenticateToken, authorizeRole(['authority']), async (req, res) => {
  try {
    const { department, status } = req.query;
    
    const filter = { isActive: true };
    if (department) filter['personalInfo.department'] = department;
    if (status) filter['currentStatus.status'] = status;
    
    const authorities = await Authority.find(filter)
      .select('badgeNumber personalInfo currentStatus performance')
      .sort({ 'personalInfo.lastName': 1 });
    
    res.json(authorities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Assign incident to authority
router.post('/assign-incident', authenticateToken, authorizeRole(['authority']), async (req, res) => {
  try {
    const { incidentId, authorityId } = req.body;
    
    const incident = await Incident.findOne({ incidentId });
    const authority = await Authority.findById(authorityId);
    
    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }
    
    if (!authority) {
      return res.status(404).json({ error: 'Authority not found' });
    }
    
    // Update incident assignment
    incident.assignedAuthority = {
      authorityId: authority._id,
      name: `${authority.personalInfo.firstName} ${authority.personalInfo.lastName}`,
      badge: authority.badgeNumber,
      department: authority.personalInfo.department,
      assignedAt: new Date()
    };
    
    incident.status = 'in_progress';
    incident.timeline.push({
      action: 'Incident assigned',
      actor: req.user.badgeNumber,
      timestamp: new Date(),
      description: `Assigned to ${authority.personalInfo.firstName} ${authority.personalInfo.lastName}`
    });
    
    // Update authority's assigned incidents
    authority.currentStatus.assignedIncidents.push({
      incidentId: incident.incidentId,
      assignedAt: new Date(),
      priority: incident.severity
    });
    
    await Promise.all([incident.save(), authority.save()]);
    
    res.json({
      message: 'Incident assigned successfully',
      assignment: {
        incidentId: incident.incidentId,
        assignedTo: authority.badgeNumber,
        department: authority.personalInfo.department
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;