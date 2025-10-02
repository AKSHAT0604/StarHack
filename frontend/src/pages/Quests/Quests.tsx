import React, { useState } from 'react';
import './Quests.css';
import { usePoints } from '../../contexts/PointsContext';

type QuestCategory = 'daily' | 'weekly' | 'monthly';

const Quests: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<QuestCategory | null>(null);
  const { quests, completeQuest } = usePoints();

  const handleCategoryClick = (category: QuestCategory) => {
    setActiveCategory(activeCategory === category ? null : category);
  };

  const uncompletedQuests = (category: QuestCategory) => {
    return quests[category].filter(quest => !quest.completed);
  }

  return (
    <div className="quests">
      <h1>Quests</h1>
      <div className="quest-categories">
        <div className="quest-category-box daily" onClick={() => handleCategoryClick('daily')}>
          <h2>Daily Quests</h2>
        </div>
        {activeCategory === 'daily' && (
          <div className="quest-list">
            {uncompletedQuests('daily').map(quest => (
              <div className="quest-card" key={quest.id}>
                <h3>{quest.title}</h3>
                <p>{quest.description}</p>
                <p className="points">{quest.points} Points</p>
                <button onClick={() => completeQuest(quest.id, 'daily')}>
                  Complete
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="quest-category-box weekly" onClick={() => handleCategoryClick('weekly')}>
          <h2>Weekly Quests</h2>
        </div>
        {activeCategory === 'weekly' && (
          <div className="quest-list">
            {uncompletedQuests('weekly').map(quest => (
              <div className="quest-card" key={quest.id}>
                <h3>{quest.title}</h3>
                <p>{quest.description}</p>
                <p className="points">{quest.points} Points</p>
                <button onClick={() => completeQuest(quest.id, 'weekly')}>
                  Complete
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="quest-category-box monthly" onClick={() => handleCategoryClick('monthly')}>
          <h2>Monthly Quests</h2>
        </div>
        {activeCategory === 'monthly' && (
          <div className="quest-list">
            {uncompletedQuests('monthly').map(quest => (
              <div className="quest-card" key={quest.id}>
                <h3>{quest.title}</h3>
                <p>{quest.description}</p>
                <p className="points">{quest.points} Points</p>
                <button onClick={() => completeQuest(quest.id, 'monthly')}>
                  Complete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Quests;
