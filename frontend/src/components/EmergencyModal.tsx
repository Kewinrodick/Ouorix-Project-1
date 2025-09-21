import React, { useState } from 'react';
import './EmergencyModal.css';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EmergencyModal: React.FC<EmergencyModalProps> = ({ isOpen, onClose }) => {
  const [emergencyType, setEmergencyType] = useState('');
  const [isCallingSOS, setIsCallingSOS] = useState(false);

  const emergencyTypes = [
    { id: 'medical', label: 'Medical Emergency', icon: '🏥', color: '#ef4444' },
    { id: 'security', label: 'Security Threat', icon: '🚨', color: '#f59e0b' },
    { id: 'natural', label: 'Natural Disaster', icon: '🌪️', color: '#8b5cf6' },
    { id: 'accident', label: 'Accident', icon: '🚗', color: '#f97316' },
    { id: 'lost', label: 'Lost/Separated', icon: '🗺️', color: '#06b6d4' },
    { id: 'other', label: 'Other Emergency', icon: '⚠️', color: '#6b7280' }
  ];

  const handleSOSCall = () => {
    setIsCallingSOS(true);
    // Simulate emergency call
    setTimeout(() => {
      setIsCallingSOS(false);
      alert('Emergency services have been contacted. Help is on the way!');
      onClose();
    }, 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="emergency-modal-overlay">
      <div className="emergency-modal">
        <div className="emergency-header">
          <h2>🚨 Emergency Assistance</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="emergency-content">
          <div className="emergency-info">
            <p><strong>Current Location:</strong> Times Square, NYC</p>
            <p><strong>GPS Coordinates:</strong> 40.7580° N, 73.9855° W</p>
            <p><strong>Nearest Hospital:</strong> Mount Sinai West (0.8 miles)</p>
          </div>

          <div className="sos-section">
            <button 
              className={`sos-button ${isCallingSOS ? 'calling' : ''}`}
              onClick={handleSOSCall}
              disabled={isCallingSOS}
            >
              {isCallingSOS ? 'Calling Emergency Services...' : 'CALL 911 NOW'}
            </button>
          </div>

          <div className="emergency-types">
            <h3>Select Emergency Type:</h3>
            <div className="emergency-grid">
              {emergencyTypes.map((type) => (
                <button
                  key={type.id}
                  className={`emergency-type-btn ${emergencyType === type.id ? 'selected' : ''}`}
                  onClick={() => setEmergencyType(type.id)}
                  style={{ borderColor: type.color }}
                >
                  <span className="emergency-icon">{type.icon}</span>
                  <span className="emergency-label">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="emergency-actions">
            <button className="action-btn share-location">
              📍 Share Live Location
            </button>
            <button className="action-btn send-alert">
              📢 Alert Emergency Contacts
            </button>
            <button className="action-btn blockchain-record">
              🔗 Record on Blockchain
            </button>
          </div>

          <div className="emergency-tips">
            <h4>Emergency Tips:</h4>
            <ul>
              <li>Stay calm and assess your surroundings</li>
              <li>Move to a safe location if possible</li>
              <li>Keep your phone charged and location services on</li>
              <li>Follow local emergency procedures</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyModal;