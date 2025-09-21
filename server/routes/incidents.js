const express = require('express');
const Incident = require('../models/Incident');
const Tourist = require('../models/Tourist');
const Authority = require('../models/Authority');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Report new incident
router.post('/report', authenticateToken, async (req, res) => {
  try {
    const { type, severity, location, description, evidence } = req.body;
    
    // Generate unique incident ID
    const incidentId = `INC${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    
    // Get reporter information
    let reporter = {};
    if (req.user.type === 'tourist') {
      const tourist = await Tourist.findById(req.user.id);
      reporter = {
        touristId: tourist._id,
        digitalId: tourist.digitalId,
        name: `${tourist.personalInfo.firstName} ${tourist.personalInfo.lastName}`,
        phone: tourist.personalInfo.phone,
        reporterType: 'tourist'
      };
    } else if (req.user.type === 'authority') {
      const authority = await Authority.findById(req.user.id);
      reporter = {
        name: `${authority.personalInfo.firstName} ${authority.personalInfo.lastName}`,
        phone: authority.personalInfo.phone,
        reporterType: 'authority'
      };
    }
    
    const incident = new Incident({
      incidentId,
      type,
      severity: severity || 'medium',
      location,
      reporter,
      evidence: evidence || [],
      timeline: [{
        action: 'Incident reported',
        actor: reporter.name,
        timestamp: new Date(),
        description: description || `${type} incident reported`
      }]
    });
    
    await incident.save();
    
    res.status(201).json({
      message: 'Incident reported successfully',
      incident: {
        incidentId: incident.incidentId,
        type: incident.type,
        severity: incident.severity,
        status: incident.status,
        location: incident.location
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all incidents (for authorities)
router.get('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.type !== 'authority') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const { status, type, severity, page = 1, limit = 10 } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (severity) filter.severity = severity;
    
    const incidents = await Incident.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('reporter.touristId', 'digitalId personalInfo')
      .populate('assignedAuthority.authorityId', 'badgeNumber personalInfo');
    
    const total = await Incident.countDocuments(filter);
    
    res.json({
      incidents,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get specific incident
router.get('/:incidentId', authenticateToken, async (req, res) => {
  try {
    const incident = await Incident.findOne({ incidentId: req.params.incidentId })
      .populate('reporter.touristId', 'digitalId personalInfo')
      .populate('assignedAuthority.authorityId', 'badgeNumber personalInfo');
    
    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }
    
    // Check if user has access to this incident
    if (req.user.type === 'tourist') {
      if (incident.reporter.touristId?.toString() !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }
    
    res.json(incident);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Assign incident to authority
router.post('/:incidentId/assign', authenticateToken, async (req, res) => {
  try {
    if (req.user.type !== 'authority') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const { authorityId } = req.body;
    
    const incident = await Incident.findOne({ incidentId: req.params.incidentId });
    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }
    
    const authority = await Authority.findById(authorityId || req.user.id);
    if (!authority) {
      return res.status(404).json({ error: 'Authority not found' });
    }
    
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
      actor: `${authority.personalInfo.firstName} ${authority.personalInfo.lastName}`,
      timestamp: new Date(),
      description: `Incident assigned to ${authority.personalInfo.department}`
    });
    
    await incident.save();
    
    res.json({
      message: 'Incident assigned successfully',
      assignedTo: incident.assignedAuthority
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update incident status
router.patch('/:incidentId/status', authenticateToken, async (req, res) => {
  try {
    if (req.user.type !== 'authority') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const { status, description } = req.body;
    
    const incident = await Incident.findOne({ incidentId: req.params.incidentId });
    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }
    
    const oldStatus = incident.status;
    incident.status = status;
    
    incident.timeline.push({
      action: `Status changed from ${oldStatus} to ${status}`,
      actor: req.user.badgeNumber || req.user.digitalId,
      timestamp: new Date(),
      description: description || `Incident status updated to ${status}`
    });
    
    if (status === 'resolved') {
      incident.resolution = {
        description: description || 'Incident resolved',
        resolvedBy: req.user.badgeNumber || req.user.digitalId,
        resolvedAt: new Date(),
        followUpRequired: false
      };
    }
    
    await incident.save();
    
    res.json({
      message: 'Incident status updated',
      incident: {
        incidentId: incident.incidentId,
        status: incident.status,
        timeline: incident.timeline
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// File e-FIR
router.post('/:incidentId/efir', authenticateToken, async (req, res) => {
  try {
    if (req.user.type !== 'authority') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const { policeStation, officerInCharge, details } = req.body;
    
    const incident = await Incident.findOne({ incidentId: req.params.incidentId });
    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }
    
    // Generate FIR number
    const firNumber = `FIR${Date.now()}${Math.random().toString(36).substr(2, 3).toUpperCase()}`;
    
    incident.eFIR = {
      firNumber,
      status: 'filed',
      filedAt: new Date(),
      policeStation,
      officerInCharge
    };
    
    incident.timeline.push({
      action: 'e-FIR filed',
      actor: req.user.badgeNumber,
      timestamp: new Date(),
      description: `e-FIR ${firNumber} filed at ${policeStation}`
    });
    
    await incident.save();
    
    res.json({
      message: 'e-FIR filed successfully',
      firNumber,
      eFIR: incident.eFIR
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get incident statistics
router.get('/stats/overview', authenticateToken, async (req, res) => {
  try {
    if (req.user.type !== 'authority') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const totalIncidents = await Incident.countDocuments();
    const openIncidents = await Incident.countDocuments({ status: 'open' });
    const inProgressIncidents = await Incident.countDocuments({ status: 'in_progress' });
    const resolvedIncidents = await Incident.countDocuments({ status: 'resolved' });
    
    const incidentsByType = await Incident.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);
    
    const incidentsBySeverity = await Incident.aggregate([
      { $group: { _id: '$severity', count: { $sum: 1 } } }
    ]);
    
    res.json({
      overview: {
        total: totalIncidents,
        open: openIncidents,
        inProgress: inProgressIncidents,
        resolved: resolvedIncidents
      },
      byType: incidentsByType,
      bySeverity: incidentsBySeverity
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;