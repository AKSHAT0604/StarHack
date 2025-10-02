-- d:\sem 5\StarHack\backend\database.sql

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    points INTEGER DEFAULT 0,
    spent_points INTEGER DEFAULT 0,
    weekly_points INTEGER DEFAULT 0,
    week_start DATE DEFAULT date_trunc('week', CURRENT_DATE)::date,
    streak INTEGER DEFAULT 0,
    last_login DATE,
    last_daily_completion DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE quests (
    quest_id SERIAL PRIMARY KEY,
    quest_name VARCHAR(100) NOT NULL,
    quest_description TEXT,
    quest_type VARCHAR(50), -- 'daily', 'weekly', 'monthly'
    points_reward INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_quests (
    user_quest_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    quest_id INTEGER REFERENCES quests(quest_id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'incomplete', -- 'incomplete', 'completed'
    completed_at TIMESTAMP WITH TIME ZONE,
    reset_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE rewards (
    reward_id SERIAL PRIMARY KEY,
    reward_name VARCHAR(100) NOT NULL,
    reward_description TEXT,
    cost INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE user_rewards (
    user_reward_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    reward_id INTEGER REFERENCES rewards(reward_id) ON DELETE CASCADE,
    claimed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed initial data
-- Current user (user_id will be 1)
INSERT INTO users (username, email, points, spent_points, weekly_points, streak, last_login) VALUES 
('CurrentUser', 'current@example.com', 850, 0, 225, 5, CURRENT_DATE);

-- Other users with random values
INSERT INTO users (username, email, points, spent_points, weekly_points, streak, last_login) VALUES 
('JohnDoe', 'john@example.com', 1250, 300, 450, 10, CURRENT_DATE),
('JaneSmith', 'jane@example.com', 1150, 200, 380, 8, CURRENT_DATE),
('MikeBrown', 'mike@example.com', 950, 150, 320, 6, CURRENT_DATE),
('SarahJohnson', 'sarah@example.com', 900, 250, 290, 7, CURRENT_DATE),
('AlexWong', 'alex@example.com', 800, 100, 260, 4, CURRENT_DATE),
('EmilyClark', 'emily@example.com', 750, 180, 240, 9, CURRENT_DATE),
('DavidLee', 'david@example.com', 700, 120, 210, 5, CURRENT_DATE),
('LisaBrown', 'lisa@example.com', 650, 90, 180, 3, CURRENT_DATE),
('RobertTaylor', 'robert@example.com', 600, 140, 150, 6, CURRENT_DATE);

INSERT INTO quests (quest_name, quest_description, quest_type, points_reward) VALUES
('Take 10,000 steps', 'Walk at least 10,000 steps today', 'daily', 100),
('Drink 8 glasses of water', 'Stay hydrated throughout the day', 'daily', 50),
('Meditate for 10 minutes', 'Practice mindfulness meditation', 'daily', 75),
('Exercise 3 times this week', 'Complete 3 workout sessions', 'weekly', 200),
('Meal prep for the week', 'Prepare healthy meals', 'weekly', 150),
('Monthly health check-up', 'Complete your monthly health assessment', 'monthly', 300);

INSERT INTO rewards (reward_name, reward_description, cost) VALUES
('10% Gym Discount', 'Get 10% off your next gym membership payment.', 500),
('Free Nutritionist Session', 'A free one-hour session with a certified nutritionist.', 1000),
('Healthy Meal Delivery', 'One free healthy meal delivered to your door.', 250);
