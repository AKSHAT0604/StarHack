import React from 'react';
import './Quests.css';

const Quests: React.FC = () => {
  return (
    <div className="quests">
      <h1>Quests</h1>
      <div className="quests-container">
        <div className="quest-card">
          <h3>Daily Challenge</h3>
          <p>Take 10,000 steps today</p>
          <div className="progress-bar">
            <div className="progress" style={{ width: '75%' }}></div>
          </div>
          <p className="progress-text">7,500 / 10,000 steps</p>
          <button className="quest-button">Complete</button>
        </div>

        <div className="quest-card">
          <h3>Weekly Challenge</h3>
          <p>Drink 56 glasses of water this week</p>
          <div className="progress-bar">
            <div className="progress" style={{ width: '40%' }}></div>
          </div>
          <p className="progress-text">22 / 56 glasses</p>
          <button className="quest-button">Track</button>
        </div>

        <div className="quest-card">
          <h3>Monthly Challenge</h3>
          <p>Exercise for 900 minutes this month</p>
          <div className="progress-bar">
            <div className="progress" style={{ width: '30%' }}></div>
          </div>
          <p className="progress-text">270 / 900 minutes</p>
          <button className="quest-button">Track</button>
        </div>
      </div>
    </div>
  );
};

export default Quests;
