import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

const API_URL = 'http://localhost:8000';
const USER_ID = 1; // Hardcoded for now

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
    streak: number;
}

export interface LeaderboardUser {
    user_id: number;
    username: string;
    points: number;
    streak: number;
}

interface PointsContextType {
    user: User | null;
    quests: Quest[];
    rewards: Reward[];
    leaderboard: LeaderboardUser[];
    completeQuest: (questId: number) => Promise<void>;
    claimReward: (rewardId: number) => Promise<void>;
    fetchData: () => void;
}

const PointsContext = createContext<PointsContextType | undefined>(undefined);

export const PointsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [quests, setQuests] = useState<Quest[]>([]);
    const [rewards, setRewards] = useState<Reward[]>([]);
    const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);

    const fetchData = async () => {
        try {
            // Fetch user data, quests, rewards, and leaderboard in parallel
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
            const leaderboardData: LeaderboardUser[] = await leaderboardRes.json();

            setUser(userData);
            setQuests(questsData);
            setRewards(rewardsData);
            setLeaderboard(leaderboardData);

        } catch (error) {
            console.error("Error fetching data:", error);
            // Optionally, set some error state to show in the UI
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const completeQuest = async (questId: number) => {
        try {
            const response = await fetch(`${API_URL}/quests/complete/${USER_ID}/${questId}`, {
                method: 'POST',
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to complete quest');
            }
            // Re-fetch all data to ensure UI is in sync with the database
            await fetchData();
        } catch (error) {
            console.error("Error completing quest:", error);
        }
    };

    const claimReward = async (rewardId: number) => {
        try {
            const response = await fetch(`${API_URL}/rewards/claim/${USER_ID}/${rewardId}`, {
                method: 'POST',
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to claim reward');
            }
            // Re-fetch user data to show updated points
            await fetchData();
        } catch (error) {
            console.error("Error claiming reward:", error);
            throw error; // Re-throw to handle it in the component
        }
    };

    return (
        <PointsContext.Provider value={{ user, quests, rewards, leaderboard, completeQuest, claimReward, fetchData }}>
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
