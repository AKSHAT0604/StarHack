"""
StarLife Backend - CRUD Operations
FastAPI application with PostgreSQL database operations
"""

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import date, datetime
import psycopg2
from psycopg2.extras import RealDictCursor
from contextlib import contextmanager
import os

app = FastAPI(title="StarLife API", version="1.0.0")

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database configuration
DB_CONFIG = {
    "host": os.getenv("DB_HOST", "postgres"),
    "database": os.getenv("DB_NAME", "starlife_db"),
    "user": os.getenv("DB_USER", "starlife_user"),
    "password": os.getenv("DB_PASSWORD", "starlife_pass"),
    "port": os.getenv("DB_PORT", "5432")
}

# Database connection context manager
@contextmanager
def get_db_connection():
    conn = psycopg2.connect(**DB_CONFIG)
    try:
        yield conn
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()

# Pydantic models
class UserCreate(BaseModel):
    username: str
    email: EmailStr

class UserResponse(BaseModel):
    user_id: int
    username: str
    email: str
    created_at: datetime
    updated_at: datetime

class RewardCreate(BaseModel):
    user_id: int
    reward_name: str
    reward_points: int
    reward_type: Optional[str] = None

class RewardResponse(BaseModel):
    reward_id: int
    user_id: int
    reward_name: str
    reward_points: int
    reward_type: Optional[str]
    earned_at: datetime

class ActivityCreate(BaseModel):
    user_id: int
    activity_type: str
    activity_duration: Optional[int] = None
    activity_date: Optional[date] = None
    calories_burned: Optional[int] = 0

class ActivityResponse(BaseModel):
    activity_id: int
    user_id: int
    activity_type: str
    activity_duration: Optional[int]
    activity_date: date
    calories_burned: int
    created_at: datetime

class QuestCreate(BaseModel):
    quest_name: str
    quest_description: Optional[str] = None
    quest_type: Optional[str] = None
    points_reward: int = 0
    is_active: bool = True

class QuestResponse(BaseModel):
    quest_id: int
    quest_name: str
    quest_description: Optional[str]
    quest_type: Optional[str]
    points_reward: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

class UserQuestCreate(BaseModel):
    user_id: int
    quest_id: int

class UserQuestUpdate(BaseModel):
    status: Optional[str] = None
    progress: Optional[int] = None

# Root endpoint
@app.get("/")
def read_root():
    return {
        "message": "StarLife API",
        "version": "1.0.0",
        "endpoints": {
            "users": "/users",
            "rewards": "/rewards",
            "activity": "/activity",
            "quests": "/quests"
        }
    }

# Health check
@app.get("/health")
def health_check():
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT 1")
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}

# ============= USER ENDPOINTS =============

@app.post("/users", response_model=UserResponse)
def create_user(user: UserCreate):
    """Create a new user"""
    try:
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(
                    """
                    INSERT INTO users (username, email)
                    VALUES (%s, %s)
                    RETURNING user_id, username, email, created_at, updated_at
                    """,
                    (user.username, user.email)
                )
                result = cur.fetchone()
                return result
    except psycopg2.IntegrityError:
        raise HTTPException(status_code=400, detail="Username or email already exists")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/users", response_model=List[UserResponse])
def get_users():
    """Get all users"""
    try:
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("SELECT * FROM users ORDER BY user_id")
                return cur.fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/users/{user_id}", response_model=UserResponse)
def get_user(user_id: int):
    """Get a specific user"""
    try:
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("SELECT * FROM users WHERE user_id = %s", (user_id,))
                result = cur.fetchone()
                if not result:
                    raise HTTPException(status_code=404, detail="User not found")
                return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/users/{user_id}", response_model=UserResponse)
def update_user(user_id: int, user: UserCreate):
    """Update a user"""
    try:
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(
                    """
                    UPDATE users
                    SET username = %s, email = %s
                    WHERE user_id = %s
                    RETURNING user_id, username, email, created_at, updated_at
                    """,
                    (user.username, user.email, user_id)
                )
                result = cur.fetchone()
                if not result:
                    raise HTTPException(status_code=404, detail="User not found")
                return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/users/{user_id}")
def delete_user(user_id: int):
    """Delete a user"""
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("DELETE FROM users WHERE user_id = %s RETURNING user_id", (user_id,))
                result = cur.fetchone()
                if not result:
                    raise HTTPException(status_code=404, detail="User not found")
                return {"message": "User deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============= REWARD ENDPOINTS =============

@app.post("/rewards", response_model=RewardResponse)
def create_reward(reward: RewardCreate):
    """Create a new reward"""
    try:
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(
                    """
                    INSERT INTO rewards (user_id, reward_name, reward_points, reward_type)
                    VALUES (%s, %s, %s, %s)
                    RETURNING reward_id, user_id, reward_name, reward_points, reward_type, earned_at
                    """,
                    (reward.user_id, reward.reward_name, reward.reward_points, reward.reward_type)
                )
                return cur.fetchone()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/rewards", response_model=List[RewardResponse])
def get_rewards(user_id: Optional[int] = None):
    """Get all rewards or rewards for a specific user"""
    try:
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                if user_id:
                    cur.execute("SELECT * FROM rewards WHERE user_id = %s ORDER BY earned_at DESC", (user_id,))
                else:
                    cur.execute("SELECT * FROM rewards ORDER BY earned_at DESC")
                return cur.fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/rewards/{reward_id}")
def delete_reward(reward_id: int):
    """Delete a reward"""
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("DELETE FROM rewards WHERE reward_id = %s RETURNING reward_id", (reward_id,))
                result = cur.fetchone()
                if not result:
                    raise HTTPException(status_code=404, detail="Reward not found")
                return {"message": "Reward deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============= ACTIVITY ENDPOINTS =============

@app.post("/activity", response_model=ActivityResponse)
def create_activity(activity: ActivityCreate):
    """Create a new activity"""
    try:
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(
                    """
                    INSERT INTO activity (user_id, activity_type, activity_duration, activity_date, calories_burned)
                    VALUES (%s, %s, %s, %s, %s)
                    RETURNING activity_id, user_id, activity_type, activity_duration, activity_date, calories_burned, created_at
                    """,
                    (activity.user_id, activity.activity_type, activity.activity_duration, 
                     activity.activity_date, activity.calories_burned)
                )
                return cur.fetchone()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/activity", response_model=List[ActivityResponse])
def get_activity(user_id: Optional[int] = None):
    """Get all activities or activities for a specific user"""
    try:
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                if user_id:
                    cur.execute("SELECT * FROM activity WHERE user_id = %s ORDER BY activity_date DESC", (user_id,))
                else:
                    cur.execute("SELECT * FROM activity ORDER BY activity_date DESC")
                return cur.fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/activity/{activity_id}")
def delete_activity(activity_id: int):
    """Delete an activity"""
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("DELETE FROM activity WHERE activity_id = %s RETURNING activity_id", (activity_id,))
                result = cur.fetchone()
                if not result:
                    raise HTTPException(status_code=404, detail="Activity not found")
                return {"message": "Activity deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============= QUEST ENDPOINTS =============

@app.post("/quests", response_model=QuestResponse)
def create_quest(quest: QuestCreate):
    """Create a new quest"""
    try:
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(
                    """
                    INSERT INTO quests (quest_name, quest_description, quest_type, points_reward, is_active)
                    VALUES (%s, %s, %s, %s, %s)
                    RETURNING quest_id, quest_name, quest_description, quest_type, points_reward, is_active, created_at, updated_at
                    """,
                    (quest.quest_name, quest.quest_description, quest.quest_type, quest.points_reward, quest.is_active)
                )
                return cur.fetchone()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/quests", response_model=List[QuestResponse])
def get_quests(is_active: Optional[bool] = None):
    """Get all quests or only active quests"""
    try:
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                if is_active is not None:
                    cur.execute("SELECT * FROM quests WHERE is_active = %s ORDER BY quest_id", (is_active,))
                else:
                    cur.execute("SELECT * FROM quests ORDER BY quest_id")
                return cur.fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/quests/{quest_id}", response_model=QuestResponse)
def get_quest(quest_id: int):
    """Get a specific quest"""
    try:
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("SELECT * FROM quests WHERE quest_id = %s", (quest_id,))
                result = cur.fetchone()
                if not result:
                    raise HTTPException(status_code=404, detail="Quest not found")
                return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/quests/{quest_id}", response_model=QuestResponse)
def update_quest(quest_id: int, quest: QuestCreate):
    """Update a quest"""
    try:
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(
                    """
                    UPDATE quests
                    SET quest_name = %s, quest_description = %s, quest_type = %s, 
                        points_reward = %s, is_active = %s
                    WHERE quest_id = %s
                    RETURNING quest_id, quest_name, quest_description, quest_type, points_reward, is_active, created_at, updated_at
                    """,
                    (quest.quest_name, quest.quest_description, quest.quest_type, 
                     quest.points_reward, quest.is_active, quest_id)
                )
                result = cur.fetchone()
                if not result:
                    raise HTTPException(status_code=404, detail="Quest not found")
                return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/quests/{quest_id}")
def delete_quest(quest_id: int):
    """Delete a quest"""
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("DELETE FROM quests WHERE quest_id = %s RETURNING quest_id", (quest_id,))
                result = cur.fetchone()
                if not result:
                    raise HTTPException(status_code=404, detail="Quest not found")
                return {"message": "Quest deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============= USER QUEST ENDPOINTS =============

@app.post("/user-quests")
def assign_quest_to_user(user_quest: UserQuestCreate):
    """Assign a quest to a user"""
    try:
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(
                    """
                    INSERT INTO user_quests (user_id, quest_id)
                    VALUES (%s, %s)
                    RETURNING user_quest_id, user_id, quest_id, status, progress, started_at
                    """,
                    (user_quest.user_id, user_quest.quest_id)
                )
                return cur.fetchone()
    except psycopg2.IntegrityError:
        raise HTTPException(status_code=400, detail="Quest already assigned to user")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/user-quests/{user_id}")
def get_user_quests(user_id: int):
    """Get all quests for a specific user"""
    try:
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(
                    """
                    SELECT uq.*, q.quest_name, q.quest_description, q.points_reward
                    FROM user_quests uq
                    JOIN quests q ON uq.quest_id = q.quest_id
                    WHERE uq.user_id = %s
                    ORDER BY uq.started_at DESC
                    """,
                    (user_id,)
                )
                return cur.fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/user-quests/{user_quest_id}")
def update_user_quest(user_quest_id: int, update: UserQuestUpdate):
    """Update user quest progress"""
    try:
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                updates = []
                values = []
                
                if update.status:
                    updates.append("status = %s")
                    values.append(update.status)
                    if update.status == "completed":
                        updates.append("completed_at = CURRENT_TIMESTAMP")
                
                if update.progress is not None:
                    updates.append("progress = %s")
                    values.append(update.progress)
                
                if not updates:
                    raise HTTPException(status_code=400, detail="No updates provided")
                
                values.append(user_quest_id)
                query = f"UPDATE user_quests SET {', '.join(updates)} WHERE user_quest_id = %s RETURNING *"
                
                cur.execute(query, values)
                result = cur.fetchone()
                if not result:
                    raise HTTPException(status_code=404, detail="User quest not found")
                return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
