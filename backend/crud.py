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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
