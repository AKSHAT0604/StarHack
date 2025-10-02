import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar/Navbar';
import Dashboard from './pages/Dashboard/Dashboard';
import Quests from './pages/Quests/Quests';
import Community from './pages/Community/Community';
import Leaderboards from './pages/Leaderboards/Leaderboards';
import { usePoints } from './contexts/PointsContext';
// import Rewards from './pages/Rewards/Rewards';

function App() {
  const { points, streak, showNotification, setShowNotification } = usePoints();

  return (
    <div className="App">
      {showNotification && (
        <div className="notification-overlay">
            <div className="notification-popup">
                <h2>Daily Quests Available!</h2>
                <p>You have daily quests to complete. Don't miss out!</p>
                <button onClick={() => setShowNotification(false)}>Got it!</button>
            </div>
        </div>
      )}
      <Navbar />
      <div className="points-display">
        <p>Points: {points}</p>
        <p>Streak: 🔥{streak}</p>
      </div>
      <main className="content">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/quests" element={<Quests />} />
          <Route path="/community" element={<Community />} />
          <Route path="/leaderboards" element={<Leaderboards />} />
          {/* <Route path="/rewards" element={<Rewards />} /> */}
        </Routes>
      </main>
    </div>
  );
}

export default App;
