import React from 'react';
import './Rewards.css';
import { usePoints, Reward } from '../../contexts/PointsContext';

const Rewards: React.FC = () => {
  const { user, rewards, claimReward } = usePoints();

  return (
    <div className="rewards">
      <h1>Rewards</h1>
      <p>You have {user?.points} points to spend.</p>
      <div className="reward-list">
        {rewards.map((reward: Reward) => (
          <div className="reward-card" key={reward.reward_id}>
            <h3>{reward.reward_name}</h3>
            <p>{reward.reward_description}</p>
            <p className="points">Cost: {reward.cost} Points</p>
            <button 
              onClick={() => claimReward(reward.reward_id)}
              disabled={user ? user.points < reward.cost : true}
            >
              {user ? user.points < reward.cost ? 'Not enough points' : 'Claim' : 'Loading...'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Rewards;
