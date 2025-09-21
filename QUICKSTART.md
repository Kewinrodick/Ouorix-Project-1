# Quick Start Guide - Ouorix Smart Tourist Safety System

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager
- Git

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Kewinrodick/Ouorix-Project-1.git
   cd Ouorix-Project-1
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd server && npm install
   cd ../mobile && npm install  
   cd ../dashboard && npm install
   ```

3. **Start the Backend Server**
   ```bash
   cd server
   node index.js
   ```
   The server will start on `http://localhost:5000`

### 🧪 Demo Mode

The system runs in demo mode without requiring MongoDB or external services. Test the following endpoints:

#### Health Check
```bash
curl http://localhost:5000/health
```

#### System Information
```bash
curl http://localhost:5000/api/demo/system-info
```

#### Panic Alert Demo
```bash
curl -X POST http://localhost:5000/api/demo/panic-alert
```

#### Tourist Status
```bash
curl http://localhost:5000/api/demo/tourist-status
```

#### Analytics Dashboard
```bash
curl http://localhost:5000/api/demo/analytics
```

### 📱 Mobile App Features

- **Digital ID**: Blockchain-secured tourist identification
- **Panic Button**: One-touch emergency alert system
- **Location Tracking**: Real-time GPS with geo-fence alerts
- **Family Sharing**: Opt-in location sharing with family
- **IoT Integration**: Wearable device health monitoring

### 🖥️ Authority Dashboard Features

- **Real-time Monitoring**: Live tourist clusters and heatmaps
- **Incident Management**: Complete incident lifecycle
- **e-FIR System**: Automated police report filing
- **Analytics**: Performance metrics and reporting

### 🤖 AI Capabilities

- **Route Deviation**: Detects when tourists stray from planned routes
- **Inactivity Monitoring**: Identifies unusual periods of inactivity
- **Behavioral Analysis**: ML-based distress pattern recognition
- **IoT Health Monitoring**: Vitals and device connectivity analysis

### 🔗 Blockchain Integration

- **Secure Identity**: Tamper-proof digital identity verification
- **Immutable Records**: Permanent incident documentation
- **Smart Contracts**: Automated emergency response protocols
- **Privacy Protection**: Decentralized data storage

### 🌐 Production Deployment

For production deployment:

1. Set up MongoDB database
2. Configure environment variables in `server/.env`
3. Set up blockchain network (Ethereum, Polygon, etc.)
4. Configure external APIs (Maps, SMS, Email)
5. Deploy to cloud infrastructure (AWS, GCP, Azure)

### 📞 Support

- Demo Endpoints: Available immediately
- Full Database: Requires MongoDB setup
- Production Ready: Configure environment variables
- Documentation: See README.md for complete details