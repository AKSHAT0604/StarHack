import React, { useState } from 'react';
import './Leaderboards.css';
import { usePoints, User } from '../../contexts/PointsContext';

const Leaderboards: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overall' | 'weekly' | 'monthly'>('overall');
  const { users } = usePoints(); // Use users from context
  
  // Mock data for weekly and monthly leaderboards
  // In a real application, you would fetch these from your API
  const weeklyLeaderboard = [...users].sort((a, b) => b.total_points - a.total_points).map((user, index) => ({
    ...user,
    rank: index + 1,
  }));
  
  const monthlyLeaderboard = [...users].sort((a, b) => b.total_points - a.total_points).map((user, index) => ({
    ...user,
    rank: index + 1,
  }));
  
  const getCurrentLeaderboard = () => {
    switch(activeTab) {
      case 'overall':
        return users;
      case 'weekly':
        return weeklyLeaderboard;
      case 'monthly':
        return monthlyLeaderboard;
      default:
        return users;
    }
  };
  
  const getScoreLabel = () => {
    return 'Total Points';
  };
  
  const getChangeIcon = (user: User) => {
    if (!user.previous_rank || user.rank === user.previous_rank) {
      return <span className="change-icon same">−</span>;
    } else if (user.rank < user.previous_rank) {
      return <span className="change-icon up">↑</span>;
    } else {
      return <span className="change-icon down">↓</span>;
    }
  };

  return (
    <div className="leaderboards">
      <h1>Leaderboards</h1>
      
      <div className="leaderboard-tabs">
        <button 
          className={activeTab === 'overall' ? 'active' : ''} 
          onClick={() => setActiveTab('overall')}
        >
          Overall
        </button>
        <button 
          className={activeTab === 'weekly' ? 'active' : ''} 
          onClick={() => setActiveTab('weekly')}
        >
          Weekly
        </button>
        <button 
          className={activeTab === 'monthly' ? 'active' : ''} 
          onClick={() => setActiveTab('monthly')}
        >
          Monthly
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
          {getCurrentLeaderboard().map(user => (
            <div key={user.user_id} className={`leaderboard-entry ${user.username === 'CurrentUser' ? 'current-user' : ''}`}>
              <div className="rank-column">
                {user.rank <= 3 ? (
                  <div className={`rank-badge rank-${user.rank}`}>
                    {user.rank}
                  </div>
                ) : (
                  <span>{user.rank}</span>
                )}
              </div>
              
              <div className="name-column">
                <div className="avatar">{user.avatar}</div>
                <div className="name">{user.username}</div>
              </div>
              
              <div className="score-column">{user.total_points.toLocaleString()}</div>
              
              <div className="change-column">
                {getChangeIcon(user)}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="your-rank">
        <h2>Your Rankings</h2>
        <div className="your-stats">
          <div className="your-stat-card">
            <h3>Overall</h3>
            <div className="stat-value">#{users.find(u => u.username === 'CurrentUser')?.rank || '-'}</div>
            <div className="stat-label">Your current rank</div>
            <div className="stat-progress">
              {(() => {
                const currentUser = users.find(u => u.username === 'CurrentUser');
                if (!currentUser || !currentUser.previous_rank) return 'N/A';
                const difference = currentUser.previous_rank - currentUser.rank;
                if (difference > 0) return `+${difference} from last week`;
                if (difference < 0) return `${difference} from last week`;
                return 'Same as last week';
              })()}
            </div>
          </div>
          
          <div className="your-stat-card">
            <h3>Weekly</h3>
            <div className="stat-value">#{weeklyLeaderboard.find(u => u.username === 'CurrentUser')?.rank || '-'}</div>
            <div className="stat-label">Your current rank</div>
            <div className="stat-progress">+3 from last week</div>
          </div>
          
          <div className="your-stat-card">
            <h3>Monthly</h3>
            <div className="stat-value">#{monthlyLeaderboard.find(u => u.username === 'CurrentUser')?.rank || '-'}</div>
            <div className="stat-label">Your current rank</div>
            <div className="stat-progress">-1 from last month</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboards;
