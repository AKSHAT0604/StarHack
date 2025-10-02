import React, { useState } from 'react';
import './Leaderboards.css';

interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar: string;
  score: number;
  change: 'up' | 'down' | 'same';
}

const Leaderboards: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'steps' | 'quests' | 'streaks'>('steps');
  
  const stepsLeaderboard: LeaderboardEntry[] = [
    { rank: 1, name: 'Sarah Johnson', avatar: 'SJ', score: 142368, change: 'same' },
    { rank: 2, name: 'Mike Wilson', avatar: 'MW', score: 136742, change: 'up' },
    { rank: 3, name: 'Emily Clark', avatar: 'EC', score: 128935, change: 'up' },
    { rank: 4, name: 'David Lee', avatar: 'DL', score: 125047, change: 'down' },
    { rank: 5, name: 'Lisa Brown', avatar: 'LB', score: 121389, change: 'up' },
    { rank: 6, name: 'John Doe', avatar: 'JD', score: 118752, change: 'down' },
    { rank: 7, name: 'Alex Wong', avatar: 'AW', score: 115843, change: 'same' },
    { rank: 8, name: 'Maria Garcia', avatar: 'MG', score: 112961, change: 'up' },
    { rank: 9, name: 'Robert Taylor', avatar: 'RT', score: 109872, change: 'down' },
    { rank: 10, name: 'Emma White', avatar: 'EW', score: 107234, change: 'up' },
  ];
  
  const questsLeaderboard: LeaderboardEntry[] = [
    { rank: 1, name: 'David Lee', avatar: 'DL', score: 87, change: 'up' },
    { rank: 2, name: 'Sarah Johnson', avatar: 'SJ', score: 82, change: 'down' },
    { rank: 3, name: 'John Doe', avatar: 'JD', score: 76, change: 'same' },
    { rank: 4, name: 'Emily Clark', avatar: 'EC', score: 75, change: 'up' },
    { rank: 5, name: 'Maria Garcia', avatar: 'MG', score: 71, change: 'up' },
    { rank: 6, name: 'Mike Wilson', avatar: 'MW', score: 68, change: 'down' },
    { rank: 7, name: 'Emma White', avatar: 'EW', score: 65, change: 'up' },
    { rank: 8, name: 'Alex Wong', avatar: 'AW', score: 64, change: 'same' },
    { rank: 9, name: 'Lisa Brown', avatar: 'LB', score: 59, change: 'down' },
    { rank: 10, name: 'Robert Taylor', avatar: 'RT', score: 57, change: 'down' },
  ];
  
  const streaksLeaderboard: LeaderboardEntry[] = [
    { rank: 1, name: 'Emily Clark', avatar: 'EC', score: 124, change: 'up' },
    { rank: 2, name: 'Mike Wilson', avatar: 'MW', score: 118, change: 'up' },
    { rank: 3, name: 'Alex Wong', avatar: 'AW', score: 106, change: 'same' },
    { rank: 4, name: 'Sarah Johnson', avatar: 'SJ', score: 97, change: 'down' },
    { rank: 5, name: 'Emma White', avatar: 'EW', score: 92, change: 'up' },
    { rank: 6, name: 'David Lee', avatar: 'DL', score: 85, change: 'down' },
    { rank: 7, name: 'John Doe', avatar: 'JD', score: 78, change: 'same' },
    { rank: 8, name: 'Maria Garcia', avatar: 'MG', score: 74, change: 'down' },
    { rank: 9, name: 'Lisa Brown', avatar: 'LB', score: 68, change: 'up' },
    { rank: 10, name: 'Robert Taylor', avatar: 'RT', score: 63, change: 'down' },
  ];
  
  const getCurrentLeaderboard = () => {
    switch(activeTab) {
      case 'steps':
        return stepsLeaderboard;
      case 'quests':
        return questsLeaderboard;
      case 'streaks':
        return streaksLeaderboard;
      default:
        return stepsLeaderboard;
    }
  };
  
  const getScoreLabel = () => {
    switch(activeTab) {
      case 'steps':
        return 'Steps';
      case 'quests':
        return 'Quests Completed';
      case 'streaks':
        return 'Days';
      default:
        return 'Score';
    }
  };
  
  const getChangeIcon = (change: 'up' | 'down' | 'same') => {
    switch(change) {
      case 'up':
        return <span className="change-icon up">↑</span>;
      case 'down':
        return <span className="change-icon down">↓</span>;
      case 'same':
        return <span className="change-icon same">−</span>;
      default:
        return null;
    }
  };

  return (
    <div className="leaderboards">
      <h1>Leaderboards</h1>
      
      <div className="leaderboard-tabs">
        <button 
          className={activeTab === 'steps' ? 'active' : ''} 
          onClick={() => setActiveTab('steps')}
        >
          Steps
        </button>
        <button 
          className={activeTab === 'quests' ? 'active' : ''} 
          onClick={() => setActiveTab('quests')}
        >
          Quests
        </button>
        <button 
          className={activeTab === 'streaks' ? 'active' : ''} 
          onClick={() => setActiveTab('streaks')}
        >
          Streaks
        </button>
      </div>
      
      <div className="leaderboard-container">
        <div className="leaderboard-header">
          <div className="rank-column">Rank</div>
          <div className="name-column">Name</div>
          <div className="score-column">{getScoreLabel()}</div>
          <div className="change-column">Change</div>
        </div>
        
        <div className="leaderboard-entries">
          {getCurrentLeaderboard().map(entry => (
            <div key={entry.name} className="leaderboard-entry">
              <div className="rank-column">
                {entry.rank <= 3 ? (
                  <div className={`rank-badge rank-${entry.rank}`}>
                    {entry.rank}
                  </div>
                ) : (
                  <span>{entry.rank}</span>
                )}
              </div>
              
              <div className="name-column">
                <div className="avatar">{entry.avatar}</div>
                <div className="name">{entry.name}</div>
              </div>
              
              <div className="score-column">{entry.score.toLocaleString()}</div>
              
              <div className="change-column">
                {getChangeIcon(entry.change)}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="your-rank">
        <h2>Your Rankings</h2>
        <div className="your-stats">
          <div className="your-stat-card">
            <h3>Steps</h3>
            <div className="stat-value">#24</div>
            <div className="stat-label">Your current rank</div>
            <div className="stat-progress">+12 from last week</div>
          </div>
          
          <div className="your-stat-card">
            <h3>Quests</h3>
            <div className="stat-value">#18</div>
            <div className="stat-label">Your current rank</div>
            <div className="stat-progress">+3 from last week</div>
          </div>
          
          <div className="your-stat-card">
            <h3>Streaks</h3>
            <div className="stat-value">#32</div>
            <div className="stat-label">Your current rank</div>
            <div className="stat-progress">-5 from last week</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboards;
