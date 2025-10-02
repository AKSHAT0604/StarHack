# 🎯 Your Journey Page - Complete Implementation

## Overview
A comprehensive analytics and progress tracking page showing the user's 2-year fitness journey with interactive charts, health metrics, and achievements timeline. This data is structured to be easily consumable by an LLM for personalized quest generation.

---

## 🎨 Fixed Issues

### Text Color in Community Events
- **Problem**: White text on white background in community events section
- **Solution**: 
  - Increased text opacity to 95%
  - Added text shadows for better contrast
  - Enhanced all text elements with proper shadowing

```css
.community-quests-header p {
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.quest-description {
  color: rgba(255, 255, 255, 0.95);
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
}
```

---

## 🗄️ Database Schema

### New Tables for Journey Tracking

#### 1. **user_community_points_history**
Tracks points earned per community over time (for pie chart)

```sql
CREATE TABLE user_community_points_history (
    history_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    community_id INTEGER REFERENCES communities(community_id),
    points_earned INTEGER NOT NULL,
    quest_completed VARCHAR(200),
    earned_at TIMESTAMP WITH TIME ZONE
);
```

**Purpose**: 
- Shows which communities user is most active in
- LLM can use this to recommend similar community events
- Pie chart visualization of points distribution

#### 2. **user_points_history**
Overall points timeline (for line chart)

```sql
CREATE TABLE user_points_history (
    history_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    total_points INTEGER NOT NULL,
    points_change INTEGER NOT NULL,
    activity_description VARCHAR(200),
    recorded_at TIMESTAMP WITH TIME ZONE
);
```

**Purpose**:
- Tracks growth trajectory
- Shows engagement patterns (active months vs inactive)
- LLM can identify trends and motivational patterns

#### 3. **user_health_metrics**
Comprehensive health tracking (for AI insights)

```sql
CREATE TABLE user_health_metrics (
    metric_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
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
    UNIQUE(user_id, metric_date)
);
```

**Purpose**: 
- **Weight**: Track weight loss/gain progress
- **Sleep**: Correlate sleep quality with performance
- **Hydration**: Monitor water intake habits
- **Steps**: Activity level tracking
- **Mood/Stress/Energy**: Mental health indicators
- **LLM Usage**: Generate personalized quests based on improvement areas

#### 4. **user_achievements**
Milestone and achievement tracking

```sql
CREATE TABLE user_achievements (
    achievement_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    achievement_type VARCHAR(50), -- 'streak', 'points_milestone', 'quest_completion', 'community_joined'
    achievement_title VARCHAR(200),
    achievement_description TEXT,
    achieved_at TIMESTAMP WITH TIME ZONE
);
```

**Purpose**:
- Gamification and motivation
- LLM can suggest next achievements
- Timeline of user progress

#### 5. **user_preferences**
User preferences for AI-powered quest generation

```sql
CREATE TABLE user_preferences (
    preference_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    favorite_activities TEXT[], -- Array of activity types
    fitness_goals TEXT[],
    health_conditions TEXT[],
    dietary_preferences TEXT[],
    available_time_slots TEXT[], -- 'morning', 'afternoon', 'evening'
    preferred_difficulty VARCHAR(20), -- 'easy', 'medium', 'hard'
    UNIQUE(user_id)
);
```

**Purpose**: Critical for LLM quest generation
- **favorite_activities**: Prioritize quest types
- **fitness_goals**: Align quests with objectives
- **health_conditions**: Avoid contraindicated activities
- **dietary_preferences**: Nutrition-related quests
- **available_time_slots**: Schedule-appropriate quests
- **preferred_difficulty**: Challenge level matching

---

## 📊 Dummy Data Summary (2 Years)

### Community Points Distribution
- **Fitness Warriors**: 5,350 points (13 events)
- **Running Club**: 3,700 points (12 events)
- **Yoga & Mindfulness**: 3,200 points (12 events)
- **Total Community Points**: 13,250 points

### Health Metrics Progress (Oct 2023 → Sep 2024)
| Metric | Start | Current | Change |
|--------|-------|---------|--------|
| Weight | 85.5 kg | 78.5 kg | -7.0 kg ⬇️ |
| Sleep | 6.5 hrs | 8.2 hrs | +1.7 hrs ⬆️ |
| Water | 1800 ml | 3200 ml | +1400 ml ⬆️ |
| Steps | 8,500 | 14,500 | +6,000 ⬆️ |
| Workout | 30 min | 85 min | +55 min ⬆️ |
| Mood | 6/10 | 10/10 | +4 ⬆️ |
| Energy | 6/10 | 10/10 | +4 ⬆️ |
| Stress | 6/10 | 2/10 | -4 ⬇️ |

### Achievements Timeline
12 major achievements spanning:
- 3 Community joins
- 3 Streak milestones (7, 30, 100 days)
- 3 Points milestones (1K, 5K, 10K)
- 3 Quest completion milestones (1st marathon, 50 quests, 100 quests)

---

## 🔌 API Endpoints

### Journey Endpoints

#### GET `/journey/stats/{user_id}`
Returns overall statistics

**Response**:
```json
{
  "days_active": 730,
  "member_since": "2023-10-01T00:00:00Z",
  "communities_joined": 3,
  "quests_completed": 127,
  "achievements_earned": 12,
  "total_points": 13850,
  "current_streak": 5
}
```

#### GET `/journey/community-breakdown/{user_id}`
Points earned per community (pie chart data)

**Response**:
```json
[
  {
    "community_id": 3,
    "community_name": "Fitness Warriors",
    "community_color": "#f59e0b",
    "community_icon": "💪",
    "total_points": 5350
  },
  ...
]
```

#### GET `/journey/points-timeline/{user_id}`
Historical points progression (line chart data)

**Response**:
```json
[
  {
    "date": "2023-10-01",
    "total_points": 0
  },
  {
    "date": "2023-11-01",
    "total_points": 450
  },
  ...
]
```

#### GET `/journey/health-metrics/{user_id}`
Health metrics over time (multiple charts)

**Response**:
```json
[
  {
    "metric_date": "2023-10-15",
    "weight_kg": 85.5,
    "sleep_hours": 6.5,
    "water_intake_ml": 1800,
    "steps": 8500,
    "workout_minutes": 30,
    "mood_score": 6,
    "energy_level": 6
  },
  ...
]
```

#### GET `/journey/achievements/{user_id}`
Achievement timeline

**Response**:
```json
[
  {
    "achievement_title": "100-Day Streak",
    "achievement_description": "Completed daily quests for 100 consecutive days",
    "achieved_at": "2024-05-05T20:00:00Z",
    "achievement_type": "streak"
  },
  ...
]
```

---

## 🎨 Frontend Features

### Journey Page Components

#### 1. **Stats Overview Grid** (6 Cards)
- Days Active
- Total Points
- Quests Completed
- Current Streak
- Communities Joined
- Achievements Earned

#### 2. **Interactive Charts** (6 Charts)
Using Chart.js and react-chartjs-2:
1. **Points Progress** - Line chart showing cumulative growth
2. **Community Breakdown** - Pie chart of points by community
3. **Weight Progress** - Line chart tracking weight loss
4. **Sleep Quality** - Line chart of sleep hours
5. **Hydration Levels** - Line chart of water intake
6. **Daily Steps** - Line chart of activity levels

#### 3. **Achievements Timeline**
Scrollable list of all milestones with:
- Icon based on achievement type
- Title and description
- Date achieved
- Hover effects

### Visual Design
- Dark theme with gradient accents
- Purple/pink gradient headers
- Responsive grid layouts
- Smooth hover animations
- Glass-morphism cards
- Custom scrollbars

---

## 🤖 LLM Integration Strategy

### Data Structure for AI Quest Generation

When ready to integrate LLM, query these tables:

```python
# Pseudo-code for LLM context building
user_context = {
    "profile": get_user_preferences(user_id),
    "history": {
        "favorite_communities": get_top_communities(user_id, limit=3),
        "recent_health_trends": get_health_metrics(user_id, days=30),
        "achievement_velocity": calculate_achievement_rate(user_id),
        "engagement_pattern": analyze_activity_times(user_id)
    },
    "goals": {
        "weight_goal": calculate_weight_trajectory(user_id),
        "fitness_level": estimate_fitness_level(user_id),
        "preferred_activities": get_favorite_activities(user_id)
    }
}

# Send to LLM
prompt = f"""
Generate 3 personalized fitness quests for a user with:
- Favorite activities: {user_context['profile']['favorite_activities']}
- Recent weight progress: {user_context['history']['recent_health_trends']['weight']}
- Available time: {user_context['profile']['available_time_slots']}
- Fitness goals: {user_context['profile']['fitness_goals']}
- Current communities: {user_context['history']['favorite_communities']}

Quests should be:
- Difficulty: {user_context['profile']['preferred_difficulty']}
- Aligned with health conditions: {user_context['profile']['health_conditions']}
- Scheduled for: {user_context['profile']['available_time_slots']}
"""
```

### LLM Quest Generation Workflow

1. **Fetch User Context**: Query all journey tables
2. **Build Prompt**: Structure data for LLM
3. **Generate Quests**: Send to LLM API (GPT-4, Claude, etc.)
4. **Parse Response**: Extract quest details
5. **Insert to DB**: Add personalized quests to `quests` table
6. **Notify User**: "New personalized quests available!"

### Example Personalized Quest

Based on dummy data, LLM might generate:

```
Quest Name: "Morning Yoga Weight Loss Challenge"
Description: "You've made great progress losing 7kg! Let's maintain momentum with 3 morning yoga sessions this week."
Type: weekly
Points: 300
Reasoning: 
- User loves yoga (favorite_activities)
- Available in mornings (time_slots)
- Weight loss goal (fitness_goals)
- Part of Yoga & Mindfulness community
```

---

## 📝 Usage Instructions

### Viewing Your Journey

1. Navigate to `/journey` in the app
2. View stats overview at the top
3. Scroll through interactive charts
4. Review achievement timeline at bottom

### Data Updates

Journey data updates when:
- Completing quests (adds to community points history)
- Earning achievements (adds to timeline)
- Health metrics logged (manual entry - future feature)
- Points milestones reached (automatic)

### For Developers

To add more dummy data:
```sql
-- Add more community event completions
INSERT INTO user_community_points_history 
(user_id, community_id, points_earned, quest_completed, earned_at) 
VALUES (1, 1, 250, 'New Running Event', CURRENT_TIMESTAMP);

-- Add health metrics entry
INSERT INTO user_health_metrics 
(user_id, metric_date, weight_kg, sleep_hours, water_intake_ml, steps) 
VALUES (1, CURRENT_DATE, 78.0, 8.0, 3200, 15000);
```

---

## 🚀 Future Enhancements

### Phase 1: Manual Health Entry
- Add forms to log daily health metrics
- Mobile app for easier tracking
- Wearable device integration (Fitbit, Apple Watch)

### Phase 2: LLM Integration
- Connect to OpenAI/Anthropic API
- Implement quest generation pipeline
- A/B test AI-generated vs static quests

### Phase 3: Advanced Analytics
- Predictive analytics for goal achievement
- Correlation analysis (sleep vs performance)
- Social comparison (anonymized peer data)
- Injury risk prediction

### Phase 4: Gamification++
- Seasonal challenges
- Team competitions
- Virtual badges and trophies
- Social sharing features

---

## 📊 Database Query Examples

### Get User's Top 3 Activities
```sql
SELECT 
    c.community_name,
    COUNT(*) as events_completed,
    SUM(points_earned) as total_points
FROM user_community_points_history ucph
JOIN communities c ON ucph.community_id = c.community_id
WHERE user_id = 1
GROUP BY c.community_name
ORDER BY total_points DESC
LIMIT 3;
```

### Calculate Monthly Improvement
```sql
SELECT 
    DATE_TRUNC('month', metric_date) as month,
    AVG(weight_kg) as avg_weight,
    AVG(sleep_hours) as avg_sleep,
    AVG(steps) as avg_steps
FROM user_health_metrics
WHERE user_id = 1
GROUP BY DATE_TRUNC('month', metric_date)
ORDER BY month;
```

### LLM Context Builder Query
```sql
SELECT 
    u.username,
    up.favorite_activities,
    up.fitness_goals,
    up.preferred_difficulty,
    array_agg(DISTINCT c.community_name) as communities,
    (SELECT COUNT(*) FROM user_quests WHERE user_id = u.user_id) as total_quests,
    (SELECT AVG(weight_kg) FROM user_health_metrics WHERE user_id = u.user_id AND metric_date >= CURRENT_DATE - 30) as recent_avg_weight,
    (SELECT AVG(sleep_hours) FROM user_health_metrics WHERE user_id = u.user_id AND metric_date >= CURRENT_DATE - 30) as recent_avg_sleep
FROM users u
LEFT JOIN user_preferences up ON u.user_id = up.user_id
LEFT JOIN user_communities uc ON u.user_id = uc.user_id
LEFT JOIN communities c ON uc.community_id = c.community_id
WHERE u.user_id = 1
GROUP BY u.user_id, u.username, up.favorite_activities, up.fitness_goals, up.preferred_difficulty;
```

---

## ✅ Testing Checklist

- [x] Database tables created successfully
- [x] 2 years of dummy data inserted
- [x] Backend API endpoints working
- [x] Frontend Journey page rendering
- [x] All 6 charts displaying correctly
- [x] Stats cards showing accurate numbers
- [x] Achievement timeline populated
- [x] Responsive design on mobile
- [x] Text color contrast fixed
- [x] Navigation link added

---

**Created**: October 2, 2025
**Status**: ✅ Fully Implemented
**Next Step**: Integrate LLM for personalized quest generation
