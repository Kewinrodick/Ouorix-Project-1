# Ouorix Smart Tourist Safety & Incident Response System

Revolutionary AI + Blockchain + Geo-fencing powered Smart Tourist Safety & Incident Response System

## 🚀 Overview

Ouorix is a comprehensive safety ecosystem designed to protect tourists through advanced technology integration including AI anomaly detection, blockchain-secured data, real-time geo-fencing, and automated incident response systems.

## 🏗️ System Architecture

### Core Components

1. **Mobile App for Tourists** 📱
   - Digital ID with blockchain verification
   - One-touch panic button
   - Real-time geo-fence alerts
   - Family opt-in tracking
   - IoT device integration (wearables/smart bands)

2. **Authority Dashboard** 🖥️
   - Real-time tourist location clusters
   - Interactive heatmaps
   - Incident management system
   - Automated e-FIR support
   - Performance analytics

3. **AI Anomaly Detection** 🤖
   - Route deviation detection
   - Inactivity monitoring
   - Distress pattern recognition
   - Behavioral analysis
   - Predictive risk assessment

4. **Blockchain Integration** 🔗
   - Secure digital identity
   - Tamper-proof incident records
   - Smart contracts for emergency protocols
   - Decentralized data storage

## 🛠️ Technology Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** for data storage
- **Socket.io** for real-time communication
- **TensorFlow.js** for AI/ML models
- **Web3.js** for blockchain integration

### Mobile App
- **React Native** for cross-platform mobile development
- **React Navigation** for app navigation
- **React Native Maps** for geolocation services
- **Socket.io-client** for real-time updates

### Dashboard
- **React.js** for web interface
- **Material-UI** for component library
- **Leaflet** for interactive maps
- **Chart.js** for data visualization

### Infrastructure
- **JWT** for authentication
- **bcrypt** for password security
- **MQTT** for IoT device communication
- **REST APIs** for service integration

## 📋 Features

### Tourist Safety Features
- ✅ Digital ID with blockchain verification
- ✅ One-touch panic button
- ✅ Real-time location tracking
- ✅ Geo-fence alerts and notifications
- ✅ Family tracking with opt-in consent
- ✅ IoT wearable device integration
- ✅ Emergency contact management
- ✅ Offline emergency protocols

### Authority Management
- ✅ Real-time tourist monitoring
- ✅ Incident response management
- ✅ Automated e-FIR generation
- ✅ Performance metrics and analytics
- ✅ Heat map visualization
- ✅ Multi-zone jurisdiction management
- ✅ Emergency resource allocation

### AI & Analytics
- ✅ Route deviation detection
- ✅ Inactivity pattern analysis
- ✅ Behavioral anomaly detection
- ✅ Predictive risk assessment
- ✅ Real-time threat evaluation
- ✅ Historical pattern analysis

### Blockchain Security
- ✅ Secure digital identity
- ✅ Immutable incident records
- ✅ Smart contract automation
- ✅ Decentralized verification
- ✅ Privacy-preserving data storage

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- React Native development environment
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Kewinrodick/Ouorix-Project-1.git
   cd Ouorix-Project-1
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Environment Setup**
   ```bash
   # Copy environment template
   cp server/.env.example server/.env
   
   # Configure your environment variables
   # Edit server/.env with your database and API keys
   ```

4. **Start the services**
   ```bash
   # Start the backend server
   cd server && npm run dev
   
   # Start the mobile app (in new terminal)
   cd mobile && npm start
   
   # Start the dashboard (in new terminal)
   cd dashboard && npm start
   ```

### Running the System

1. **Backend Server**: `http://localhost:5000`
2. **Authority Dashboard**: `http://localhost:3000`
3. **Mobile App**: Use React Native CLI or Expo

## 📖 API Documentation

### Authentication Endpoints
- `POST /api/auth/register/tourist` - Register tourist
- `POST /api/auth/register/authority` - Register authority
- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Verify token

### Tourist Endpoints
- `GET /api/tourists/profile` - Get tourist profile
- `POST /api/tourists/location` - Update location
- `POST /api/tourists/panic` - Activate panic button
- `POST /api/tourists/family-tracking` - Manage family tracking

### Incident Management
- `POST /api/incidents/report` - Report incident
- `GET /api/incidents` - Get incidents (authorities)
- `POST /api/incidents/:id/assign` - Assign incident
- `POST /api/incidents/:id/efir` - File e-FIR

### Analytics & Monitoring
- `GET /api/analytics/heatmap` - Get heatmap data
- `GET /api/analytics/dashboard` - Dashboard analytics
- `GET /api/analytics/anomalies` - AI anomaly detection

## 🔧 Configuration

### Environment Variables

```env
# Database
MONGODB_URI=mongodb://localhost:27017/ouorix-safety

# Authentication
JWT_SECRET=your_super_secure_secret

# Blockchain
BLOCKCHAIN_RPC_URL=http://localhost:8545
CONTRACT_ADDRESS=0x...

# External APIs
MAPS_API_KEY=your_google_maps_key
EMAIL_HOST=smtp.gmail.com
```

## 🏛️ System Architecture Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Mobile App    │    │   Dashboard     │    │   IoT Devices   │
│   (Tourists)    │    │  (Authorities)  │    │  (Wearables)    │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          │              ┌───────▼──────┐               │
          └──────────────▶│  API Gateway │◀──────────────┘
                         └───────┬──────┘
                                 │
                    ┌────────────▼────────────┐
                    │    Backend Services     │
                    │  ┌─────────────────┐   │
                    │  │  Auth Service   │   │
                    │  │  Location Svc   │   │
                    │  │  Incident Svc   │   │
                    │  │  AI Detection   │   │
                    │  │  Blockchain     │   │
                    │  └─────────────────┘   │
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │     Data Layer          │
                    │  ┌─────────────────┐   │
                    │  │    MongoDB      │   │
                    │  │   Blockchain    │   │
                    │  │  AI Models      │   │
                    │  └─────────────────┘   │
                    └─────────────────────────┘
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, email support@ouorix.com or join our Slack channel.

## 🌟 Acknowledgments

- Emergency services for protocol guidance
- Tourism boards for requirements analysis
- Open source community for amazing tools
- Beta testers for valuable feedback
