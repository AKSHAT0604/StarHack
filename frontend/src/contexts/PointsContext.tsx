import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
// Temporarily comment out the import if it's causing issues
// import { useAuth } from './AuthContext';

// Simple mock auth hook directly in this file for now
const useAuth = () => ({
  currentUser: {
    user_id: 5,
    username: 'CurrentUser',
    email: 'user@example.com'
  },
  isAuthenticated: true,
  isLoading: false
});

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
  total_points: number;
  points: number; // Added for backward compatibility
  streak: number; // Added for backward compatibility
  rank: number; // Changed from optional to required
  previous_rank?: number;
  avatar?: string;
}

interface PointsContextType {
  points: number;
  quests: Quest[];
  users: User[];
  rewards: Reward[];
  user: User | null; // Added user property
  completeQuest: (questId: number) => void;
  resetQuests: (category: 'daily' | 'weekly' | 'monthly') => void;
  claimReward: (rewardId: number) => Promise<void>;
}

const PointsContext = createContext<PointsContextType | undefined>(undefined);

export const PointsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const auth = useAuth();
  
  // Since we may not have a backend ready yet, we'll use mock data
  const [points, setPoints] = useState<number>(850); // Set initial points
  
  // Mock data for current user
  const [user, setUser] = useState<User | null>({
    user_id: 5,
    username: 'CurrentUser',
    total_points: 850,
    points: 850, // Added for backward compatibility
    streak: 5, // Added for backward compatibility
    rank: 5,
    previous_rank: 7,
    avatar: 'CU'
  });
  
  // Mock data for quests
  const [quests, setQuests] = useState<Quest[]>([
    // Daily quests
    {
      quest_id: 1,
      quest_name: 'Take 10,000 steps',
      quest_description: 'Walk at least 10,000 steps today',
      quest_type: 'daily',
      points_reward: 100,
      completed: false
    },
    {
      quest_id: 2,
      quest_name: 'Drink water',
      quest_description: 'Drink at least 8 glasses of water today',
      quest_type: 'daily',
      points_reward: 50,
      completed: false
    },
    {
      quest_id: 3,
      quest_name: 'Meditate',
      quest_description: 'Spend 10 minutes meditating',
      quest_type: 'daily',
      points_reward: 75,
      completed: false
    },
    // Weekly quests
    {
      quest_id: 4,
      quest_name: 'Exercise 3 times',
      quest_description: 'Complete 3 workout sessions this week',
      quest_type: 'weekly',
      points_reward: 200,
      completed: false
    },
    {
      quest_id: 5,
      quest_name: 'Meal prep',
      quest_description: 'Prepare healthy meals for the week',
      quest_type: 'weekly',
      points_reward: 150,
      completed: false
    },
    // Monthly quests
    {
      quest_id: 6,
      quest_name: 'Health check-up',
      quest_description: 'Complete your monthly health assessment',
      quest_type: 'monthly',
      points_reward: 300,
      completed: false
    }
  ]);
  
  // Mock data for users in the leaderboard
  const [users, setUsers] = useState<User[]>([
    {
      user_id: 1,
      username: 'JohnDoe',
      total_points: 1250,
      points: 1250, // Added for backward compatibility
      streak: 10, // Added for backward compatibility
      rank: 1,
      previous_rank: 2,
      avatar: 'JD'
    },
    {
      user_id: 2,
      username: 'JaneSmith',
      total_points: 1150,
      points: 1150, // Added for backward compatibility
      streak: 8, // Added for backward compatibility
      rank: 2,
      previous_rank: 1,
      avatar: 'JS'
    },
    {
      user_id: 3,
      username: 'MikeBrown',
      total_points: 950,
      points: 950, // Added for backward compatibility
      streak: 6, // Added for backward compatibility
      rank: 3,
      previous_rank: 4,
      avatar: 'MB'
    },
    {
      user_id: 4,
      username: 'SarahJohnson',
      total_points: 900,
      points: 900, // Added for backward compatibility
      streak: 7, // Added for backward compatibility
      rank: 4,
      previous_rank: 3,
      avatar: 'SJ'
    },
    {
      user_id: 5,
      username: 'CurrentUser',
      total_points: 850,
      points: 850, // Added for backward compatibility
      streak: 5, // Added for backward compatibility
      rank: 5,
      previous_rank: 7,
      avatar: 'CU'
    }
  ]);

  // Mock data for rewards
  const [rewards, setRewards] = useState<Reward[]>([
    {
      reward_id: 1,
      reward_name: 'Gym Discount Voucher',
      reward_description: '10% off your next gym membership payment',
      cost: 500
    },
    {
      reward_id: 2,
      reward_name: 'Nutritionist Consultation',
      reward_description: 'Free 30-minute consultation with a professional nutritionist',
      cost: 1000
    },
    {
      reward_id: 3,
      reward_name: 'Fitness App Premium',
      reward_description: 'One month of premium access to fitness tracking app',
      cost: 750
    }
  ]);

  // Add the current user to the users list when authenticated
  useEffect(() => {
    if (auth.isAuthenticated && auth.currentUser) {
      // If real backend integration is ready, this would be updated
      // For now, we're just using the mock data
    }
  }, [auth.isAuthenticated, auth.currentUser]);

  const updateUserPoints = (newPoints: number) => {
    if (user) {
      setUser({
        ...user,
        total_points: newPoints,
        points: newPoints // Update both properties
      });
    }
    setPoints(newPoints);
  };

  const completeQuest = (questId: number) => {
    const quest = quests.find(q => q.quest_id === questId);
    if (quest && !quest.completed) {
      const newPoints = points + quest.points_reward;
      
      // Update points
      updateUserPoints(newPoints);
      
      // Update quest status
      setQuests(currentQuests => 
        currentQuests.map(q => 
          q.quest_id === questId ? { ...q, completed: true } : q
        )
      );
      
      // Update current user's points in the leaderboard
      setUsers(currentUsers => {
        const updatedUsers = currentUsers.map(u => {
          if (u.username === 'CurrentUser') {
            return {
              ...u,
              total_points: newPoints,
              points: newPoints // Update both properties
            };
          }
          return u;
        });
        
        // Re-rank users based on total points
        const rankedUsers = updatedUsers
          .sort((a, b) => b.total_points - a.total_points)
          .map((u, index) => ({
            ...u,
            previous_rank: u.rank,
            rank: index + 1
          }));
          
        // Update the current user with new rank  
        const updatedCurrentUser = rankedUsers.find(u => u.username === 'CurrentUser');
        if (updatedCurrentUser && user) {
          setUser({
            ...user,
            rank: updatedCurrentUser.rank,
            previous_rank: updatedCurrentUser.previous_rank,
            total_points: newPoints,
            points: newPoints // Update both properties
          });
        }
        
        return rankedUsers;
      });
    }
  };

  const resetQuests = (category: 'daily' | 'weekly' | 'monthly') => {
    setQuests(currentQuests =>
      currentQuests.map(q =>
        q.quest_type === category ? { ...q, completed: false } : q
      )
    );
  };

  const claimReward = async (rewardId: number): Promise<void> => {
    const reward = rewards.find(r => r.reward_id === rewardId);
    
    if (!reward) {
      throw new Error('Reward not found');
    }
    
    if (!user) {
      throw new Error('User not found');
    }
    
    if (user.points < reward.cost) {
      throw new Error('Not enough points to claim this reward');
    }
    
    const newPoints = user.points - reward.cost;
    
    // Deduct points from user
    updateUserPoints(newPoints);
    
    // Update user in the leaderboard
    setUsers(currentUsers => {
      const updatedUsers = currentUsers.map(u => {
        if (u.username === 'CurrentUser') {
          return {
            ...u,
            total_points: newPoints,
            points: newPoints // Update both properties
          };
        }
        return u;
      });
      
      // Re-rank users
      return updatedUsers
        .sort((a, b) => b.total_points - a.total_points)
        .map((u, index) => ({
          ...u,
          previous_rank: u.rank,
          rank: index + 1
        }));
    });
    
    // In a real app, you would make an API call to record this transaction
    return Promise.resolve();
  };

  return (
    <PointsContext.Provider value={{ 
      points, 
      quests, 
      users, 
      rewards,
      user,
      completeQuest, 
      resetQuests,
      claimReward 
    }}>
      {children}    </PointsContext.Provider>
  );
};

export const usePoints = () => {
  const context = useContext(PointsContext);
  if (context === undefined) {
    throw new Error('usePoints must be used within a PointsProvider');
  }
  return context;
};
