import React from 'react';
import './Leaderboards.css';
import { usePoints } from '../../contexts/PointsContext';

const Leaderboards: React.FC = () => {
  const { leaderboard } = usePoints();

  const getAvatar = (name: string) => {
    return name.substring(0, 2).toUpperCase();
  }

  return (
    <div className="leaderboards">
      <h1>Leaderboards</h1>
      
      <div className="leaderboard-container">
        <div className="leaderboard-header">
          <div className="rank-column">Rank</div>
          <div className="name-column">Name</div>
          <div className="score-column">Points</div>
        </div>
        
        <div className="leaderboard-entries">
          {leaderboard.map((entry, index) => {
            const rank = index + 1;
            return (
              <div key={entry.username} className="leaderboard-entry">
                <div className="rank-column">
                  {rank <= 3 ? (
                    <div className={`rank-badge rank-${rank}`}>
                      {rank}
                    </div>
                  ) : (
                    <span>{rank}</span>
                  )}
                </div>
                
                <div className="name-column">
                  <div className="avatar">{getAvatar(entry.username)}</div>
                  <div className="name">{entry.username}</div>
                </div>
                
                <div className="score-column">{entry.points.toLocaleString()}</div>
                
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Leaderboards;
