const tf = require('@tensorflow/tfjs-node');
const Tourist = require('../models/Tourist');
const Incident = require('../models/Incident');
const { calculateDistance, calculateBearing } = require('../utils/geoUtils');

class AIAnomalyDetection {
  constructor() {
    this.initialized = false;
    this.model = null;
    this.thresholds = {
      routeDeviation: 0.005, // ~500m in degrees
      inactivityTime: 30 * 60 * 1000, // 30 minutes in milliseconds
      speedAnomaly: 50, // km/h threshold for speed anomalies
      heartRateAnomaly: { min: 50, max: 150 },
      distressPattern: 0.7 // Confidence threshold for distress patterns
    };
  }

  async initialize() {
    try {
      // In production, load a pre-trained model
      // For demo, create a simple model structure
      this.model = tf.sequential({
        layers: [
          tf.layers.dense({ inputShape: [10], units: 64, activation: 'relu' }),
          tf.layers.dense({ units: 32, activation: 'relu' }),
          tf.layers.dense({ units: 16, activation: 'relu' }),
          tf.layers.dense({ units: 1, activation: 'sigmoid' })
        ]
      });

      this.model.compile({
        optimizer: 'adam',
        loss: 'binaryCrossentropy',
        metrics: ['accuracy']
      });

      this.initialized = true;
      console.log('AI Anomaly Detection service initialized');
    } catch (error) {
      console.error('Failed to initialize AI service:', error);
    }
  }

  async detectAnomalies() {
    if (!this.initialized) {
      await this.initialize();
    }

    const anomalies = [];
    
    try {
      // Get all active tourists
      const tourists = await Tourist.find({ 
        isActive: true,
        'currentLocation.lastUpdated': { 
          $gte: new Date(Date.now() - 2 * 60 * 60 * 1000) // Last 2 hours
        }
      });

      for (const tourist of tourists) {
        const touristAnomalies = await this.analyzeTourist(tourist);
        anomalies.push(...touristAnomalies);
      }

      return anomalies;
    } catch (error) {
      console.error('Error detecting anomalies:', error);
      return [];
    }
  }

  async analyzeTourist(tourist) {
    const anomalies = [];
    
    try {
      // Route deviation detection
      const routeAnomaly = await this.detectRouteDeviation(tourist);
      if (routeAnomaly) anomalies.push(routeAnomaly);

      // Inactivity detection
      const inactivityAnomaly = this.detectInactivity(tourist);
      if (inactivityAnomaly) anomalies.push(inactivityAnomaly);

      // Speed anomaly detection
      const speedAnomaly = this.detectSpeedAnomaly(tourist);
      if (speedAnomaly) anomalies.push(speedAnomaly);

      // IoT device anomaly detection
      const iotAnomaly = this.detectIoTAnomalies(tourist);
      if (iotAnomaly) anomalies.push(iotAnomaly);

      // Behavioral pattern analysis
      const behaviorAnomaly = await this.detectBehaviorAnomaly(tourist);
      if (behaviorAnomaly) anomalies.push(behaviorAnomaly);

    } catch (error) {
      console.error(`Error analyzing tourist ${tourist.digitalId}:`, error);
    }

    return anomalies;
  }

  async detectRouteDeviation(tourist) {
    if (!tourist.safetyStatus.expectedRoute || tourist.locationHistory.length < 2) {
      return null;
    }

    const recentLocations = tourist.locationHistory.slice(-5); // Last 5 locations
    const currentLocation = tourist.currentLocation;

    // Calculate if tourist has deviated significantly from expected route
    // For simplicity, check if current location is too far from the last expected point
    const expectedRoutePoints = this.parseRoute(tourist.safetyStatus.expectedRoute);
    
    if (expectedRoutePoints.length === 0) return null;

    const nearestExpectedPoint = this.findNearestPoint(currentLocation, expectedRoutePoints);
    const deviation = calculateDistance(
      currentLocation.latitude,
      currentLocation.longitude,
      nearestExpectedPoint.latitude,
      nearestExpectedPoint.longitude
    );

    if (deviation > this.thresholds.routeDeviation * 111000) { // Convert degrees to meters
      return {
        type: 'route_deviation',
        touristId: tourist.digitalId,
        severity: deviation > this.thresholds.routeDeviation * 222000 ? 'high' : 'medium',
        riskScore: Math.min(deviation / (this.thresholds.routeDeviation * 111000), 1),
        details: {
          deviation: Math.round(deviation),
          expectedLocation: nearestExpectedPoint,
          currentLocation: {
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude
          }
        },
        timestamp: new Date(),
        description: `Tourist deviated ${Math.round(deviation)}m from expected route`
      };
    }

    return null;
  }

  detectInactivity(tourist) {
    const lastActivity = new Date(tourist.safetyStatus.lastActivity);
    const now = new Date();
    const inactiveTime = now - lastActivity;

    if (inactiveTime > this.thresholds.inactivityTime) {
      const riskScore = Math.min(inactiveTime / (this.thresholds.inactivityTime * 2), 1);
      
      return {
        type: 'inactivity',
        touristId: tourist.digitalId,
        severity: riskScore > 0.7 ? 'high' : 'medium',
        riskScore,
        details: {
          inactiveTime: Math.round(inactiveTime / (1000 * 60)), // minutes
          lastActivity: lastActivity,
          lastLocation: tourist.currentLocation
        },
        timestamp: new Date(),
        description: `Tourist inactive for ${Math.round(inactiveTime / (1000 * 60))} minutes`
      };
    }

    return null;
  }

  detectSpeedAnomaly(tourist) {
    if (tourist.locationHistory.length < 2) return null;

    const recent = tourist.locationHistory.slice(-2);
    const [prev, current] = recent;

    if (!prev || !current) return null;

    const distance = calculateDistance(
      prev.latitude, prev.longitude,
      current.latitude, current.longitude
    );

    const timeDiff = (new Date(current.timestamp) - new Date(prev.timestamp)) / 1000; // seconds
    const speed = (distance / timeDiff) * 3.6; // km/h

    if (speed > this.thresholds.speedAnomaly) {
      return {
        type: 'speed_anomaly',
        touristId: tourist.digitalId,
        severity: speed > this.thresholds.speedAnomaly * 2 ? 'high' : 'medium',
        riskScore: Math.min(speed / (this.thresholds.speedAnomaly * 2), 1),
        details: {
          speed: Math.round(speed),
          distance: Math.round(distance),
          timeDiff: Math.round(timeDiff),
          locations: [prev, current]
        },
        timestamp: new Date(),
        description: `Unusual speed detected: ${Math.round(speed)} km/h`
      };
    }

    return null;
  }

  detectIoTAnomalies(tourist) {
    if (!tourist.wearableDevice.deviceId || !tourist.wearableDevice.vitals) {
      return null;
    }

    const vitals = tourist.wearableDevice.vitals;
    const anomalies = [];

    // Heart rate anomaly
    if (vitals.heartRate) {
      const { min, max } = this.thresholds.heartRateAnomaly;
      if (vitals.heartRate < min || vitals.heartRate > max) {
        return {
          type: 'vitals_anomaly',
          touristId: tourist.digitalId,
          severity: vitals.heartRate < 40 || vitals.heartRate > 180 ? 'high' : 'medium',
          riskScore: vitals.heartRate < min 
            ? (min - vitals.heartRate) / min 
            : (vitals.heartRate - max) / max,
          details: {
            heartRate: vitals.heartRate,
            normalRange: { min, max },
            deviceId: tourist.wearableDevice.deviceId,
            lastReading: vitals.lastReading
          },
          timestamp: new Date(),
          description: `Abnormal heart rate detected: ${vitals.heartRate} BPM`
        };
      }
    }

    // Device connectivity
    const lastSync = new Date(tourist.wearableDevice.lastSync);
    const syncAge = (new Date() - lastSync) / (1000 * 60); // minutes

    if (syncAge > 60) { // No sync for over 1 hour
      return {
        type: 'device_connectivity',
        touristId: tourist.digitalId,
        severity: syncAge > 180 ? 'high' : 'medium',
        riskScore: Math.min(syncAge / 180, 1),
        details: {
          lastSync: lastSync,
          syncAge: Math.round(syncAge),
          deviceId: tourist.wearableDevice.deviceId,
          batteryLevel: tourist.wearableDevice.batteryLevel
        },
        timestamp: new Date(),
        description: `Device not synced for ${Math.round(syncAge)} minutes`
      };
    }

    return null;
  }

  async detectBehaviorAnomaly(tourist) {
    try {
      // Get recent incidents involving this tourist
      const recentIncidents = await Incident.find({
        'reporter.touristId': tourist._id,
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      });

      // Multiple incidents in short time frame
      if (recentIncidents.length >= 3) {
        return {
          type: 'behavior_pattern',
          touristId: tourist.digitalId,
          severity: 'high',
          riskScore: 0.8,
          details: {
            incidentCount: recentIncidents.length,
            incidentTypes: recentIncidents.map(i => i.type),
            timeframe: '24 hours'
          },
          timestamp: new Date(),
          description: `Multiple incidents (${recentIncidents.length}) reported in 24 hours`
        };
      }

      // Use ML model for pattern recognition (simplified)
      const features = this.extractFeatures(tourist);
      if (features && this.model) {
        const prediction = this.model.predict(tf.tensor2d([features]));
        const riskScore = await prediction.data();
        
        if (riskScore[0] > this.thresholds.distressPattern) {
          return {
            type: 'ml_distress_pattern',
            touristId: tourist.digitalId,
            severity: riskScore[0] > 0.85 ? 'high' : 'medium',
            riskScore: riskScore[0],
            details: {
              features: this.getFeatureNames(),
              confidence: riskScore[0],
              modelVersion: '1.0'
            },
            timestamp: new Date(),
            description: `ML model detected distress pattern (confidence: ${Math.round(riskScore[0] * 100)}%)`
          };
        }
      }

      return null;
    } catch (error) {
      console.error('Error in behavior anomaly detection:', error);
      return null;
    }
  }

  extractFeatures(tourist) {
    try {
      // Extract features for ML model (10 features)
      const now = new Date();
      const lastActivity = new Date(tourist.safetyStatus.lastActivity);
      const inactiveMinutes = (now - lastActivity) / (1000 * 60);
      
      return [
        tourist.safetyStatus.riskScore || 0,
        inactiveMinutes / 60, // Normalize to hours
        tourist.locationHistory.length / 100, // Normalize location history count
        tourist.wearableDevice.vitals?.heartRate || 70, // Default heart rate
        tourist.wearableDevice.batteryLevel || 100,
        tourist.currentLocation.latitude,
        tourist.currentLocation.longitude,
        (now - new Date(tourist.registrationDate)) / (1000 * 60 * 60 * 24), // Days since registration
        tourist.familyTracking.enabled ? 1 : 0,
        tourist.safetyStatus.status === 'emergency' ? 1 : 0
      ];
    } catch (error) {
      console.error('Error extracting features:', error);
      return null;
    }
  }

  getFeatureNames() {
    return [
      'risk_score', 'inactive_hours', 'location_history', 'heart_rate',
      'battery_level', 'latitude', 'longitude', 'days_registered',
      'family_tracking', 'emergency_status'
    ];
  }

  parseRoute(routeString) {
    try {
      // Simple route parsing - in production, use proper route parsing
      return JSON.parse(routeString);
    } catch {
      return [];
    }
  }

  findNearestPoint(currentLocation, routePoints) {
    if (routePoints.length === 0) {
      return currentLocation;
    }

    let nearest = routePoints[0];
    let minDistance = calculateDistance(
      currentLocation.latitude, currentLocation.longitude,
      nearest.latitude, nearest.longitude
    );

    for (const point of routePoints) {
      const distance = calculateDistance(
        currentLocation.latitude, currentLocation.longitude,
        point.latitude, point.longitude
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        nearest = point;
      }
    }

    return nearest;
  }
}

module.exports = new AIAnomalyDetection();