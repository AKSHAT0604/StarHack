import React, { useState } from 'react';
import './Quests.css';
import { usePoints, Quest } from '../../contexts/PointsContext';

type QuestCategory = 'daily' | 'weekly' | 'monthly';

const Quests: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<QuestCategory | null>('daily');
  const { quests, completeQuest } = usePoints();

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
      <h1>Quests</h1>
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
