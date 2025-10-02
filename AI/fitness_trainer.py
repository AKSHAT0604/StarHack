"""
Gemini AI Fitness Trainer API
Endpoints for chat and quest generation
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import google.generativeai as genai
import os
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not found in environment variables")

genai.configure(api_key=GEMINI_API_KEY)

# Initialize FastAPI app
app = FastAPI(title="StarLife AI Fitness Trainer", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# System prompts
FITNESS_TRAINER_PROMPT = """You are an enthusiastic, motivating, and knowledgeable fitness trainer named Coach Natalia. 
Your personality:
- Energetic and positive, always encouraging users
- Use motivational language and emojis appropriately
- Personalize advice based on user's fitness level and goals
- Be supportive but also challenge users to push their limits
- Celebrate achievements, no matter how small
- Provide practical, safe fitness advice
- Keep responses concise but impactful (2-3 sentences usually)

Your expertise:
- Exercise routines and proper form
- Nutrition basics and healthy eating
- Goal setting and motivation
- Progress tracking and accountability
- Injury prevention and recovery

Remember: You're not just giving information, you're being a supportive coach and cheerleader!"""

QUEST_GENERATOR_PROMPT = """You are a creative fitness quest designer for the StarLife app.
Your role is to create engaging, achievable fitness quests (challenges) based on:
- User's current fitness level
- Previous quest performance
- User's goals and preferences
- Progressive difficulty

Quest Guidelines:
- Make quests specific, measurable, achievable, relevant, and time-bound (SMART)
- Include variety: cardio, strength, flexibility, mindfulness
- Balance challenge with achievability
- Consider user's available time and resources
- Make quests engaging and fun, not just boring exercises

Quest difficulty levels:
- Easy: Suitable for beginners, low impact
- Medium: Moderate intensity, requires some fitness
- Hard: High intensity, for experienced users
- Expert: Advanced challenges for fitness enthusiasts"""

# Models
class ChatRequest(BaseModel):
    user_id: int
    message: str
    context: Optional[Dict[str, Any]] = None  # Optional user stats, recent activity, etc.

class ChatResponse(BaseModel):
    response: str
    timestamp: str

class PreviousQuest(BaseModel):
    quest_name: str
    difficulty: str
    completed: bool
    completion_percentage: Optional[int] = None
    notes: Optional[str] = None

class UserInfo(BaseModel):
    user_id: int
    age: Optional[int] = None
    fitness_level: str  # beginner, intermediate, advanced, expert
    goals: List[str]  # weight_loss, muscle_gain, endurance, flexibility, etc.
    available_time: Optional[int] = None  # minutes per day
    equipment: List[str] = []  # available equipment: none, dumbbells, resistance_bands, etc.
    health_stats: Optional[Dict[str, Any]] = None  # steps, heart_rate, sleep, etc.

class QuestGenerationRequest(BaseModel):
    user_info: UserInfo
    previous_quests: Optional[List[PreviousQuest]] = []
    num_quests: int = 3  # Number of quests to generate

class Quest(BaseModel):
    title: str
    description: str
    difficulty: str
    category: str  # cardio, strength, flexibility, mindfulness, hybrid
    target_value: int  # target steps, reps, minutes, etc.
    target_unit: str  # steps, reps, minutes, sessions
    duration_days: int  # how many days to complete
    points: int  # reward points
    motivational_message: str

class QuestGenerationResponse(BaseModel):
    quests: List[Quest]
    personalized_message: str
    timestamp: str

# Initialize Gemini models
chat_model = genai.GenerativeModel('gemini-2.0-flash')
quest_model = genai.GenerativeModel('gemini-2.0-flash')

# Health check
@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "StarLife AI Trainer"}

# Chat endpoint
@app.post("/chat", response_model=ChatResponse)
async def chat_with_trainer(request: ChatRequest):
    """
    Chat with AI fitness trainer
    Provides motivation, advice, and personalized fitness guidance
    """
    try:
        # Build context for the AI
        context_info = ""
        if request.context:
            context_info = f"\n\nUser context:\n"
            if "steps" in request.context:
                context_info += f"- Recent steps: {request.context['steps']}\n"
            if "heart_rate" in request.context:
                context_info += f"- Heart rate: {request.context['heart_rate']} bpm\n"
            if "active_minutes" in request.context:
                context_info += f"- Active minutes today: {request.context['active_minutes']}\n"
            if "completed_quests" in request.context:
                context_info += f"- Completed quests this week: {request.context['completed_quests']}\n"
        
        # Create prompt
        full_prompt = f"""{FITNESS_TRAINER_PROMPT}
        {context_info}
        
User message: {request.message}

Respond as Coach Star, their personal fitness trainer. Be encouraging, specific, and actionable."""

        # Generate response
        response = chat_model.generate_content(full_prompt)
        
        if not response or not response.text:
            raise HTTPException(status_code=500, detail="Failed to generate response")
        
        return ChatResponse(
            response=response.text,
            timestamp=datetime.now().isoformat()
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

# Quest generation endpoint
@app.post("/generate-quests", response_model=QuestGenerationResponse)
async def generate_quests(request: QuestGenerationRequest):
    """
    Generate personalized fitness quests based on user info and history
    """
    try:
        user_info = request.user_info
        previous_quests = request.previous_quests or []
        
        # Build user profile for AI
        user_profile = f"""
User Profile:
- User ID: {user_info.user_id}
- Age: {user_info.age or 'Not specified'}
- Fitness Level: {user_info.fitness_level}
- Goals: {', '.join(user_info.goals)}
- Available Time: {user_info.available_time or 'Not specified'} minutes/day
- Equipment: {', '.join(user_info.equipment) if user_info.equipment else 'None'}
"""
        
        if user_info.health_stats:
            user_profile += f"\nRecent Health Stats:\n"
            for key, value in user_info.health_stats.items():
                user_profile += f"- {key}: {value}\n"
        
        # Build previous quest history
        quest_history = ""
        if previous_quests:
            quest_history = "\n\nPrevious Quest Performance:\n"
            for quest in previous_quests:
                status = "✅ Completed" if quest.completed else f"⏸️ {quest.completion_percentage}% completed"
                quest_history += f"- {quest.quest_name} ({quest.difficulty}): {status}\n"
                if quest.notes:
                    quest_history += f"  Notes: {quest.notes}\n"
        
        # Create quest generation prompt
        quest_prompt = f"""{QUEST_GENERATOR_PROMPT}

{user_profile}
{quest_history}

Generate {request.num_quests} personalized fitness quests for this user.

For EACH quest, provide the following in a structured format:
1. Title: (catchy, motivating title)
2. Description: (clear explanation of what to do)
3. Difficulty: (easy/medium/hard/expert based on user level)
4. Category: (cardio/strength/flexibility/mindfulness/hybrid)
5. Target Value: (specific number)
6. Target Unit: (steps/reps/minutes/sessions/etc)
7. Duration Days: (how many days to complete, typically 1-7)
8. Points: (reward points: easy=10-30, medium=40-70, hard=80-120, expert=130-200)
9. Motivational Message: (encouraging message for this specific quest)

Also include a personalized message for the user about their progress and these new quests.

Format your response EXACTLY like this:
QUEST 1:
Title: [title]
Description: [description]
Difficulty: [difficulty]
Category: [category]
Target Value: [number]
Target Unit: [unit]
Duration Days: [days]
Points: [points]
Motivational Message: [message]

QUEST 2:
[same format]

...

PERSONALIZED MESSAGE:
[Your encouraging message to the user about their progress and new quests]
"""

        # Generate quests
        response = quest_model.generate_content(quest_prompt)
        
        if not response or not response.text:
            raise HTTPException(status_code=500, detail="Failed to generate quests")
        
        # Parse response
        quests = parse_quest_response(response.text)
        personalized_msg = extract_personalized_message(response.text)
        
        if not quests:
            raise HTTPException(status_code=500, detail="Failed to parse quest response")
        
        return QuestGenerationResponse(
            quests=quests,
            personalized_message=personalized_msg,
            timestamp=datetime.now().isoformat()
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

def parse_quest_response(response_text: str) -> List[Quest]:
    """Parse the AI response into Quest objects"""
    quests = []
    
    try:
        # Split by QUEST markers
        quest_blocks = response_text.split("QUEST ")[1:]  # Skip first empty split
        
        for block in quest_blocks:
            if "PERSONALIZED MESSAGE" in block:
                block = block.split("PERSONALIZED MESSAGE")[0]
            
            lines = block.strip().split('\n')
            quest_data = {}
            
            for line in lines:
                line = line.strip()
                if ':' in line:
                    key, value = line.split(':', 1)
                    key = key.strip().lower().replace(' ', '_')
                    value = value.strip()
                    quest_data[key] = value
            
            if 'title' in quest_data and 'description' in quest_data:
                quest = Quest(
                    title=quest_data.get('title', 'Fitness Challenge'),
                    description=quest_data.get('description', ''),
                    difficulty=quest_data.get('difficulty', 'medium').lower(),
                    category=quest_data.get('category', 'hybrid').lower(),
                    target_value=int(quest_data.get('target_value', 1)),
                    target_unit=quest_data.get('target_unit', 'sessions'),
                    duration_days=int(quest_data.get('duration_days', 7)),
                    points=int(quest_data.get('points', 50)),
                    motivational_message=quest_data.get('motivational_message', 'You got this! 💪')
                )
                quests.append(quest)
        
    except Exception as e:
        print(f"Error parsing quest response: {e}")
        # Return default quests if parsing fails
        quests = get_default_quests()
    
    return quests

def extract_personalized_message(response_text: str) -> str:
    """Extract personalized message from AI response"""
    try:
        if "PERSONALIZED MESSAGE:" in response_text:
            msg = response_text.split("PERSONALIZED MESSAGE:")[1].strip()
            return msg
        else:
            return "Great job on your fitness journey! These new quests are designed just for you. Let's crush them together! 💪🔥"
    except:
        return "Keep up the great work! Your new quests are ready. Let's make progress together! 🌟"

def get_default_quests() -> List[Quest]:
    """Fallback quests if AI generation fails"""
    return [
        Quest(
            title="10K Steps Daily",
            description="Walk or run 10,000 steps every day this week",
            difficulty="easy",
            category="cardio",
            target_value=70000,
            target_unit="steps",
            duration_days=7,
            points=50,
            motivational_message="Every step counts! Let's get moving! 🚶‍♂️"
        ),
        Quest(
            title="Hydration Hero",
            description="Drink 8 glasses of water daily for 5 days",
            difficulty="easy",
            category="mindfulness",
            target_value=5,
            target_unit="days",
            duration_days=5,
            points=30,
            motivational_message="Stay hydrated, stay healthy! 💧"
        ),
        Quest(
            title="Strength Builder",
            description="Complete 3 strength training sessions this week",
            difficulty="medium",
            category="strength",
            target_value=3,
            target_unit="sessions",
            duration_days=7,
            points=60,
            motivational_message="Build that strength! You're stronger than you think! 💪"
        )
    ]

# Example endpoint to test with sample data
@app.post("/test-chat")
async def test_chat():
    """Test endpoint with sample data"""
    request = ChatRequest(
        user_id=1,
        message="I'm feeling tired today, should I skip my workout?",
        context={
            "steps": 3500,
            "active_minutes": 15,
            "completed_quests": 2
        }
    )
    return await chat_with_trainer(request)

@app.post("/test-quests")
async def test_quests():
    """Test endpoint for quest generation"""
    request = QuestGenerationRequest(
        user_info=UserInfo(
            user_id=1,
            age=25,
            fitness_level="intermediate",
            goals=["weight_loss", "endurance"],
            available_time=45,
            equipment=["dumbbells", "yoga_mat"],
            health_stats={
                "average_steps": 7500,
                "average_heart_rate": 72,
                "sleep_hours": 7
            }
        ),
        previous_quests=[
            PreviousQuest(
                quest_name="5K Steps Daily",
                difficulty="easy",
                completed=True,
                completion_percentage=100,
                notes="Felt great!"
            ),
            PreviousQuest(
                quest_name="20 Push-ups Challenge",
                difficulty="medium",
                completed=False,
                completion_percentage=60,
                notes="Need to work on upper body strength"
            )
        ],
        num_quests=3
    )
    return await generate_quests(request)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
