import React from 'react';
import './Dashboard.css';

interface SafetyMetric {
  id: string;
  title: string;
  value: string;
  status: 'safe' | 'warning' | 'danger';
  description: string;
}

const Dashboard: React.FC = () => {
  const safetyMetrics: SafetyMetric[] = [
    {
      id: '1',
      title: 'Location Safety Score',
      value: '85%',
      status: 'safe',
      description: 'Current area safety assessment'
    },
    {
      id: '2',
      title: 'Weather Alert',
      value: 'Clear',
      status: 'safe',
      description: 'Real-time weather conditions'
    },
    {
      id: '3',
      title: 'Crowd Density',
      value: 'Moderate',
      status: 'warning',
      description: 'Current crowd levels'
    },
    {
      id: '4',
      title: 'Emergency Services',
      value: '< 5 min',
      status: 'safe',
      description: 'Nearest emergency response time'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'danger': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-container">
        <section className="hero-section">
          <h2>Welcome to Your Safety Dashboard</h2>
          <p>AI-powered tourism safety monitoring with blockchain verification</p>
        </section>

        <section className="metrics-grid">
          {safetyMetrics.map((metric) => (
            <div key={metric.id} className="metric-card">
              <div className="metric-header">
                <h3>{metric.title}</h3>
                <div 
                  className="status-indicator"
                  style={{ backgroundColor: getStatusColor(metric.status) }}
                />
              </div>
              <div className="metric-value">{metric.value}</div>
              <p className="metric-description">{metric.description}</p>
            </div>
          ))}
        </section>

        <section className="features-section">
          <div className="feature-card">
            <div className="feature-icon">🤖</div>
            <h3>AI Safety Analysis</h3>
            <p>Real-time risk assessment using machine learning algorithms to predict and prevent safety incidents.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🔗</div>
            <h3>Blockchain Verification</h3>
            <p>Immutable safety records and verified location data stored on distributed ledger technology.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">📍</div>
            <h3>Location Tracking</h3>
            <p>GPS-based safety monitoring with geofenced alerts and emergency location sharing.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🆘</div>
            <h3>Emergency Response</h3>
            <p>Instant connection to local emergency services with automated incident reporting.</p>
          </div>
        </section>

        <section className="recent-alerts">
          <h3>Recent Safety Alerts</h3>
          <div className="alerts-list">
            <div className="alert-item safe">
              <span className="alert-time">2 min ago</span>
              <span className="alert-message">Safety check completed - All clear</span>
            </div>
            <div className="alert-item warning">
              <span className="alert-time">15 min ago</span>
              <span className="alert-message">Increased crowd density detected at Times Square</span>
            </div>
            <div className="alert-item safe">
              <span className="alert-time">1 hour ago</span>
              <span className="alert-message">Blockchain verification successful</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;