const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Tourist = require('../models/Tourist');
const Authority = require('../models/Authority');

const router = express.Router();

// Register Tourist
router.post('/register/tourist', async (req, res) => {
  try {
    const { personalInfo, currentLocation } = req.body;
    
    // Generate unique digital ID
    const digitalId = `TUR${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    
    // Check if email already exists
    const existingTourist = await Tourist.findOne({ 'personalInfo.email': personalInfo.email });
    if (existingTourist) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    const tourist = new Tourist({
      digitalId,
      personalInfo,
      currentLocation: {
        ...currentLocation,
        lastUpdated: new Date()
      }
    });
    
    await tourist.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { id: tourist._id, digitalId: tourist.digitalId, type: 'tourist' },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );
    
    res.status(201).json({
      message: 'Tourist registered successfully',
      tourist: {
        digitalId: tourist.digitalId,
        personalInfo: tourist.personalInfo,
        currentLocation: tourist.currentLocation
      },
      token
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Register Authority
router.post('/register/authority', async (req, res) => {
  try {
    const { personalInfo, badgeNumber, jurisdiction } = req.body;
    
    // Check if badge number already exists
    const existingAuthority = await Authority.findOne({ badgeNumber });
    if (existingAuthority) {
      return res.status(400).json({ error: 'Badge number already registered' });
    }
    
    const authority = new Authority({
      badgeNumber,
      personalInfo,
      jurisdiction
    });
    
    await authority.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { id: authority._id, badgeNumber: authority.badgeNumber, type: 'authority' },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );
    
    res.status(201).json({
      message: 'Authority registered successfully',
      authority: {
        badgeNumber: authority.badgeNumber,
        personalInfo: authority.personalInfo,
        jurisdiction: authority.jurisdiction
      },
      token
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { identifier, userType } = req.body; // identifier can be email, digitalId, or badgeNumber
    
    let user;
    let token;
    
    if (userType === 'tourist') {
      user = await Tourist.findOne({
        $or: [
          { 'personalInfo.email': identifier },
          { digitalId: identifier }
        ]
      });
      
      if (user) {
        user.lastLogin = new Date();
        await user.save();
        
        token = jwt.sign(
          { id: user._id, digitalId: user.digitalId, type: 'tourist' },
          process.env.JWT_SECRET || 'fallback_secret',
          { expiresIn: '24h' }
        );
      }
    } else if (userType === 'authority') {
      user = await Authority.findOne({
        $or: [
          { 'personalInfo.email': identifier },
          { badgeNumber: identifier }
        ]
      });
      
      if (user) {
        user.dashboardAccess.lastLogin = new Date();
        await user.save();
        
        token = jwt.sign(
          { id: user._id, badgeNumber: user.badgeNumber, type: 'authority' },
          process.env.JWT_SECRET || 'fallback_secret',
          { expiresIn: '24h' }
        );
      }
    }
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    res.json({
      message: 'Login successful',
      user: userType === 'tourist' ? {
        digitalId: user.digitalId,
        personalInfo: user.personalInfo
      } : {
        badgeNumber: user.badgeNumber,
        personalInfo: user.personalInfo
      },
      token
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify Token
router.get('/verify', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    
    let user;
    if (decoded.type === 'tourist') {
      user = await Tourist.findById(decoded.id);
    } else if (decoded.type === 'authority') {
      user = await Authority.findById(decoded.id);
    }
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    res.json({
      valid: true,
      user: {
        id: user._id,
        type: decoded.type,
        ...(decoded.type === 'tourist' ? { digitalId: user.digitalId } : { badgeNumber: user.badgeNumber })
      }
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;