import React from 'react';
import './Header.css';

interface HeaderProps {
  onEmergency: () => void;
}

const Header: React.FC<HeaderProps> = ({ onEmergency }) => {
  return (
    <header className="header">
      <div className="header-container">
        <div className="logo-section">
          <h1 className="logo">Ouorix</h1>
          <span className="tagline">Tourism Safety Ecosystem</span>
        </div>
        <nav className="navigation">
          <a href="#dashboard" className="nav-link">Dashboard</a>
          <a href="#safety" className="nav-link">Safety</a>
          <a href="#blockchain" className="nav-link">Blockchain</a>
          <a href="#ai" className="nav-link">AI Insights</a>
        </nav>
        <button className="emergency-btn" onClick={onEmergency}>
          🚨 EMERGENCY
        </button>
      </div>
    </header>
  );
};

export default Header;