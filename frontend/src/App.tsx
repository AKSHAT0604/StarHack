import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar/Navbar';
import Dashboard from './pages/Dashboard/Dashboard';
import Quests from './pages/Quests/Quests';
import Community from './pages/Community/Community';
import Leaderboards from './pages/Leaderboards/Leaderboards';
import Journey from './pages/Journey/Journey';
import { usePoints } from './contexts/PointsContext';
import Rewards from './pages/Rewards/Rewards';
import Login from './pages/Auth/Login';
import SignUp from './pages/Auth/SignUp';

function App() {
  const { user } = usePoints();

  return (
    <div className="App">
      <Navbar />
      <div className="points-display">
        <p>Points: {user?.points ?? 0}</p>
        <p>Streak: 🔥{user?.streak ?? 0}</p>
      </div>
      <main className="content">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/quests" element={<Quests />} />
          <Route path="/community" element={<Community />} />
          <Route path="/leaderboards" element={<Leaderboards />} />
          <Route path="/journey" element={<Journey />} />
          <Route path="/rewards" element={<Rewards />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
