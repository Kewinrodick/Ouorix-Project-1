import Geolocation from 'react-native-geolocation-service';
import { PermissionsAndroid, Platform, Alert } from 'react-native';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

class LocationService {
  constructor() {
    this.watchId = null;
    this.currentLocation = null;
    this.isTracking = false;
    this.locationUpdateInterval = 30000; // 30 seconds
  }

  async initialize() {
    try {
      const hasPermission = await this.requestLocationPermission();
      if (hasPermission) {
        await this.getCurrentLocation();
        this.startLocationTracking();
      }
    } catch (error) {
      console.error('Location service initialization error:', error);
    }
  }

  async requestLocationPermission() {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'Ouorix Safety needs access to your location for safety monitoring and emergency services.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      return true; // iOS permissions handled differently
    } catch (error) {
      console.error('Permission request error:', error);
      return false;
    }
  }

  async getCurrentLocation() {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        async (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date(position.timestamp),
          };
          
          // Add address if possible
          try {
            const address = await this.reverseGeocode(location.latitude, location.longitude);
            location.address = address;
          } catch (error) {
            console.log('Reverse geocoding failed:', error);
          }
          
          this.currentLocation = location;
          resolve(location);
        },
        (error) => {
          console.error('Get current location error:', error);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        }
      );
    });
  }

  startLocationTracking() {
    if (this.isTracking) return;

    this.isTracking = true;
    this.watchId = Geolocation.watchPosition(
      async (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date(position.timestamp),
        };

        this.currentLocation = location;
        
        // Send location update to server
        try {
          await this.updateLocationOnServer(location);
        } catch (error) {
          console.error('Failed to update location on server:', error);
        }
      },
      (error) => {
        console.error('Location tracking error:', error);
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 10, // Update every 10 meters
        interval: this.locationUpdateInterval,
        fastestInterval: 10000, // Fastest update every 10 seconds
      }
    );
  }

  stopLocationTracking() {
    if (this.watchId !== null) {
      Geolocation.clearWatch(this.watchId);
      this.watchId = null;
      this.isTracking = false;
    }
  }

  async updateLocationOnServer(location) {
    try {
      const response = await axios.post(`${API_BASE_URL}/tourists/location`, {
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address,
        accuracy: location.accuracy,
      });
      
      return response.data;
    } catch (error) {
      console.error('Server location update error:', error);
      throw error;
    }
  }

  async reverseGeocode(latitude, longitude) {
    try {
      // In a real app, use a proper geocoding service like Google Maps
      // For demo purposes, return a mock address
      return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return null;
    }
  }

  async checkGeofences(latitude, longitude) {
    try {
      const response = await axios.post(`${API_BASE_URL}/geofence/check`, {
        latitude,
        longitude,
      });
      
      return response.data;
    } catch (error) {
      console.error('Geofence check error:', error);
      return { zones: [], alertsTriggered: [] };
    }
  }

  getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  async shareLocationWithFamily() {
    try {
      if (!this.currentLocation) {
        await this.getCurrentLocation();
      }
      
      // Implementation would send location to family members
      return {
        success: true,
        location: this.currentLocation,
        sharedAt: new Date(),
      };
    } catch (error) {
      console.error('Share location error:', error);
      throw error;
    }
  }

  async getNearbyEmergencyServices(radius = 5000) {
    try {
      if (!this.currentLocation) {
        await this.getCurrentLocation();
      }

      // Mock emergency services data
      return [
        {
          id: 1,
          name: 'City Police Station',
          type: 'police',
          distance: 1200,
          phone: '911',
          address: 'Main Street 123',
        },
        {
          id: 2,
          name: 'General Hospital',
          type: 'hospital',
          distance: 800,
          phone: '911',
          address: 'Health Avenue 456',
        },
        {
          id: 3,
          name: 'Fire Department',
          type: 'fire',
          distance: 1500,
          phone: '911',
          address: 'Safety Road 789',
        },
      ];
    } catch (error) {
      console.error('Get emergency services error:', error);
      return [];
    }
  }
}

export default new LocationService();