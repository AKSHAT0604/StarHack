import os
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import psycopg2
from psycopg2.extras import RealDictCursor
from contextlib import contextmanager
from datetime import date, timedelta

app = FastAPI(title="StarHack API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Adjust for your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database connection
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://starlife_user:starlife_pass@postgres/starlife_db")

@contextmanager
def get_db_connection():
    conn = psycopg2.connect(DATABASE_URL)
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

# Pydantic Models
class User(BaseModel):
    user_id: int
    username: str
    points: int
    spent_points: int
    weekly_points: int
    week_start: date | None = None
    streak: int
    last_login: date | None = None
    last_daily_completion: date | None = None

class Quest(BaseModel):
    quest_id: int
    quest_name: str
    quest_description: str
    quest_type: str
    points_reward: int
    completed: bool = False

class Reward(BaseModel):
    reward_id: int
    reward_name: str
    reward_description: str
    cost: int

class LeaderboardUser(BaseModel):
    user_id: int
    username: str
    weekly_points: int
    streak: int

class Community(BaseModel):
    community_id: int
    community_name: str
    community_description: str
    community_color: str
    community_icon: str
    member_count: int
    is_joined: bool = False

class CommunityQuest(BaseModel):
    community_quest_id: int
    community_id: int
    community_name: str
    community_color: str
    community_icon: str
    quest_name: str
    quest_description: str
    points_reward: int
    event_date: str
    event_end_date: str
    completed: bool = False
    time_until_event: str = ""

class CommunityPointsBreakdown(BaseModel):
    community_id: int
    community_name: str
    community_color: str
    community_icon: str
    total_points: int

class PointsHistoryEntry(BaseModel):
    date: str
    total_points: int

class HealthMetric(BaseModel):
    metric_date: str
    weight_kg: float | None
    sleep_hours: float | None
    water_intake_ml: int | None
    steps: int | None
    workout_minutes: int | None
    mood_score: int | None
    energy_level: int | None

class Achievement(BaseModel):
    achievement_title: str
    achievement_description: str
    achieved_at: str
    achievement_type: str

# --- User and Game Data Endpoints ---

@app.get("/user/{user_id}", response_model=User)
def get_user_data(user_id: int):
    """
    Retrieves user's main data (points, streak) and updates streak if necessary.
    Also resets weekly_points if a new week has started.
    """
    with get_db_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT * FROM users WHERE user_id = %s", (user_id,))
            user = cur.fetchone()
            if not user:
                raise HTTPException(status_code=404, detail="User not found")

            # Check and reset streak if a day has been missed
            today = date.today()
            last_login = user['last_login']
            if last_login and (today - last_login).days > 1:
                user['streak'] = 0
                cur.execute("UPDATE users SET streak = 0 WHERE user_id = %s", (user_id,))

            # Check if new week started and reset weekly_points
            week_start = user['week_start']
            current_week_start = date.today() - timedelta(days=date.today().weekday())
            if not week_start or week_start < current_week_start:
                # Award bonus points to top 5 before resetting
                if week_start and week_start < current_week_start:
                    award_weekly_bonus(cur)
                # Reset weekly points for new week
                cur.execute(
                    "UPDATE users SET weekly_points = 0, week_start = %s WHERE user_id = %s",
                    (current_week_start, user_id)
                )
                user['weekly_points'] = 0
                user['week_start'] = current_week_start

            # Update last_login to today
            if last_login != today:
                 cur.execute("UPDATE users SET last_login = %s WHERE user_id = %s", (today, user_id,))

            return user

@app.get("/quests/{user_id}", response_model=List[Quest])
def get_user_quests(user_id: int):
    """
    Retrieves all active quests and marks the ones the user has completed.
    Respects reset timings: daily (next day), weekly (Monday), monthly (1st of month).
    """
    with get_db_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            query = """
                SELECT
                    q.quest_id,
                    q.quest_name,
                    q.quest_description,
                    q.quest_type,
                    q.points_reward,
                    CASE
                        WHEN uq.completed_at IS NOT NULL AND
                        (
                            (q.quest_type = 'daily' AND uq.completed_at::date = CURRENT_DATE) OR
                            (q.quest_type = 'weekly' AND uq.completed_at >= date_trunc('week', CURRENT_DATE)) OR
                            (q.quest_type = 'monthly' AND uq.completed_at >= date_trunc('month', CURRENT_DATE))
                        )
                        THEN TRUE
                        ELSE FALSE
                    END AS completed
                FROM quests q
                LEFT JOIN (
                    SELECT DISTINCT ON (user_id, quest_id) *
                    FROM user_quests
                    WHERE user_id = %s
                    ORDER BY user_id, quest_id, completed_at DESC
                ) uq ON q.quest_id = uq.quest_id
                WHERE q.is_active = TRUE
                ORDER BY q.quest_type, q.quest_id;
            """
            cur.execute(query, (user_id,))
            quests = cur.fetchall()
            return quests


@app.post("/quests/complete/{user_id}/{quest_id}")
def complete_quest(user_id: int, quest_id: int):
    """
    Marks a quest as complete for a user, updates points, and manages streak.
    Increments streak when all daily quests are completed.
    """
    with get_db_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # Get quest details
            cur.execute("SELECT points_reward, quest_type FROM quests WHERE quest_id = %s", (quest_id,))
            quest = cur.fetchone()
            if not quest:
                raise HTTPException(status_code=404, detail="Quest not found")

            # Check if quest is already completed based on quest type
            if quest['quest_type'] == 'daily':
                cur.execute(
                    "SELECT * FROM user_quests WHERE user_id = %s AND quest_id = %s AND completed_at::date = CURRENT_DATE",
                    (user_id, quest_id)
                )
            elif quest['quest_type'] == 'weekly':
                cur.execute(
                    "SELECT * FROM user_quests WHERE user_id = %s AND quest_id = %s AND completed_at >= date_trunc('week', CURRENT_DATE)",
                    (user_id, quest_id)
                )
            else:  # monthly
                cur.execute(
                    "SELECT * FROM user_quests WHERE user_id = %s AND quest_id = %s AND completed_at >= date_trunc('month', CURRENT_DATE)",
                    (user_id, quest_id)
                )
            
            if cur.fetchone():
                raise HTTPException(status_code=400, detail=f"Quest already completed this {quest['quest_type']} period")

            # Record quest completion
            cur.execute(
                "INSERT INTO user_quests (user_id, quest_id, completed_at) VALUES (%s, %s, CURRENT_TIMESTAMP)",
                (user_id, quest_id)
            )

            # Update user points and weekly_points
            cur.execute(
                "UPDATE users SET points = points + %s, weekly_points = weekly_points + %s WHERE user_id = %s",
                (quest['points_reward'], quest['points_reward'], user_id)
            )

            # Check if all daily quests are completed
            all_daily_complete = False
            streak_incremented = False
            if quest['quest_type'] == 'daily':
                # Get total number of daily quests
                cur.execute("SELECT COUNT(*) as total FROM quests WHERE quest_type = 'daily' AND is_active = TRUE")
                total_daily = cur.fetchone()['total']
                
                # Get number of completed daily quests today
                cur.execute(
                    """SELECT COUNT(*) as completed FROM user_quests uq
                       JOIN quests q ON uq.quest_id = q.quest_id
                       WHERE uq.user_id = %s AND q.quest_type = 'daily' 
                       AND uq.completed_at::date = CURRENT_DATE""",
                    (user_id,)
                )
                completed_daily = cur.fetchone()['completed']
                
                # If all daily quests completed and not already incremented today
                if completed_daily >= total_daily:
                    cur.execute(
                        "SELECT last_daily_completion FROM users WHERE user_id = %s",
                        (user_id,)
                    )
                    user_data = cur.fetchone()
                    last_completion = user_data['last_daily_completion']
                    
                    if last_completion != date.today():
                        cur.execute(
                            "UPDATE users SET streak = streak + 1, last_daily_completion = CURRENT_DATE WHERE user_id = %s",
                            (user_id,)
                        )
                        all_daily_complete = True
                        streak_incremented = True

            conn.commit()
            return {
                "message": "Quest completed successfully",
                "points_added": quest['points_reward'],
                "all_daily_complete": all_daily_complete,
                "streak_incremented": streak_incremented
            }


def award_weekly_bonus(cur):
    """
    Awards bonus points to top 5 users based on weekly_points.
    1st place: 500 points, 2nd: 300, 3rd: 200, 4th: 100, 5th: 50
    """
    bonuses = [500, 300, 200, 100, 50]
    cur.execute("""
        SELECT user_id FROM users 
        ORDER BY weekly_points DESC 
        LIMIT 5
    """)
    top_users = cur.fetchall()
    
    for idx, user in enumerate(top_users):
        if idx < len(bonuses):
            cur.execute(
                "UPDATE users SET points = points + %s WHERE user_id = %s",
                (bonuses[idx], user['user_id'])
            )

@app.get("/leaderboard", response_model=List[LeaderboardUser])
def get_leaderboard():
    """
    Retrieves top 10 users sorted by weekly points earned.
    """
    with get_db_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT 
                    user_id, 
                    username, 
                    weekly_points,
                    streak
                FROM users 
                ORDER BY weekly_points DESC 
                LIMIT 10
            """)
            return cur.fetchall()

# --- Rewards Endpoints ---

@app.get("/rewards", response_model=List[Reward])
def get_rewards():
    """
    Retrieves all active rewards.
    """
    with get_db_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT reward_id, reward_name, reward_description, cost FROM rewards WHERE is_active = TRUE")
            return cur.fetchall()

@app.post("/quests/reset/{user_id}")
def reset_quests(user_id: int):
    """
    TEMPORARY TESTING ENDPOINT: Resets all quest completions for a user.
    This will be removed before deployment.
    """
    with get_db_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # Delete all quest completions for this user
            cur.execute("DELETE FROM user_quests WHERE user_id = %s", (user_id,))
            conn.commit()
            return {"message": "All quests have been reset for testing"}

@app.post("/rewards/claim/{user_id}/{reward_id}")
def claim_reward(user_id: int, reward_id: int):
    """
    Allows a user to claim a reward, deducting the cost from their points and tracking spent_points.
    """
    with get_db_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # Get user points and reward cost
            cur.execute("SELECT points FROM users WHERE user_id = %s", (user_id,))
            user = cur.fetchone()
            cur.execute("SELECT cost FROM rewards WHERE reward_id = %s", (reward_id,))
            reward = cur.fetchone()

            if not user:
                raise HTTPException(status_code=404, detail="User not found")
            if not reward:
                raise HTTPException(status_code=404, detail="Reward not found")

            if user['points'] < reward['cost']:
                raise HTTPException(status_code=400, detail="Not enough points")

            # Deduct points, increment spent_points, and record the claimed reward
            cur.execute(
                "UPDATE users SET points = points - %s, spent_points = spent_points + %s WHERE user_id = %s",
                (reward['cost'], reward['cost'], user_id)
            )
            cur.execute(
                "INSERT INTO user_rewards (user_id, reward_id) VALUES (%s, %s)",
                (user_id, reward_id)
            )
            conn.commit()
            return {"message": "Reward claimed successfully", "new_points": user['points'] - reward['cost']}

# --- Community Endpoints ---

@app.get("/communities/{user_id}", response_model=List[Community])
def get_communities(user_id: int):
    """
    Retrieves all communities and indicates which ones the user has joined.
    """
    with get_db_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT 
                    c.community_id,
                    c.community_name,
                    c.community_description,
                    c.community_color,
                    c.community_icon,
                    c.member_count,
                    CASE WHEN uc.user_id IS NOT NULL THEN TRUE ELSE FALSE END as is_joined
                FROM communities c
                LEFT JOIN user_communities uc ON c.community_id = uc.community_id AND uc.user_id = %s
                ORDER BY c.community_name
            """, (user_id,))
            return cur.fetchall()

@app.post("/communities/join/{user_id}/{community_id}")
def join_community(user_id: int, community_id: int):
    """
    Allows a user to join a community.
    """
    with get_db_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # Check if already joined
            cur.execute(
                "SELECT * FROM user_communities WHERE user_id = %s AND community_id = %s",
                (user_id, community_id)
            )
            if cur.fetchone():
                raise HTTPException(status_code=400, detail="Already joined this community")
            
            # Join community
            cur.execute(
                "INSERT INTO user_communities (user_id, community_id) VALUES (%s, %s)",
                (user_id, community_id)
            )
            
            # Update member count
            cur.execute(
                "UPDATE communities SET member_count = member_count + 1 WHERE community_id = %s",
                (community_id,)
            )
            
            conn.commit()
            return {"message": "Successfully joined community"}

@app.post("/communities/leave/{user_id}/{community_id}")
def leave_community(user_id: int, community_id: int):
    """
    Allows a user to leave a community.
    """
    with get_db_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # Check if actually joined
            cur.execute(
                "SELECT * FROM user_communities WHERE user_id = %s AND community_id = %s",
                (user_id, community_id)
            )
            if not cur.fetchone():
                raise HTTPException(status_code=400, detail="Not a member of this community")
            
            # Leave community
            cur.execute(
                "DELETE FROM user_communities WHERE user_id = %s AND community_id = %s",
                (user_id, community_id)
            )
            
            # Update member count
            cur.execute(
                "UPDATE communities SET member_count = member_count - 1 WHERE community_id = %s",
                (community_id,)
            )
            
            conn.commit()
            return {"message": "Successfully left community"}

@app.get("/community-quests/{user_id}", response_model=List[CommunityQuest])
def get_community_quests(user_id: int):
    """
    Retrieves all community quests/events for communities the user has joined.
    Only shows upcoming or current events.
    """
    with get_db_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT 
                    cq.community_quest_id,
                    cq.community_id,
                    c.community_name,
                    c.community_color,
                    c.community_icon,
                    cq.quest_name,
                    cq.quest_description,
                    cq.points_reward,
                    cq.event_date::text,
                    cq.event_end_date::text,
                    CASE WHEN ucq.completed_at IS NOT NULL THEN TRUE ELSE FALSE END as completed
                FROM community_quests cq
                JOIN communities c ON cq.community_id = c.community_id
                JOIN user_communities uc ON c.community_id = uc.community_id AND uc.user_id = %s
                LEFT JOIN user_community_quests ucq ON cq.community_quest_id = ucq.community_quest_id AND ucq.user_id = %s
                WHERE cq.is_active = TRUE 
                AND cq.event_end_date >= CURRENT_TIMESTAMP
                ORDER BY cq.event_date
            """, (user_id, user_id))
            
            quests = cur.fetchall()
            
            # Calculate time until event for each quest
            from datetime import datetime
            for quest in quests:
                event_date = datetime.fromisoformat(quest['event_date'])
                now = datetime.now(event_date.tzinfo)
                
                if event_date > now:
                    delta = event_date - now
                    days = delta.days
                    hours = delta.seconds // 3600
                    minutes = (delta.seconds % 3600) // 60
                    
                    if days > 0:
                        quest['time_until_event'] = f"{days}d {hours}h"
                    elif hours > 0:
                        quest['time_until_event'] = f"{hours}h {minutes}m"
                    else:
                        quest['time_until_event'] = f"{minutes}m"
                else:
                    # Event is happening now
                    event_end = datetime.fromisoformat(quest['event_end_date'])
                    if event_end > now:
                        quest['time_until_event'] = "LIVE NOW"
                    else:
                        quest['time_until_event'] = "Ended"
            
            return quests

@app.post("/community-quests/complete/{user_id}/{community_quest_id}")
def complete_community_quest(user_id: int, community_quest_id: int):
    """
    Marks a community quest/event as complete for a user and awards points.
    """
    with get_db_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # Get quest details
            cur.execute(
                "SELECT points_reward FROM community_quests WHERE community_quest_id = %s",
                (community_quest_id,)
            )
            quest = cur.fetchone()
            if not quest:
                raise HTTPException(status_code=404, detail="Community quest not found")
            
            # Check if already completed
            cur.execute(
                "SELECT * FROM user_community_quests WHERE user_id = %s AND community_quest_id = %s",
                (user_id, community_quest_id)
            )
            if cur.fetchone():
                raise HTTPException(status_code=400, detail="Community quest already completed")
            
            # Record completion
            cur.execute(
                "INSERT INTO user_community_quests (user_id, community_quest_id, status, completed_at) VALUES (%s, %s, 'completed', CURRENT_TIMESTAMP)",
                (user_id, community_quest_id)
            )
            
            # Update user points and weekly_points
            cur.execute(
                "UPDATE users SET points = points + %s, weekly_points = weekly_points + %s WHERE user_id = %s",
                (quest['points_reward'], quest['points_reward'], user_id)
            )
            
            conn.commit()
            return {
                "message": "Community quest completed successfully",
                "points_added": quest['points_reward']
            }

# --- Journey / Analytics Endpoints ---

@app.get("/journey/community-breakdown/{user_id}", response_model=List[CommunityPointsBreakdown])
def get_community_points_breakdown(user_id: int):
    """
    Get total points earned per community for pie chart.
    """
    with get_db_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT 
                    c.community_id,
                    c.community_name,
                    c.community_color,
                    c.community_icon,
                    COALESCE(SUM(ucph.points_earned), 0) as total_points
                FROM communities c
                LEFT JOIN user_community_points_history ucph 
                    ON c.community_id = ucph.community_id AND ucph.user_id = %s
                GROUP BY c.community_id, c.community_name, c.community_color, c.community_icon
                HAVING COALESCE(SUM(ucph.points_earned), 0) > 0
                ORDER BY total_points DESC
            """, (user_id,))
            return cur.fetchall()

@app.get("/journey/points-timeline/{user_id}", response_model=List[PointsHistoryEntry])
def get_points_timeline(user_id: int):
    """
    Get points progression over time for line chart.
    """
    with get_db_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT 
                    TO_CHAR(recorded_at, 'YYYY-MM-DD') as date,
                    total_points
                FROM user_points_history
                WHERE user_id = %s
                ORDER BY recorded_at
            """, (user_id,))
            return cur.fetchall()

@app.get("/journey/health-metrics/{user_id}", response_model=List[HealthMetric])
def get_health_metrics(user_id: int):
    """
    Get health metrics over time for progress tracking.
    """
    with get_db_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT 
                    metric_date::text,
                    weight_kg,
                    sleep_hours,
                    water_intake_ml,
                    steps,
                    workout_minutes,
                    mood_score,
                    energy_level
                FROM user_health_metrics
                WHERE user_id = %s
                ORDER BY metric_date
            """, (user_id,))
            return cur.fetchall()

@app.get("/journey/achievements/{user_id}", response_model=List[Achievement])
def get_achievements(user_id: int):
    """
    Get user achievements and milestones.
    """
    with get_db_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT 
                    achievement_title,
                    achievement_description,
                    achieved_at::text,
                    achievement_type
                FROM user_achievements
                WHERE user_id = %s
                ORDER BY achieved_at DESC
            """, (user_id,))
            return cur.fetchall()

@app.get("/journey/stats/{user_id}")
def get_journey_stats(user_id: int):
    """
    Get overall journey statistics.
    """
    with get_db_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # Get account age
            cur.execute("""
                SELECT 
                    created_at,
                    EXTRACT(DAY FROM (CURRENT_TIMESTAMP - created_at)) as days_active
                FROM users 
                WHERE user_id = %s
            """, (user_id,))
            user_data = cur.fetchone()
            
            # Get total communities joined
            cur.execute("""
                SELECT COUNT(*) as communities_joined
                FROM user_communities
                WHERE user_id = %s
            """, (user_id,))
            community_count = cur.fetchone()
            
            # Get total quests completed
            cur.execute("""
                SELECT COUNT(*) as quests_completed
                FROM user_quests
                WHERE user_id = %s AND completed_at IS NOT NULL
            """, (user_id,))
            quest_count = cur.fetchone()
            
            # Get total achievements
            cur.execute("""
                SELECT COUNT(*) as achievements_earned
                FROM user_achievements
                WHERE user_id = %s
            """, (user_id,))
            achievement_count = cur.fetchone()
            
            # Get current user stats
            cur.execute("""
                SELECT points, streak
                FROM users
                WHERE user_id = %s
            """, (user_id,))
            current_stats = cur.fetchone()
            
            return {
                "days_active": int(user_data['days_active']) if user_data else 0,
                "member_since": user_data['created_at'].isoformat() if user_data else None,
                "communities_joined": community_count['communities_joined'],
                "quests_completed": quest_count['quests_completed'],
                "achievements_earned": achievement_count['achievements_earned'],
                "total_points": current_stats['points'],
                "current_streak": current_stats['streak']
            }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
