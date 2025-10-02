import React, { useState, useEffect } from 'react';
import './Community.css';

interface Community {
  community_id: number;
  community_name: string;
  community_description: string;
  community_color: string;
  community_icon: string;
  member_count: number;
  is_joined: boolean;
}

const API_URL = 'http://localhost:8000';
const USER_ID = 1;

const Community: React.FC = () => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCommunities = async () => {
    try {
      const response = await fetch(`${API_URL}/communities/${USER_ID}`);
      const data = await response.json();
      setCommunities(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching communities:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, []);

  const handleJoinLeave = async (communityId: number, isJoined: boolean) => {
    try {
      const endpoint = isJoined ? 'leave' : 'join';
      const response = await fetch(`${API_URL}/communities/${endpoint}/${USER_ID}/${communityId}`, {
        method: 'POST',
      });

      if (response.ok) {
        // Refresh communities list
        fetchCommunities();
      }
    } catch (error) {
      console.error('Error joining/leaving community:', error);
    }
  };

  if (loading) {
    return <div className="community"><h1>Loading Communities...</h1></div>;
  }

  const joinedCommunities = communities.filter(c => c.is_joined);
  const availableCommunities = communities.filter(c => !c.is_joined);

  return (
    <div className="community">
      <h1>🌟 Communities</h1>
      <p className="community-subtitle">Join communities to unlock special events and challenges!</p>
      
      {joinedCommunities.length > 0 && (
        <div className="communities-section">
          <h2>Your Communities</h2>
          <div className="communities-grid">
            {joinedCommunities.map((community) => (
              <div 
                key={community.community_id} 
                className="community-card joined"
                style={{ borderColor: community.community_color }}
              >
                <div className="community-header" style={{ background: `linear-gradient(135deg, ${community.community_color}22, ${community.community_color}44)` }}>
                  <span className="community-icon">{community.community_icon}</span>
                  <h3>{community.community_name}</h3>
                </div>
                <p className="community-description">{community.community_description}</p>
                <div className="community-footer">
                  <span className="member-count">👥 {community.member_count.toLocaleString()} members</span>
                  <button 
                    className="btn-leave"
                    onClick={() => handleJoinLeave(community.community_id, true)}
                  >
                    Leave
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {availableCommunities.length > 0 && (
        <div className="communities-section">
          <h2>Discover Communities</h2>
          <div className="communities-grid">
            {availableCommunities.map((community) => (
              <div 
                key={community.community_id} 
                className="community-card"
                style={{ borderColor: community.community_color }}
              >
                <div className="community-header" style={{ background: `linear-gradient(135deg, ${community.community_color}22, ${community.community_color}44)` }}>
                  <span className="community-icon">{community.community_icon}</span>
                  <h3>{community.community_name}</h3>
                </div>
                <p className="community-description">{community.community_description}</p>
                <div className="community-footer">
                  <span className="member-count">👥 {community.member_count.toLocaleString()} members</span>
                  <button 
                    className="btn-join"
                    style={{ backgroundColor: community.community_color }}
                    onClick={() => handleJoinLeave(community.community_id, false)}
                  >
                    Join Community
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Community;
