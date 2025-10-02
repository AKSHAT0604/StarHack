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
    streak: int
    last_login: date

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

# --- User and Game Data Endpoints ---

@app.get("/user/{user_id}", response_model=User)
def get_user_data(user_id: int):
    """
    Retrieves user's main data (points, streak) and updates streak if necessary.
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

            # Update last_login to today
            if last_login != today:
                 cur.execute("UPDATE users SET last_login = %s WHERE user_id = %s", (today, user_id,))

            return user

@app.get("/quests/{user_id}", response_model=List[Quest])
def get_user_quests(user_id: int):
    """
    Retrieves all active quests and marks the ones the user has completed today.
    """
    with get_db_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # This query gets all active quests and joins them with user_quests
            # to see if the current user has completed them today.
            query = """
                SELECT
                    q.quest_id,
                    q.quest_name,
                    q.quest_description,
                    q.quest_type,
                    q.points_reward,
                    CASE
                        WHEN uq.completed_at IS NOT NULL AND uq.completed_at::date = CURRENT_DATE
                        THEN TRUE
                        ELSE FALSE
                    END AS completed
                FROM quests q
                LEFT JOIN user_quests uq ON q.quest_id = uq.quest_id AND uq.user_id = %s
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
    """
    with get_db_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # Check if quest is already completed today
            cur.execute(
                "SELECT * FROM user_quests WHERE user_id = %s AND quest_id = %s AND completed_at::date = CURRENT_DATE",
                (user_id, quest_id)
            )
            if cur.fetchone():
                raise HTTPException(status_code=400, detail="Quest already completed today")

            # Get quest points
            cur.execute("SELECT points_reward, quest_type FROM quests WHERE quest_id = %s", (quest_id,))
            quest = cur.fetchone()
            if not quest:
                raise HTTPException(status_code=404, detail="Quest not found")

            # Record quest completion
            cur.execute(
                "INSERT INTO user_quests (user_id, quest_id, completed_at) VALUES (%s, %s, CURRENT_TIMESTAMP)",
                (user_id, quest_id)
            )

            # Update user points
            cur.execute(
                "UPDATE users SET points = points + %s WHERE user_id = %s",
                (quest['points_reward'], user_id)
            )

            # Update streak for daily quests
            if quest['quest_type'] == 'daily':
                cur.execute(
                    "UPDATE users SET streak = streak + 1, last_login = CURRENT_DATE WHERE user_id = %s",
                    (user_id,)
                )

            conn.commit()
            return {"message": "Quest completed successfully", "points_added": quest['points_reward']}


@app.get("/leaderboard", response_model=List[User])
def get_leaderboard():
    """
    Retrieves top 10 users sorted by points.
    """
    with get_db_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT user_id, username, points, streak, last_login FROM users ORDER BY points DESC LIMIT 10")
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

@app.post("/rewards/claim/{user_id}/{reward_id}")
def claim_reward(user_id: int, reward_id: int):
    """
    Allows a user to claim a reward, deducting the cost from their points.
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

            # Deduct points and record the claimed reward
            cur.execute("UPDATE users SET points = points - %s WHERE user_id = %s", (reward['cost'], user_id))
            cur.execute(
                "INSERT INTO user_rewards (user_id, reward_id) VALUES (%s, %s)",
                (user_id, reward_id)
            )
            conn.commit()
            return {"message": "Reward claimed successfully", "new_points": user['points'] - reward['cost']}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
