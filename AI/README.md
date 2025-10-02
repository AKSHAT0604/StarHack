# 🤖 StarLife AI Fitness Trainer

AI-powered fitness coach using Google Gemini API for personalized motivation and quest generation.

## 🎯 Features

### 1. **Chat Endpoint** (`/chat`)
- Conversational AI fitness trainer named "Coach Star"
- Provides motivation, advice, and personalized guidance
- Context-aware responses based on user stats
- Encouraging, energetic personality

### 2. **Quest Generation Endpoint** (`/generate-quests`)
- Creates personalized fitness challenges
- Considers user's fitness level, goals, and equipment
- Adapts based on previous quest performance
- Generates SMART (Specific, Measurable, Achievable, Relevant, Time-bound) goals

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd /home/yajat/Documents/starlife/StarHack/AI
pip install -r requirements.txt
```

### 2. Get Gemini API Key

1. Go to: https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the key

### 3. Configure Environment

```bash
cp .env.example .env
nano .env
# Add your API key:
# GEMINI_API_KEY=your_actual_key_here
```

### 4. Run the Server

```bash
python fitness_trainer.py
```

Server will start at: **http://localhost:8001**

## 📡 API Endpoints

### Health Check
```bash
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "service": "StarLife AI Trainer"
}
```

---

### Chat with Trainer
```bash
POST /chat
```

**Request:**
```json
{
  "user_id": 1,
  "message": "I'm feeling unmotivated today",
  "context": {
    "steps": 5000,
    "active_minutes": 20,
    "completed_quests": 3
  }
}
```

**Response:**
```json
{
  "response": "Hey there champion! 💪 I hear you - we all have those days. But remember, you've already crushed 3 quests and walked 5000 steps! That's not nothing! Sometimes the hardest part is just starting. How about a quick 10-minute walk? Small wins lead to big victories! 🌟",
  "timestamp": "2025-10-02T14:30:00"
}
```

---

### Generate Quests
```bash
POST /generate-quests
```

**Request:**
```json
{
  "user_info": {
    "user_id": 1,
    "age": 25,
    "fitness_level": "intermediate",
    "goals": ["weight_loss", "endurance"],
    "available_time": 45,
    "equipment": ["dumbbells", "yoga_mat"],
    "health_stats": {
      "average_steps": 7500,
      "average_heart_rate": 72,
      "sleep_hours": 7
    }
  },
  "previous_quests": [
    {
      "quest_name": "5K Steps Daily",
      "difficulty": "easy",
      "completed": true,
      "completion_percentage": 100,
      "notes": "Felt great!"
    }
  ],
  "num_quests": 3
}
```

**Response:**
```json
{
  "quests": [
    {
      "title": "10K Steps Warrior",
      "description": "Level up from your previous success! Walk 10,000 steps daily for 7 days.",
      "difficulty": "medium",
      "category": "cardio",
      "target_value": 70000,
      "target_unit": "steps",
      "duration_days": 7,
      "points": 60,
      "motivational_message": "You crushed 5K, now let's conquer 10K! 🚀"
    },
    {
      "title": "Dumbbell Power Week",
      "description": "Complete 4 strength training sessions using your dumbbells this week.",
      "difficulty": "medium",
      "category": "strength",
      "target_value": 4,
      "target_unit": "sessions",
      "duration_days": 7,
      "points": 70,
      "motivational_message": "Build that strength! Every rep counts! 💪"
    },
    {
      "title": "Morning Stretch Ritual",
      "description": "Start your day with 10 minutes of yoga stretching for 5 consecutive days.",
      "difficulty": "easy",
      "category": "flexibility",
      "target_value": 5,
      "target_unit": "sessions",
      "duration_days": 5,
      "points": 40,
      "motivational_message": "Flexibility is fitness too! Feel amazing! 🧘‍♂️"
    }
  ],
  "personalized_message": "Amazing work completing your 5K quest! 🎉 Your consistency is impressive. These new challenges are designed to push you further while building on your success. With your intermediate fitness level and 45 minutes available daily, you're perfectly positioned to crush these goals!",
  "timestamp": "2025-10-02T14:30:00"
}
```

## 🧪 Testing

### Test Chat (with sample data)
```bash
curl -X POST http://localhost:8001/test-chat
```

### Test Quest Generation (with sample data)
```bash
curl -X POST http://localhost:8001/test-quests
```

### Manual Testing

**Chat:**
```bash
curl -X POST http://localhost:8001/chat \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "message": "What exercises should I do for weight loss?",
    "context": {"steps": 6000}
  }'
```

**Generate Quests:**
```bash
curl -X POST http://localhost:8001/generate-quests \
  -H "Content-Type: application/json" \
  -d '{
    "user_info": {
      "user_id": 1,
      "fitness_level": "beginner",
      "goals": ["weight_loss"],
      "available_time": 30,
      "equipment": []
    },
    "num_quests": 2
  }'
```

## 🔗 Integration with StarLife Backend

### From Frontend (React)

```javascript
// Chat with trainer
async function chatWithTrainer(message, userContext) {
  const response = await fetch('http://localhost:8001/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: userId,
      message: message,
      context: userContext  // steps, heart_rate, etc.
    })
  });
  return await response.json();
}

// Generate quests
async function generateQuests(userInfo, previousQuests) {
  const response = await fetch('http://localhost:8001/generate-quests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_info: userInfo,
      previous_quests: previousQuests,
      num_quests: 3
    })
  });
  return await response.json();
}
```

### Sync with Backend Database

```python
# After generating quests, save to backend
import requests

# Generate quests from AI
ai_response = requests.post('http://localhost:8001/generate-quests', json=request_data)
quests = ai_response.json()['quests']

# Save each quest to backend database
for quest in quests:
    requests.post('http://localhost:8000/quests', json={
        'user_id': user_id,
        'quest_name': quest['title'],
        'description': quest['description'],
        'points': quest['points'],
        'difficulty': quest['difficulty'],
        'target_value': quest['target_value'],
        'target_unit': quest['target_unit']
    })
```

## 📊 Fitness Levels

- **beginner**: New to fitness, starting journey
- **intermediate**: Regular exercise, building habits
- **advanced**: Experienced, consistent routine
- **expert**: High-level fitness enthusiast

## 🎯 Goal Types

- `weight_loss` - Lose weight, burn calories
- `muscle_gain` - Build muscle, strength training
- `endurance` - Cardio, stamina building
- `flexibility` - Stretching, yoga, mobility
- `general_health` - Overall wellness
- `stress_relief` - Mental health, mindfulness

## 🏋️ Equipment Options

- `none` - Bodyweight only
- `dumbbells` - Free weights
- `resistance_bands` - Elastic bands
- `yoga_mat` - Yoga/stretching
- `pull_up_bar` - Upper body
- `gym_access` - Full gym equipment

## 🎖️ Quest Categories

- **cardio**: Running, walking, cycling
- **strength**: Weight training, bodyweight exercises
- **flexibility**: Yoga, stretching
- **mindfulness**: Meditation, breathing, sleep
- **hybrid**: Combination of multiple types

## 🚨 Error Handling

All endpoints return proper error responses:

```json
{
  "detail": "Error: GEMINI_API_KEY not found"
}
```

Common errors:
- `500`: API key missing or invalid
- `500`: Gemini API error
- `422`: Invalid request format

## 🔧 Configuration

Edit `.env` file:

```bash
# API Key (required)
GEMINI_API_KEY=your_key_here

# Model temperature (0.0 - 1.0, higher = more creative)
MODEL_TEMPERATURE=0.7

# Max response length
MAX_OUTPUT_TOKENS=1024
```

## 📚 API Documentation

Once running, visit:
- **Swagger UI**: http://localhost:8001/docs
- **ReDoc**: http://localhost:8001/redoc

## 🐳 Docker Deployment (Optional)

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY fitness_trainer.py .
COPY .env .

EXPOSE 8001
CMD ["python", "fitness_trainer.py"]
```

Build and run:
```bash
docker build -t starlife-ai .
docker run -p 8001:8001 starlife-ai
```

## 🎯 Next Steps

1. **Get API Key**: https://makersuite.google.com/app/apikey
2. **Install dependencies**: `pip install -r requirements.txt`
3. **Add API key to `.env`**
4. **Run**: `python fitness_trainer.py`
5. **Test**: Visit http://localhost:8001/docs

## 💡 Tips

- **Chat context**: Always include recent user stats for better responses
- **Quest generation**: More previous quests = better personalization
- **Fitness level**: Be honest for appropriate difficulty
- **Equipment**: List all available equipment for better quest variety

## 🎉 Example Use Cases

### Daily Motivation
User opens app → Chat: "Good morning! Ready for today?"
→ AI responds with personalized motivation based on yesterday's activity

### Weekly Quest Generation
Every Monday → Generate 3 new quests based on:
- Last week's completed quests
- Current fitness level
- User's stated goals

### Progress Check-in
User completes quest → Chat: "I just finished my 10K steps!"
→ AI celebrates and suggests next challenge

---

**Questions? Issues?**
Check the Swagger docs at http://localhost:8001/docs or review the code comments in `fitness_trainer.py`.

🌟 **Let's get fit with AI!** 💪
