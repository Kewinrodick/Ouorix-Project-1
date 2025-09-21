import React, { useState } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import EmergencyModal from './components/EmergencyModal';
import './App.css';

function App() {
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);

  const handleEmergency = () => {
    setIsEmergencyModalOpen(true);
  };

  const closeEmergencyModal = () => {
    setIsEmergencyModalOpen(false);
  };

  return (
    <div className="App">
      <Header onEmergency={handleEmergency} />
      <Dashboard />
      <EmergencyModal 
        isOpen={isEmergencyModalOpen} 
        onClose={closeEmergencyModal} 
      />
    </div>
  );
}

export default App;
