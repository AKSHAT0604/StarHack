import React, { useState } from 'react';
import './Quests.css';
import { usePoints, Quest } from '../../contexts/PointsContext';

type QuestCategory = 'daily' | 'weekly' | 'monthly';

const Quests: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<QuestCategory | null>('daily');
  const { quests, completeQuest, resetQuests, showCongratulations, setShowCongratulations } = usePoints();
  const [isResetting, setIsResetting] = useState(false);

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
