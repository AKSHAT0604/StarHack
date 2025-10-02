import React from 'react';
import './Community.css';

const Community: React.FC = () => {
  return (
    <div className="community">
      <h1>Community</h1>
      
      <div className="community-grid">
        <div className="community-section">
          <h2>Connect with Friends</h2>
          <div className="friends-list">
            <div className="friend-card">
              <div className="friend-avatar"></div>
              <div className="friend-info">
                <h4>Jane Smith</h4>
                <p>Achieved 12,000 steps today</p>
              </div>
              <button className="friend-action">Message</button>
            </div>
            
            <div className="friend-card">
              <div className="friend-avatar"></div>
              <div className="friend-info">
                <h4>John Doe</h4>
                <p>Completed 3 quests this week</p>
              </div>
              <button className="friend-action">Message</button>
            </div>
            
            <div className="friend-card">
              <div className="friend-avatar"></div>
              <div className="friend-info">
                <h4>Sarah Johnson</h4>
                <p>Just earned the "Early Bird" badge</p>
              </div>
              <button className="friend-action">Message</button>
            </div>
          </div>
        </div>
        
        <div className="community-section">
          <h2>Recent Activity</h2>
          <div className="activity-feed">
            <div className="activity-card">
              <p><strong>Mike Wilson</strong> completed the "30-Day Meditation Challenge"</p>
              <span className="activity-time">2 hours ago</span>
            </div>
            
            <div className="activity-card">
              <p><strong>Emily Clark</strong> reached a 10-day streak</p>
              <span className="activity-time">Yesterday</span>
            </div>
            
            <div className="activity-card">
              <p><strong>David Lee</strong> shared a workout: "Morning Run"</p>
              <span className="activity-time">2 days ago</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="community-groups">
        <h2>Groups</h2>
        <div className="groups-container">
          <div className="group-card">
            <h3>Morning Runners</h3>
            <p>234 members</p>
            <button className="group-join">Join</button>
          </div>
          
          <div className="group-card">
            <h3>Yoga Enthusiasts</h3>
            <p>156 members</p>
            <button className="group-join">Join</button>
          </div>
          
          <div className="group-card">
            <h3>Healthy Recipes</h3>
            <p>312 members</p>
            <button className="group-join">Join</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;
