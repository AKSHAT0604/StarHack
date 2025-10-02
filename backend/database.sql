-- d:\sem 5\StarHack\backend\database.sql

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    points INTEGER DEFAULT 0,
    streak INTEGER DEFAULT 0,
    last_login DATE,
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
    UNIQUE(user_id, quest_id)
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
INSERT INTO users (username, email, points, streak) VALUES ('testuser', 'test@example.com', 100, 5);

INSERT INTO quests (quest_name, quest_description, quest_type, points_reward) VALUES
('Morning Walk', 'Walk for 15 minutes.', 'daily', 10),
('Workout Session', 'Complete a 30-minute workout.', 'daily', 20),
('Weekly Steps Challenge', 'Reach 50,000 steps this week.', 'weekly', 100),
('Monthly Marathon', 'Run a total of 42km this month.', 'monthly', 500);

INSERT INTO rewards (reward_name, reward_description, cost) VALUES
('10% Gym Discount', 'Get 10% off your next gym membership payment.', 500),
('Free Nutritionist Session', 'A free one-hour session with a certified nutritionist.', 1000),
('Healthy Meal Delivery', 'One free healthy meal delivered to your door.', 250);
