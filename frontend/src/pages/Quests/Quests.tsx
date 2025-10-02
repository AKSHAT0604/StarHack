import React, { useState, useEffect } from 'react';
import './Quests.css';
import { usePoints, Quest } from '../../contexts/PointsContext';

type QuestCategory = 'daily' | 'weekly' | 'monthly';

interface CommunityQuest {
  community_quest_id: number;
  community_id: number;
  community_name: string;
  community_color: string;
  community_icon: string;
  quest_name: string;
  quest_description: string;
  points_reward: number;
  event_date: string;
  event_end_date: string;
  completed: boolean;
  time_until_event: string;
}

const API_URL = 'http://localhost:8000';
const USER_ID = 1;

const Quests: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<QuestCategory | null>('daily');
  const { quests, completeQuest, resetQuests, showCongratulations, setShowCongratulations } = usePoints();
  const [isResetting, setIsResetting] = useState(false);
  const [communityQuests, setCommunityQuests] = useState<CommunityQuest[]>([]);
  const [loadingCommunityQuests, setLoadingCommunityQuests] = useState(true);

  useEffect(() => {
    fetchCommunityQuests();
  }, []);

  const fetchCommunityQuests = async () => {
    try {
      const response = await fetch(`${API_URL}/community-quests/${USER_ID}`);
      const data = await response.json();
      setCommunityQuests(data);
      setLoadingCommunityQuests(false);
    } catch (error) {
      console.error('Error fetching community quests:', error);
      setLoadingCommunityQuests(false);
    }
  };

  const handleCompleteCommunityQuest = async (questId: number) => {
    try {
      const response = await fetch(`${API_URL}/community-quests/complete/${USER_ID}/${questId}`, {
        method: 'POST',
      });

      if (response.ok) {
        const result = await response.json();
        alert(`✅ ${result.message}! +${result.points_added} points`);
        fetchCommunityQuests();
      } else {
        const error = await response.json();
        alert(`❌ ${error.detail}`);
      }
    } catch (error) {
      console.error('Error completing community quest:', error);
      alert('❌ Failed to complete quest');
    }
  };

  const handleResetQuests = async () => {
    if (window.confirm('⚠️ TESTING ONLY: Reset all quests? This will delete all quest completion records.')) {
      setIsResetting(true);
      try {
        await resetQuests();
        alert('✅ All quests have been reset!');
      } catch (error) {
        alert('❌ Failed to reset quests');
      } finally {
        setIsResetting(false);
      }
    }
  };

  const handleCategoryClick = (category: QuestCategory) => {
    setActiveCategory(activeCategory === category ? null : category);
  };

  const getQuestsByCategory = (category: QuestCategory) => {
    return quests.filter(quest => quest.quest_type === category && !quest.completed);
  };

  const renderQuestList = (category: QuestCategory) => {
    const filteredQuests = getQuestsByCategory(category);
    return (
      <div className="quest-list">
        {filteredQuests.length > 0 ? (
          filteredQuests.map((quest: Quest) => (
            <div className="quest-card" key={quest.quest_id}>
              <h3>{quest.quest_name}</h3>
              <p>{quest.quest_description}</p>
              <p className="points">{quest.points_reward} Points</p>
              <button onClick={() => completeQuest(quest.quest_id)}>
                Complete
              </button>
            </div>
          ))
        ) : (
          <p>All {category} quests completed!</p>
        )}
      </div>
    );
  };

  return (
    <div className="quests">
      {showCongratulations && (
        <div className="congratulations-overlay">
          <div className="congratulations-popup">
            <h2>🎉 Congratulations! 🎉</h2>
            <p>You've completed all daily quests!</p>
            <p>Your streak has been increased by 1! 🔥</p>
            <button onClick={() => setShowCongratulations(false)}>Awesome!</button>
          </div>
        </div>
      )}
      <div className="quests-header">
        <h1>Quests</h1>
        <button 
          className="reset-button-testing" 
          onClick={handleResetQuests}
          disabled={isResetting}
        >
          {isResetting ? '🔄 Resetting...' : '🔧 Reset Quests (Testing)'}
        </button>
      </div>

      {/* Community Quests Section */}
      {communityQuests.length > 0 && (
        <div className="community-quests-section">
          <div className="community-quests-header">
            <h2>⭐ Community Events ⭐</h2>
            <p>Special events from your joined communities with EXTRA POINTS!</p>
          </div>
          <div className="community-quests-grid">
            {communityQuests.map((quest) => (
              <div 
                key={quest.community_quest_id}
                className={`community-quest-card ${quest.completed ? 'completed' : ''}`}
                style={{ 
                  borderColor: quest.community_color,
                  background: `linear-gradient(135deg, ${quest.community_color}15, ${quest.community_color}05)`
                }}
              >
                <div className="community-quest-badge" style={{ backgroundColor: quest.community_color }}>
                  <span className="community-icon">{quest.community_icon}</span>
                  <span className="community-name">{quest.community_name}</span>
                </div>
                
                <h3>{quest.quest_name}</h3>
                <p className="quest-description">{quest.quest_description}</p>
                
                <div className="event-time-badge" style={{ 
                  backgroundColor: quest.time_until_event === 'LIVE NOW' ? '#10b981' : quest.community_color 
                }}>
                  {quest.time_until_event === 'LIVE NOW' ? '🔴 LIVE NOW' : `⏰ ${quest.time_until_event}`}
                </div>
                
                <div className="community-quest-footer">
                  <span className="points-badge" style={{ backgroundColor: quest.community_color }}>
                    ⚡ {quest.points_reward} Points
                  </span>
                  {!quest.completed ? (
                    <button 
                      className="complete-btn"
                      style={{ backgroundColor: quest.community_color }}
                      onClick={() => handleCompleteCommunityQuest(quest.community_quest_id)}
                    >
                      Complete Event
                    </button>
                  ) : (
                    <span className="completed-badge">✅ Completed</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Regular Quests Section */}
      <div className="quest-categories">
        <div className="quest-category-box daily" onClick={() => handleCategoryClick('daily')}>
          <h2>Daily Quests</h2>
        </div>
        {activeCategory === 'daily' && renderQuestList('daily')}

        <div className="quest-category-box weekly" onClick={() => handleCategoryClick('weekly')}>
          <h2>Weekly Quests</h2>
        </div>
        {activeCategory === 'weekly' && renderQuestList('weekly')}

        <div className="quest-category-box monthly" onClick={() => handleCategoryClick('monthly')}>
          <h2>Monthly Quests</h2>
        </div>
        {activeCategory === 'monthly' && renderQuestList('monthly')}
      </div>
    </div>
  );
};

export default Quests;
