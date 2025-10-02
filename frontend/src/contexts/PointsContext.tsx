import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

// Define the structure of a single quest
export interface Quest {
    id: number;
    title: string;
    description: string;
    points: number;
    completed: boolean;
    category: 'daily' | 'weekly' | 'monthly';
}

// Define the structure of the quests object
export interface Quests {
    daily: Quest[];
    weekly: Quest[];
    monthly: Quest[];
}

interface PointsContextType {
    points: number;
    streak: number;
    quests: Quests;
    addPoints: (amount: number) => void;
    completeQuest: (id: number, category: 'daily' | 'weekly' | 'monthly') => void;
    showNotification: boolean;
    setShowNotification: (show: boolean) => void;
}

const PointsContext = createContext<PointsContextType | undefined>(undefined);

const initialQuests: Quests = {
    daily: [
        { id: 1, title: '10,000 Steps', description: 'Take 10,000 steps today', points: 50, completed: false, category: 'daily' },
        { id: 2, title: 'Drink Water', description: 'Drink 8 glasses of water', points: 20, completed: false, category: 'daily' },
    ],
    weekly: [
        { id: 3, title: 'Workout', description: 'Complete 3 workouts this week', points: 100, completed: false, category: 'weekly' },
        { id: 4, title: 'Healthy Meals', description: 'Eat 5 healthy meals', points: 75, completed: false, category: 'weekly' },
    ],
    monthly: [
        { id: 5, title: 'Read a Book', description: 'Finish reading a book this month', points: 200, completed: false, category: 'monthly' },
        { id: 6, title: 'Save Money', description: 'Save $100 this month', points: 150, completed: false, category: 'monthly' },
    ],
};

export const PointsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [points, setPoints] = useState(0);
    const [streak, setStreak] = useState(0);
    const [quests, setQuests] = useState<Quests>(initialQuests);
    const [showNotification, setShowNotification] = useState(false);

    useEffect(() => {
        const allDailyCompleted = quests.daily.every(q => q.completed);
        if (!allDailyCompleted) {
            setShowNotification(true);
        }
    }, []); // Runs once on mount

    const addPoints = (amount: number) => {
        setPoints(prevPoints => prevPoints + amount);
    };

    const completeQuest = (id: number, category: 'daily' | 'weekly' | 'monthly') => {
        let allDailyCompletedBefore = quests.daily.every(q => q.completed);

        setQuests(prevQuests => {
            const newQuests = { ...prevQuests };
            const questIndex = newQuests[category].findIndex(q => q.id === id);

            if (questIndex !== -1 && !newQuests[category][questIndex].completed) {
                addPoints(newQuests[category][questIndex].points);
                newQuests[category][questIndex].completed = true;

                // Check if all daily quests are now completed
                if (category === 'daily' && !allDailyCompletedBefore) {
                    const allDailyNowCompleted = newQuests.daily.every(q => q.completed);
                    if (allDailyNowCompleted) {
                        setStreak(prevStreak => prevStreak + 1);
                        setShowNotification(false); // Hide notification once all are done
                    }
                }
            }
            return newQuests;
        });
    };

    return (
        <PointsContext.Provider value={{ points, streak, quests, addPoints, completeQuest, showNotification, setShowNotification }}>
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
