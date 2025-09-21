import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Vibration,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Button, Card, Badge } from 'react-native-paper';
import LocationService from '../../services/LocationService';
import SocketService from '../../services/SocketService';
import NotificationService from '../../services/NotificationService';

const EmergencyScreen = ({ navigation }) => {
  const [isPanicActive, setIsPanicActive] = useState(false);
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);

  useEffect(() => {
    getCurrentLocation();
    loadEmergencyContacts();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const location = await LocationService.getCurrentLocation();
      setCurrentLocation(location);
    } catch (error) {
      console.error('Failed to get location:', error);
    }
  };

  const loadEmergencyContacts = () => {
    // Load from storage or API
    setEmergencyContacts([
      { id: 1, name: 'Local Police', phone: '911', type: 'police' },
      { id: 2, name: 'Medical Emergency', phone: '911', type: 'medical' },
      { id: 3, name: 'Tourist Helpline', phone: '+1-800-TOURIST', type: 'tourist' },
      { id: 4, name: 'Embassy', phone: '+1-800-EMBASSY', type: 'embassy' },
    ]);
  };

  const activatePanicButton = async () => {
    try {
      if (isPanicActive) return;

      Alert.alert(
        'Emergency Alert',
        'Are you sure you want to activate the panic button? This will alert authorities immediately.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'ACTIVATE',
            style: 'destructive',
            onPress: confirmPanicActivation,
          },
        ]
      );
    } catch (error) {
      console.error('Panic button error:', error);
      Alert.alert('Error', 'Failed to activate panic button. Please try again.');
    }
  };

  const confirmPanicActivation = async () => {
    try {
      setIsPanicActive(true);

      // Vibrate phone
      Vibration.vibrate([0, 500, 200, 500]);

      // Get current location
      const location = await LocationService.getCurrentLocation();

      // Send panic alert to server
      const panicData = {
        location,
        timestamp: new Date().toISOString(),
        message: 'EMERGENCY: Panic button activated',
        severity: 'critical',
      };

      await SocketService.emit('panic-alert', panicData);

      // Send local notification
      await NotificationService.showNotification(
        'Emergency Alert Sent',
        'Authorities have been notified of your emergency'
      );

      Alert.alert(
        'Emergency Alert Sent',
        'Authorities have been notified. Help is on the way. Stay calm and stay safe.',
        [{ text: 'OK' }]
      );

      // Auto-deactivate after 5 minutes if not manually deactivated
      setTimeout(() => {
        setIsPanicActive(false);
      }, 5 * 60 * 1000);

    } catch (error) {
      console.error('Failed to send panic alert:', error);
      setIsPanicActive(false);
      Alert.alert('Error', 'Failed to send emergency alert. Please try calling emergency services directly.');
    }
  };

  const deactivatePanic = () => {
    Alert.alert(
      'Deactivate Emergency',
      'Are you safe now? This will stop the emergency alert.',
      [
        { text: 'No, Keep Active', style: 'cancel' },
        {
          text: 'Yes, I\'m Safe',
          onPress: () => {
            setIsPanicActive(false);
            SocketService.emit('panic-deactivated');
          },
        },
      ]
    );
  };

  const callEmergencyContact = (contact) => {
    Alert.alert(
      `Call ${contact.name}`,
      `Do you want to call ${contact.phone}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call',
          onPress: () => {
            // In a real app, use Linking.openURL(`tel:${contact.phone}`)
            Alert.alert('Calling', `Calling ${contact.name} at ${contact.phone}`);
          },
        },
      ]
    );
  };

  const getContactIcon = (type) => {
    switch (type) {
      case 'police': return 'local-police';
      case 'medical': return 'local-hospital';
      case 'tourist': return 'info';
      case 'embassy': return 'account-balance';
      default: return 'phone';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Emergency Services</Text>
        {isPanicActive && (
          <Badge style={styles.activeBadge}>EMERGENCY ACTIVE</Badge>
        )}
      </View>

      {/* Panic Button */}
      <Card style={[styles.panicCard, isPanicActive && styles.panicCardActive]}>
        <Card.Content style={styles.panicContent}>
          <TouchableOpacity
            style={[styles.panicButton, isPanicActive && styles.panicButtonActive]}
            onPress={isPanicActive ? deactivatePanic : activatePanicButton}
            disabled={false}
          >
            <Icon
              name={isPanicActive ? 'cancel' : 'warning'}
              size={60}
              color="#fff"
            />
            <Text style={styles.panicButtonText}>
              {isPanicActive ? 'DEACTIVATE' : 'PANIC'}
            </Text>
          </TouchableOpacity>
          
          <Text style={styles.panicDescription}>
            {isPanicActive
              ? 'Emergency alert is active. Authorities have been notified.'
              : 'Press and hold to send immediate emergency alert to authorities'
            }
          </Text>
        </Card.Content>
      </Card>

      {/* Quick Actions */}
      <Card style={styles.quickActionsCard}>
        <Card.Title title="Quick Actions" titleStyle={styles.cardTitle} />
        <Card.Content>
          <View style={styles.quickActionsRow}>
            <TouchableOpacity style={styles.quickAction} onPress={() => Alert.alert('Feature', 'Share location with family')}>
              <Icon name="my-location" size={30} color="#3498db" />
              <Text style={styles.quickActionText}>Share Location</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickAction} onPress={() => Alert.alert('Feature', 'Record audio evidence')}>
              <Icon name="mic" size={30} color="#e74c3c" />
              <Text style={styles.quickActionText}>Record Audio</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickAction} onPress={() => Alert.alert('Feature', 'Take photo evidence')}>
              <Icon name="camera-alt" size={30} color="#f39c12" />
              <Text style={styles.quickActionText}>Take Photo</Text>
            </TouchableOpacity>
          </View>
        </Card.Content>
      </Card>

      {/* Emergency Contacts */}
      <Card style={styles.contactsCard}>
        <Card.Title title="Emergency Contacts" titleStyle={styles.cardTitle} />
        <Card.Content>
          {emergencyContacts.map((contact) => (
            <TouchableOpacity
              key={contact.id}
              style={styles.contactItem}
              onPress={() => callEmergencyContact(contact)}
            >
              <Icon
                name={getContactIcon(contact.type)}
                size={24}
                color="#3498db"
                style={styles.contactIcon}
              />
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{contact.name}</Text>
                <Text style={styles.contactPhone}>{contact.phone}</Text>
              </View>
              <Icon name="phone" size={20} color="#27ae60" />
            </TouchableOpacity>
          ))}
        </Card.Content>
      </Card>

      {/* Current Location */}
      {currentLocation && (
        <Card style={styles.locationCard}>
          <Card.Title title="Current Location" titleStyle={styles.cardTitle} />
          <Card.Content>
            <Text style={styles.locationText}>
              Lat: {currentLocation.latitude.toFixed(6)}
            </Text>
            <Text style={styles.locationText}>
              Lng: {currentLocation.longitude.toFixed(6)}
            </Text>
            {currentLocation.address && (
              <Text style={styles.addressText}>{currentLocation.address}</Text>
            )}
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    backgroundColor: '#3498db',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  activeBadge: {
    backgroundColor: '#e74c3c',
    marginTop: 10,
  },
  panicCard: {
    margin: 20,
    backgroundColor: '#fff',
  },
  panicCardActive: {
    backgroundColor: '#ffebee',
    borderColor: '#e74c3c',
    borderWidth: 2,
  },
  panicContent: {
    alignItems: 'center',
    padding: 20,
  },
  panicButton: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#e74c3c',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  panicButtonActive: {
    backgroundColor: '#c0392b',
  },
  panicButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 5,
  },
  panicDescription: {
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
    paddingHorizontal: 20,
  },
  quickActionsCard: {
    margin: 20,
    marginTop: 0,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickAction: {
    alignItems: 'center',
    padding: 15,
  },
  quickActionText: {
    marginTop: 5,
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  contactsCard: {
    margin: 20,
    marginTop: 0,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  contactIcon: {
    marginRight: 15,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
  },
  contactPhone: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  locationCard: {
    margin: 20,
    marginTop: 0,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'monospace',
  },
  addressText: {
    fontSize: 14,
    color: '#2c3e50',
    marginTop: 10,
    fontWeight: '500',
  },
});

export default EmergencyScreen;