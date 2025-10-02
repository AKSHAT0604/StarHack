import React from 'react';
import './Leaderboards.css';
import { usePoints } from '../../contexts/PointsContext';

const Leaderboards: React.FC = () => {
  const { leaderboard, user } = usePoints();

  const getAvatar = (username: string) => {
    return username.substring(0, 2).toUpperCase();
  };

  const currentUserRank = leaderboard.findIndex(u => u.username === 'CurrentUser') + 1;

  return (
    <div className="leaderboards">
      <h1>Weekly Leaderboards</h1>
      <p className="leaderboard-subtitle">🏆 Rankings based on points earned this week</p>
      <p className="leaderboard-info">Top 5 players receive bonus points at week end!</p>
      <div className="bonus-info">
        <span className="bonus-item">🥇 1st: +500</span>
        <span className="bonus-item">🥈 2nd: +300</span>
        <span className="bonus-item">🥉 3rd: +200</span>
        <span className="bonus-item">4️⃣ 4th: +100</span>
        <span className="bonus-item">5️⃣ 5th: +50</span>
      </div>

      <div className="leaderboard-container">
        <div className="leaderboard-header">
          <div className="rank-column">Rank</div>
          <div className="name-column">Name</div>
          <div className="score-column">Weekly Points</div>
          <div className="streak-column">Streak</div>
        </div>

        <div className="leaderboard-entries">
          {leaderboard.map((entry, index) => {
            const rank = index + 1;
            const isCurrentUser = entry.username === 'CurrentUser';
            const isTopFive = rank <= 5;
            return (
              <div key={entry.user_id} className={`leaderboard-entry ${isCurrentUser ? 'current-user' : ''} ${isTopFive ? 'top-five' : ''}`}>
                <div className="rank-column">
                  {rank <= 3 ? (
                    <div className={`rank-badge rank-${rank}`}>
                      {rank}
                    </div>
                  ) : rank <= 5 ? (
                    <div className="rank-badge rank-top5">
                      {rank}
                    </div>
                  ) : (
                    <span>{rank}</span>
                  )}
                </div>

                <div className="name-column">
                  <div className="avatar">{getAvatar(entry.username)}</div>
                  <div className="name">
                    {entry.username}{isCurrentUser && ' (You)'}
                    {isTopFive && <span className="bonus-badge">🎁</span>}
                  </div>
                </div>

                <div className="score-column">{entry.weekly_points.toLocaleString()}</div>

                <div className="streak-column">🔥 {entry.streak}</div>
              </div>
            );
          })}
        </div>
      </div>

      {user && (
        <div className="your-rank">
          <h2>Your Stats</h2>
          <div className="your-stats">
            <div className="your-stat-card">
              <h3>Weekly Rank</h3>
              <div className="stat-value">#{currentUserRank || '-'}</div>
              <div className="stat-label">Your current rank</div>
              {currentUserRank <= 5 && currentUserRank > 0 && (
                <div className="bonus-indicator">
                  🎁 Bonus at week end!
                </div>
              )}
            </div>

            <div className="your-stat-card">
              <h3>Weekly Points</h3>
              <div className="stat-value">{user.weekly_points.toLocaleString()}</div>
              <div className="stat-label">Earned this week</div>
            </div>

            <div className="your-stat-card">
              <h3>Total Balance</h3>
              <div className="stat-value">{user.points.toLocaleString()}</div>
              <div className="stat-label">Available points</div>
            </div>

            <div className="your-stat-card">
              <h3>Streak</h3>
              <div className="stat-value">🔥 {user.streak}</div>
              <div className="stat-label">Day streak</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboards;
