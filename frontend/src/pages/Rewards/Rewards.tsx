import React, { useState } from 'react';
import './Rewards.css';
import { usePoints, Reward } from '../../contexts/PointsContext';

const Rewards: React.FC = () => {
    const { user, rewards, claimReward } = usePoints();
    const [claiming, setClaiming] = useState<number | null>(null);

    const handleClaimReward = async (rewardId: number) => {
        setClaiming(rewardId);
        try {
            await claimReward(rewardId);
            alert('Reward claimed successfully!');
        } catch (error) {
            alert('Failed to claim reward. Please try again.');
        } finally {
            setClaiming(null);
        }
    };

    return (
        <div className="rewards">
            <h1>Rewards</h1>
            <p className="rewards-subtitle">
                You have <strong>{user?.points || 0}</strong> points to spend.
            </p>
            <div className="reward-list">
                {rewards.map((reward: Reward) => (
                    <div className="reward-card" key={reward.reward_id}>
                        <h3>{reward.reward_name}</h3>
                        <p>{reward.reward_description}</p>
                        <p className="points">💰 {reward.cost} Points</p>
                        <button
                            onClick={() => handleClaimReward(reward.reward_id)}
                            disabled={!user || user.points < reward.cost || claiming === reward.reward_id}
                        >
                            {claiming === reward.reward_id
                                ? 'Claiming...'
                                : user && user.points < reward.cost
                                    ? 'Not enough points'
                                    : 'Claim Reward'}
                        </button>
                    </div>
                ))}
                {rewards.length === 0 && (
                    <p className="no-rewards">No rewards available at the moment.</p>
                )}
            </div>
        </div>
    );
};

export default Rewards;
