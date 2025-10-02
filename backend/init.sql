-- Initialize StarLife Database
-- This script creates the database schema for users, rewards, activity, and quests

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create rewards table
CREATE TABLE IF NOT EXISTS rewards (
    reward_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    reward_name VARCHAR(255) NOT NULL,
    reward_points INTEGER DEFAULT 0,
    reward_type VARCHAR(50), -- e.g., 'badge', 'points', 'achievement'
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create activity table
CREATE TABLE IF NOT EXISTS activity (
    activity_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    activity_type VARCHAR(100) NOT NULL, -- e.g., 'exercise', 'meditation', 'sleep'
    activity_duration INTEGER, -- in minutes
    activity_date DATE DEFAULT CURRENT_DATE,
    calories_burned INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create quests table
CREATE TABLE IF NOT EXISTS quests (
    quest_id SERIAL PRIMARY KEY,
    quest_name VARCHAR(255) NOT NULL,
    quest_description TEXT,
    quest_type VARCHAR(50), -- e.g., 'daily', 'weekly', 'challenge'
    points_reward INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_quests junction table (to track user quest progress)
CREATE TABLE IF NOT EXISTS user_quests (
    user_quest_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    quest_id INTEGER REFERENCES quests(quest_id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'in_progress', -- 'in_progress', 'completed', 'failed'
    progress INTEGER DEFAULT 0, -- percentage or count
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    UNIQUE(user_id, quest_id)
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_rewards_user_id ON rewards(user_id);
CREATE INDEX idx_activity_user_id ON activity(user_id);
CREATE INDEX idx_activity_date ON activity(activity_date);
CREATE INDEX idx_user_quests_user_id ON user_quests(user_id);
CREATE INDEX idx_user_quests_quest_id ON user_quests(quest_id);

-- Insert sample data for testing
INSERT INTO users (username, email) VALUES 
    ('john_doe', 'john@example.com'),
    ('jane_smith', 'jane@example.com'),
    ('alex_johnson', 'alex@example.com')
ON CONFLICT (email) DO NOTHING;

INSERT INTO quests (quest_name, quest_description, quest_type, points_reward) VALUES
    ('Daily Steps Challenge', 'Walk 10,000 steps today', 'daily', 100),
    ('Water Intake', 'Drink 8 glasses of water', 'daily', 50),
    ('Weekly Workout', 'Complete 5 workout sessions this week', 'weekly', 500),
    ('Meditation Master', 'Meditate for 10 minutes', 'daily', 75)
ON CONFLICT DO NOTHING;

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quests_updated_at BEFORE UPDATE ON quests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
