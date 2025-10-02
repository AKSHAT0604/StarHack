import React, { useState } from 'react';
import './Quests.css';
import { usePoints } from '../../contexts/PointsContext';

type QuestCategory = 'daily' | 'weekly' | 'monthly';

const Quests: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<QuestCategory | null>(null);
  const { addPoints } = usePoints();

  const quests = {
    daily: [
      { id: 1, title: '10,000 Steps', description: 'Take 10,000 steps today', points: 50, completed: false },
      { id: 2, title: 'Drink Water', description: 'Drink 8 glasses of water', points: 20, completed: false },
    ],
    weekly: [
      { id: 3, title: 'Workout', description: 'Complete 3 workouts this week', points: 100, completed: false },
      { id: 4, title: 'Healthy Meals', description: 'Eat 5 healthy meals', points: 75, completed: false },
    ],
    monthly: [
      { id: 5, title: 'Read a Book', description: 'Finish reading a book this month', points: 200, completed: false },
      { id: 6, title: 'Save Money', description: 'Save $100 this month', points: 150, completed: false },
    ],
  };

  const handleCategoryClick = (category: QuestCategory) => {
    setActiveCategory(activeCategory === category ? null : category);
  };

  const completeQuest = (points: number) => {
    addPoints(points);
  };

  return (
    <div className="quests">
      <h1>Quests</h1>
      <div className="quest-categories">
        <div className="quest-category-box daily" onClick={() => handleCategoryClick('daily')}>
          <h2>Daily Quests</h2>
        </div>
        {activeCategory === 'daily' && (
          <div className="quest-list">
            {quests.daily.map(quest => (
              <div className="quest-card" key={quest.id}>
                <h3>{quest.title}</h3>
                <p>{quest.description}</p>
                <p className="points">{quest.points} Points</p>
                <button onClick={() => completeQuest(quest.points)} disabled={quest.completed}>
                  {quest.completed ? 'Completed' : 'Complete'}
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
            {quests.weekly.map(quest => (
              <div className="quest-card" key={quest.id}>
                <h3>{quest.title}</h3>
                <p>{quest.description}</p>
                <p className="points">{quest.points} Points</p>
                <button onClick={() => completeQuest(quest.points)} disabled={quest.completed}>
                  {quest.completed ? 'Completed' : 'Complete'}
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
            {quests.monthly.map(quest => (
              <div className="quest-card" key={quest.id}>
                <h3>{quest.title}</h3>
                <p>{quest.description}</p>
                <p className="points">{quest.points} Points</p>
                <button onClick={() => completeQuest(quest.points)} disabled={quest.completed}>
                  {quest.completed ? 'Completed' : 'Complete'}
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
