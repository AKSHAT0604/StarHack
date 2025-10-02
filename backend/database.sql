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
    tier VARCHAR(20) DEFAULT 'Bronze', -- Bronze, Silver, Gold, Platinum, Diamond
    streak_freeze_available BOOLEAN DEFAULT FALSE, -- If user has bought streak freeze
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

-- User Journey / Historical Data Tracking Tables

-- Track points earned per community over time
CREATE TABLE user_community_points_history (
    history_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    community_id INTEGER REFERENCES communities(community_id) ON DELETE CASCADE,
    points_earned INTEGER NOT NULL,
    quest_completed VARCHAR(200),
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Track overall points history for line chart
CREATE TABLE user_points_history (
    history_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    total_points INTEGER NOT NULL,
    points_change INTEGER NOT NULL,
    activity_description VARCHAR(200),
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Track health metrics over time for AI/LLM insights
CREATE TABLE user_health_metrics (
    metric_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    metric_date DATE NOT NULL,
    weight_kg DECIMAL(5,2),
    sleep_hours DECIMAL(4,2),
    water_intake_ml INTEGER,
    steps INTEGER,
    heart_rate_avg INTEGER,
    workout_minutes INTEGER,
    calories_burned INTEGER,
    mood_score INTEGER CHECK (mood_score BETWEEN 1 AND 10),
    stress_level INTEGER CHECK (stress_level BETWEEN 1 AND 10),
    energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 10),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, metric_date)
);

-- Track user achievements and milestones
CREATE TABLE user_achievements (
    achievement_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    achievement_type VARCHAR(50), -- 'streak', 'points_milestone', 'quest_completion', 'community_joined'
    achievement_title VARCHAR(200),
    achievement_description TEXT,
    achieved_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AI/LLM context data for personalized quest generation
CREATE TABLE user_preferences (
    preference_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    favorite_activities TEXT[], -- Array of activity types
    fitness_goals TEXT[],
    health_conditions TEXT[],
    dietary_preferences TEXT[],
    available_time_slots TEXT[], -- e.g., 'morning', 'afternoon', 'evening'
    preferred_difficulty VARCHAR(20), -- 'easy', 'medium', 'hard'
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
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

-- ===== HISTORICAL DATA FOR CURRENT USER (2 YEARS) =====

-- Community Points Distribution (for pie chart)
-- Running Club: 4,500 points over 2 years
INSERT INTO user_community_points_history (user_id, community_id, points_earned, quest_completed, earned_at) VALUES
(1, 1, 200, '5K Fun Run', '2023-10-15 08:00:00+00'),
(1, 1, 500, 'City Marathon', '2023-11-20 07:00:00+00'),
(1, 1, 300, 'Night Run Challenge', '2024-01-10 19:00:00+00'),
(1, 1, 200, '5K Fun Run', '2024-02-14 08:00:00+00'),
(1, 1, 350, 'Half Marathon', '2024-03-22 06:00:00+00'),
(1, 1, 200, 'Sprint Challenge', '2024-04-18 07:00:00+00'),
(1, 1, 500, 'City Marathon', '2024-05-25 07:00:00+00'),
(1, 1, 300, 'Trail Run', '2024-06-30 06:00:00+00'),
(1, 1, 250, 'Beach Run', '2024-07-15 07:00:00+00'),
(1, 1, 200, '5K Fun Run', '2024-08-20 08:00:00+00'),
(1, 1, 400, 'Ultra Challenge', '2024-09-10 05:00:00+00'),
(1, 1, 300, 'Charity Run', '2024-09-28 08:00:00+00');

-- Yoga & Mindfulness: 3,200 points
INSERT INTO user_community_points_history (user_id, community_id, points_earned, quest_completed, earned_at) VALUES
(1, 2, 150, 'Sunrise Yoga', '2023-10-22 06:00:00+00'),
(1, 2, 400, 'Meditation Retreat', '2023-12-05 08:00:00+00'),
(1, 2, 250, 'Yoga Workshop', '2024-01-18 10:00:00+00'),
(1, 2, 150, 'Sunrise Yoga', '2024-02-25 06:00:00+00'),
(1, 2, 300, 'Mindfulness Session', '2024-03-30 14:00:00+00'),
(1, 2, 400, 'Meditation Retreat', '2024-05-12 08:00:00+00'),
(1, 2, 250, 'Yoga Workshop', '2024-06-20 10:00:00+00'),
(1, 2, 150, 'Sunset Yoga', '2024-07-28 18:00:00+00'),
(1, 2, 350, 'Wellness Weekend', '2024-08-15 09:00:00+00'),
(1, 2, 200, 'Breathing Workshop', '2024-09-08 15:00:00+00'),
(1, 2, 400, 'Meditation Retreat', '2024-09-22 08:00:00+00'),
(1, 2, 200, 'Evening Yoga', '2024-09-30 18:00:00+00');

-- Fitness Warriors: 5,800 points
INSERT INTO user_community_points_history (user_id, community_id, points_earned, quest_completed, earned_at) VALUES
(1, 3, 300, 'HIIT Bootcamp', '2023-10-28 17:00:00+00'),
(1, 3, 450, 'Strength Challenge', '2023-11-15 09:00:00+00'),
(1, 3, 550, 'CrossFit Competition', '2023-12-20 08:00:00+00'),
(1, 3, 300, 'HIIT Bootcamp', '2024-01-25 17:00:00+00'),
(1, 3, 400, 'Endurance Challenge', '2024-02-28 08:00:00+00'),
(1, 3, 450, 'Strength Challenge', '2024-03-18 09:00:00+00'),
(1, 3, 500, 'Warrior Weekend', '2024-04-22 08:00:00+00'),
(1, 3, 300, 'HIIT Bootcamp', '2024-05-30 17:00:00+00'),
(1, 3, 550, 'CrossFit Competition', '2024-06-25 08:00:00+00'),
(1, 3, 350, 'Strength Workshop', '2024-07-20 10:00:00+00'),
(1, 3, 450, 'Strength Challenge', '2024-08-28 09:00:00+00'),
(1, 3, 400, 'Fitness Fest', '2024-09-18 08:00:00+00'),
(1, 3, 350, 'Bootcamp Special', '2024-09-25 17:00:00+00');

-- Overall Points History (for line chart - quarterly snapshots over 2 years)
INSERT INTO user_points_history (user_id, total_points, points_change, activity_description, recorded_at) VALUES
(1, 0, 0, 'Account Created', '2023-10-01 00:00:00+00'),
(1, 450, 450, 'First month achievements', '2023-11-01 00:00:00+00'),
(1, 1200, 750, 'Marathon and quests completed', '2023-12-01 00:00:00+00'),
(1, 2100, 900, 'New year fitness goals', '2024-01-01 00:00:00+00'),
(1, 3200, 1100, 'Consistent weekly progress', '2024-02-01 00:00:00+00'),
(1, 4500, 1300, 'Spring challenge streak', '2024-03-01 00:00:00+00'),
(1, 6000, 1500, 'Personal best month', '2024-04-01 00:00:00+00'),
(1, 7800, 1800, 'Summer fitness peak', '2024-05-01 00:00:00+00'),
(1, 9200, 1400, 'Maintained momentum', '2024-06-01 00:00:00+00'),
(1, 10500, 1300, 'CrossFit achievements', '2024-07-01 00:00:00+00'),
(1, 12000, 1500, 'Record breaking month', '2024-08-01 00:00:00+00'),
(1, 13200, 1200, 'Consistent progress', '2024-09-01 00:00:00+00'),
(1, 13850, 650, 'Current standing', '2024-10-01 00:00:00+00');

-- Health Metrics (monthly data for 2 years - 24 months)
-- Showing gradual improvement in weight, sleep, hydration, and fitness metrics
INSERT INTO user_health_metrics (user_id, metric_date, weight_kg, sleep_hours, water_intake_ml, steps, heart_rate_avg, workout_minutes, calories_burned, mood_score, stress_level, energy_level) VALUES
-- Year 1: 2023 Oct-Dec
(1, '2023-10-15', 85.5, 6.5, 1800, 8500, 75, 30, 350, 6, 6, 6),
(1, '2023-11-15', 84.8, 6.8, 2000, 9200, 74, 35, 400, 7, 5, 7),
(1, '2023-12-15', 84.0, 7.0, 2200, 9800, 73, 40, 450, 7, 5, 7),
-- Year 2: 2024 Jan-Dec
(1, '2024-01-15', 83.2, 7.2, 2400, 10500, 72, 45, 500, 8, 4, 8),
(1, '2024-02-15', 82.5, 7.3, 2500, 11000, 71, 50, 550, 8, 4, 8),
(1, '2024-03-15', 81.8, 7.5, 2600, 11500, 70, 55, 600, 8, 3, 8),
(1, '2024-04-15', 81.0, 7.5, 2700, 12000, 69, 60, 650, 9, 3, 9),
(1, '2024-05-15', 80.3, 7.8, 2800, 12500, 68, 65, 700, 9, 3, 9),
(1, '2024-06-15', 79.8, 8.0, 2900, 13000, 67, 70, 750, 9, 2, 9),
(1, '2024-07-15', 79.2, 8.0, 3000, 13500, 66, 75, 800, 9, 2, 9),
(1, '2024-08-15', 78.8, 8.2, 3100, 14000, 65, 80, 850, 10, 2, 10),
(1, '2024-09-15', 78.5, 8.2, 3200, 14500, 65, 85, 900, 10, 2, 10);

-- User Achievements
INSERT INTO user_achievements (user_id, achievement_type, achievement_title, achievement_description, achieved_at) VALUES
(1, 'community_joined', 'Joined Running Club', 'Became a member of the Running Club community', '2023-10-08 10:00:00+00'),
(1, 'community_joined', 'Joined Yoga & Mindfulness', 'Became a member of Yoga & Mindfulness community', '2023-10-10 11:00:00+00'),
(1, 'community_joined', 'Joined Fitness Warriors', 'Became a member of Fitness Warriors community', '2023-10-12 12:00:00+00'),
(1, 'streak', '7-Day Streak', 'Completed daily quests for 7 consecutive days', '2023-10-22 20:00:00+00'),
(1, 'points_milestone', '1000 Points Milestone', 'Earned your first 1000 points!', '2023-11-28 15:00:00+00'),
(1, 'quest_completion', 'First Marathon', 'Completed your first marathon event', '2023-11-20 12:00:00+00'),
(1, 'streak', '30-Day Streak', 'Completed daily quests for 30 consecutive days', '2023-12-15 20:00:00+00'),
(1, 'points_milestone', '5000 Points Milestone', 'Reached 5000 total points!', '2024-03-10 16:00:00+00'),
(1, 'quest_completion', '50 Quests Completed', 'Completed 50 quests across all communities', '2024-04-20 14:00:00+00'),
(1, 'streak', '100-Day Streak', 'Completed daily quests for 100 consecutive days', '2024-05-05 20:00:00+00'),
(1, 'points_milestone', '10000 Points Milestone', 'Reached 10,000 total points!', '2024-07-15 18:00:00+00'),
(1, 'quest_completion', '100 Quests Completed', 'Completed 100 quests - true dedication!', '2024-08-30 15:00:00+00');

-- User Preferences (for AI/LLM personalized quest generation)
INSERT INTO user_preferences (user_id, favorite_activities, fitness_goals, health_conditions, dietary_preferences, available_time_slots, preferred_difficulty) VALUES
(1, 
 ARRAY['running', 'yoga', 'strength training', 'HIIT', 'meditation'],
 ARRAY['lose weight', 'build muscle', 'improve endurance', 'better sleep', 'stress management'],
 ARRAY['none'],
 ARRAY['high protein', 'low carb', 'vegetarian friendly'],
 ARRAY['morning', 'evening'],
 'medium'
);

-- Store Products Table
CREATE TABLE store_products (
    product_id SERIAL PRIMARY KEY,
    product_name VARCHAR(200) NOT NULL,
    product_description TEXT,
    product_category VARCHAR(50), -- 'wellness', 'insurance', 'premium_feature'
    base_price DECIMAL(10,2) NOT NULL, -- Price in rupees
    product_icon VARCHAR(50) DEFAULT '🛒',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Purchases Table
CREATE TABLE user_purchases (
    purchase_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES store_products(product_id) ON DELETE CASCADE,
    original_price DECIMAL(10,2) NOT NULL,
    discount_applied DECIMAL(5,2) DEFAULT 0, -- Percentage discount
    final_price DECIMAL(10,2) NOT NULL,
    user_tier VARCHAR(20), -- Tier at time of purchase
    purchase_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Store Products Data
INSERT INTO store_products (product_name, product_description, product_category, base_price, product_icon) VALUES
-- Wellness Services
('Nutritionist Consultation (30 min)', 'One-on-one session with certified nutritionist', 'wellness', 1500.00, '🥗'),
('Nutritionist Consultation (60 min)', 'Extended consultation with meal plan', 'wellness', 2500.00, '🥗'),
('Personal Trainer (1 Session)', 'Individual training session at gym', 'wellness', 1000.00, '💪'),
('Personal Trainer (10 Sessions)', 'Package of 10 training sessions', 'wellness', 8500.00, '💪'),
('Yoga Class (Single)', 'Drop-in yoga class', 'wellness', 500.00, '🧘'),
('Yoga Class (Monthly)', 'Unlimited yoga classes for 1 month', 'wellness', 3000.00, '🧘'),
('Gym Membership (Monthly)', 'Full gym access for 1 month', 'wellness', 2000.00, '🏋️'),
('Gym Membership (Quarterly)', 'Full gym access for 3 months', 'wellness', 5500.00, '🏋️'),
('Gym Membership (Yearly)', 'Full gym access for 12 months', 'wellness', 18000.00, '🏋️'),
('Mental Health Counseling', '60-minute session with therapist', 'wellness', 2000.00, '🧠'),
('Health Checkup (Basic)', 'Basic health screening package', 'wellness', 1500.00, '🏥'),
('Health Checkup (Comprehensive)', 'Complete health diagnostic package', 'wellness', 5000.00, '🏥'),

-- Insurance Products
('Health Insurance (Basic)', 'Basic health coverage - 5 Lakh', 'insurance', 8000.00, '🏥'),
('Health Insurance (Premium)', 'Premium health coverage - 10 Lakh', 'insurance', 15000.00, '🏥'),
('Life Insurance (Term)', 'Term life insurance - 50 Lakh', 'insurance', 10000.00, '💼'),
('Accidental Insurance', 'Accidental death & disability cover', 'insurance', 3000.00, '🛡️'),
('Critical Illness Rider', 'Critical illness coverage addon', 'insurance', 5000.00, '❤️'),

-- Premium Features
('Streak Freeze', 'Save your streak once - never lose progress!', 'premium_feature', 50.00, '🔥'),
('Premium Membership (Monthly)', 'Ad-free + exclusive quests + priority support', 'premium_feature', 299.00, '⭐'),
('Premium Membership (Yearly)', 'Ad-free + exclusive quests + priority support', 'premium_feature', 2999.00, '⭐'),
('VIP Coach Access', 'Direct chat with wellness coaches', 'premium_feature', 999.00, '👨‍⚕️');

-- Tier Benefits Documentation (for reference)
-- This helps calculate discounts
CREATE TABLE tier_benefits (
    tier_id SERIAL PRIMARY KEY,
    tier_name VARCHAR(20) UNIQUE NOT NULL,
    min_streak INTEGER NOT NULL,
    max_streak INTEGER,
    discount_percentage DECIMAL(5,2) NOT NULL,
    tier_color VARCHAR(20),
    tier_icon VARCHAR(10)
);

INSERT INTO tier_benefits (tier_name, min_streak, max_streak, discount_percentage, tier_color, tier_icon) VALUES
('Bronze', 0, 6, 0.00, '#CD7F32', '🥉'),
('Silver', 7, 29, 5.00, '#C0C0C0', '🥈'),
('Gold', 30, 89, 10.00, '#FFD700', '🥇'),
('Platinum', 90, 179, 15.00, '#E5E4E2', '💎'),
('Diamond', 180, NULL, 20.00, '#B9F2FF', '💠');
