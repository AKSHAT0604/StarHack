import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar/Navbar';
import Dashboard from './pages/Dashboard/Dashboard';
import Quests from './pages/Quests/Quests';
import Community from './pages/Community/Community';
import Leaderboards from './pages/Leaderboards/Leaderboards';
// import Rewards from './pages/Rewards/Rewards';

function App() {
  return (
    <div className="App">
      <Navbar />
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
