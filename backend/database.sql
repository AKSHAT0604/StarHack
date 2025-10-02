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

-- Communities table
CREATE TABLE communities (
    community_id SERIAL PRIMARY KEY,
    community_name VARCHAR(100) NOT NULL UNIQUE,
    community_description TEXT,
    community_color VARCHAR(20) DEFAULT '#6366f1', -- Vibrant color hex code
    community_icon VARCHAR(50) DEFAULT '🏃', -- Emoji icon
    member_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User-Community relationship (many-to-many)
CREATE TABLE user_communities (
    user_community_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    community_id INTEGER REFERENCES communities(community_id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, community_id)
);

-- Community quests/events table
CREATE TABLE community_quests (
    community_quest_id SERIAL PRIMARY KEY,
    community_id INTEGER REFERENCES communities(community_id) ON DELETE CASCADE,
    quest_name VARCHAR(100) NOT NULL,
    quest_description TEXT,
    points_reward INTEGER NOT NULL,
    event_date TIMESTAMP WITH TIME ZONE, -- When the event is happening
    event_end_date TIMESTAMP WITH TIME ZONE, -- When the event ends
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User completion of community quests
CREATE TABLE user_community_quests (
    user_community_quest_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    community_quest_id INTEGER REFERENCES community_quests(community_quest_id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'incomplete', -- 'incomplete', 'completed'
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, community_quest_id)
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

-- Insert communities with vibrant colors
INSERT INTO communities (community_name, community_description, community_color, community_icon, member_count) VALUES
('Running Club', 'Join fellow runners for marathons, sprints, and training sessions', '#ef4444', '🏃', 1250),
('Yoga & Mindfulness', 'Practice yoga, meditation, and mindfulness together', '#8b5cf6', '🧘', 980),
('Fitness Warriors', 'High-intensity workouts and strength training community', '#f59e0b', '💪', 1500),
('Cycling Enthusiasts', 'Bike rides, cycling events, and outdoor adventures', '#10b981', '🚴', 750),
('Swimming Squad', 'Pool workouts, open water swimming, and aquatic fitness', '#06b6d4', '🏊', 600),
('Nutrition & Wellness', 'Healthy eating, meal prep, and nutrition guidance', '#ec4899', '🥗', 890);

-- Insert community quests/events with future dates
-- Running Club events
INSERT INTO community_quests (community_id, quest_name, quest_description, points_reward, event_date, event_end_date) VALUES
(1, 'City Marathon 2025', 'Join us for the annual city marathon! 42km of pure determination.', 500, '2025-10-15 06:00:00', '2025-10-15 14:00:00'),
(1, '5K Fun Run', 'Casual 5K run around the park. Perfect for all fitness levels!', 200, '2025-10-08 07:00:00', '2025-10-08 09:00:00'),
(1, 'Night Run Challenge', 'Experience the city lights on this 10K night run adventure.', 300, '2025-10-20 19:00:00', '2025-10-20 22:00:00');

-- Yoga & Mindfulness events
INSERT INTO community_quests (community_id, quest_name, quest_description, points_reward, event_date, event_end_date) VALUES
(2, 'Sunrise Yoga Session', 'Start your day with peaceful sunrise yoga in the park.', 150, '2025-10-05 06:00:00', '2025-10-05 07:30:00'),
(2, 'Group Meditation Retreat', 'Full day meditation and mindfulness retreat in nature.', 400, '2025-10-12 08:00:00', '2025-10-12 18:00:00'),
(2, 'Yoga for Beginners Workshop', 'Learn the basics of yoga in a supportive group environment.', 250, '2025-10-18 10:00:00', '2025-10-18 12:00:00');

-- Fitness Warriors events
INSERT INTO community_quests (community_id, quest_name, quest_description, points_reward, event_date, event_end_date) VALUES
(3, 'HIIT Bootcamp', 'Intense 90-minute high-intensity interval training session.', 300, '2025-10-06 17:00:00', '2025-10-06 18:30:00'),
(3, 'Strength Challenge Weekend', 'Push your limits with our 2-day strength training challenge.', 450, '2025-10-13 09:00:00', '2025-10-14 17:00:00'),
(3, 'CrossFit Competition', 'Test your fitness in this friendly CrossFit competition.', 550, '2025-10-25 08:00:00', '2025-10-25 16:00:00');

-- Cycling Enthusiasts events
INSERT INTO community_quests (community_id, quest_name, quest_description, points_reward, event_date, event_end_date) VALUES
(4, 'Coastal Ride 50km', 'Beautiful coastal route with stunning ocean views.', 350, '2025-10-10 07:00:00', '2025-10-10 12:00:00'),
(4, 'Mountain Trail Challenge', 'Tackle challenging mountain trails with the cycling squad.', 400, '2025-10-17 06:00:00', '2025-10-17 14:00:00');

-- Swimming Squad events
INSERT INTO community_quests (community_id, quest_name, quest_description, points_reward, event_date, event_end_date) VALUES
(5, 'Open Water Swim', 'Join us for an exhilarating open water swimming experience.', 350, '2025-10-09 08:00:00', '2025-10-09 11:00:00'),
(5, 'Pool Training Session', 'Technique improvement and endurance training in the pool.', 200, '2025-10-07 18:00:00', '2025-10-07 20:00:00');

-- Nutrition & Wellness events
INSERT INTO community_quests (community_id, quest_name, quest_description, points_reward, event_date, event_end_date) VALUES
(6, 'Meal Prep Workshop', 'Learn to prepare healthy meals for the entire week.', 250, '2025-10-11 14:00:00', '2025-10-11 17:00:00'),
(6, 'Nutrition Seminar', 'Expert talks on balanced nutrition and healthy lifestyle.', 200, '2025-10-16 19:00:00', '2025-10-16 21:00:00');

-- Make CurrentUser join a few communities
INSERT INTO user_communities (user_id, community_id) VALUES
(1, 1), -- Running Club
(1, 2), -- Yoga & Mindfulness
(1, 3); -- Fitness Warriors

-- Make other users join various communities
INSERT INTO user_communities (user_id, community_id) VALUES
(2, 1), (2, 3), (2, 4),
(3, 2), (3, 6),
(4, 1), (4, 3), (4, 5),
(5, 2), (5, 4), (5, 6),
(6, 1), (6, 2), (6, 3),
(7, 3), (7, 4), (7, 5),
(8, 2), (8, 6),
(9, 1), (9, 4), (9, 5),
(10, 3), (10, 5), (10, 6);
