import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

// --- TypeScript Interfaces ---
export interface Quest {
  quest_id: number;
  quest_name: string;
  quest_description: string;
  quest_type: 'daily' | 'weekly' | 'monthly';
  points_reward: number;
  completed: boolean;
}

export interface Reward {
  reward_id: number;
  reward_name: string;
  reward_description: string;
  cost: number;
}

export interface User {
  user_id: number;
  username: string;
  points: number;
  spent_points: number;
  weekly_points: number;
  week_start?: string;
  streak: number;
  tier: string;
  streak_freeze_available: boolean;
  last_login?: string;
  last_daily_completion?: string;
}

interface PointsContextType {
  user: User | null;
  quests: Quest[];
  rewards: Reward[];
  leaderboard: User[];
  showCongratulations: boolean;
  setShowCongratulations: (show: boolean) => void;
  completeQuest: (questId: number) => Promise<void>;
  claimReward: (rewardId: number) => Promise<void>;
  resetQuests: () => Promise<void>;
  fetchData: () => Promise<void>;
}

const PointsContext = createContext<PointsContextType | undefined>(undefined);

const API_URL = 'http://localhost:8000';
const USER_ID = 1; // Current user ID

export const PointsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [leaderboard, setLeaderboard] = useState<User[]>([]);
  const [showCongratulations, setShowCongratulations] = useState<boolean>(false);

  const fetchData = async () => {
    try {
      const [userRes, questsRes, rewardsRes, leaderboardRes] = await Promise.all([
        fetch(`${API_URL}/user/${USER_ID}`),
        fetch(`${API_URL}/quests/${USER_ID}`),
        fetch(`${API_URL}/rewards`),
        fetch(`${API_URL}/leaderboard`),
      ]);

      if (!userRes.ok || !questsRes.ok || !rewardsRes.ok || !leaderboardRes.ok) {
        throw new Error('Failed to fetch data from the server.');
      }

      const userData: User = await userRes.json();
      const questsData: Quest[] = await questsRes.json();
      const rewardsData: Reward[] = await rewardsRes.json();
      const leaderboardData: User[] = await leaderboardRes.json();

      setUser(userData);
      setQuests(questsData);
      setRewards(rewardsData);
      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);




  const completeQuest = async (questId: number): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/quests/complete/${USER_ID}/${questId}`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to complete quest');
      }

      const result = await response.json();

      // Show congratulations if all daily quests are complete
      if (result.all_daily_complete && result.streak_incremented) {
        setShowCongratulations(true);
      }

      // Re-fetch all data to ensure UI is in sync
      await fetchData();
    } catch (error) {
      console.error('Error completing quest:', error);
      throw error;
    }
  };


  const claimReward = async (rewardId: number): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/rewards/claim/${USER_ID}/${rewardId}`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to claim reward');
      }

      // Re-fetch user data to show updated points and leaderboard
      await fetchData();
    } catch (error) {
      console.error('Error claiming reward:', error);
      throw error;
    }
  };

  const resetQuests = async (): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/quests/reset/${USER_ID}`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to reset quests');
      }

      // Re-fetch all data
      await fetchData();
    } catch (error) {
      console.error('Error resetting quests:', error);
      throw error;
    }
  };

  return (
    <PointsContext.Provider value={{
      user,
      quests,
      rewards,
      leaderboard,
      showCongratulations,
      setShowCongratulations,
      completeQuest,
      claimReward,
      resetQuests,
      fetchData
    }}>
      {children}
    </PointsContext.Provider>
  );
};

export const usePoints = () => {
  const context = useContext(PointsContext);
  if (context === undefined) {
    throw new Error('usePoints must be used within a PointsProvider');
  }
  return context;
};
