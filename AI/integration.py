"""
Integration layer between AI Trainer and StarLife Backend
This bridges the AI service with your PostgreSQL database
"""

import requests
from typing import List, Dict, Any

# Service URLs
AI_SERVICE_URL = "http://localhost:8001"
BACKEND_SERVICE_URL = "http://localhost:8000"

class AITrainerIntegration:
    """Integration between AI Trainer and StarLife Backend"""
    
    def __init__(self, ai_url: str = AI_SERVICE_URL, backend_url: str = BACKEND_SERVICE_URL):
        self.ai_url = ai_url
        self.backend_url = backend_url
    
    def generate_and_save_quests(self, user_id: int) -> Dict[str, Any]:
        """
        Generate personalized quests from AI and save them to database
        
        Flow:
        1. Get user info from backend
        2. Get user's quest history from backend
        3. Call AI to generate new quests
        4. Save quests to backend database
        5. Return results
        """
        
        # Step 1: Get user info from backend
        user_response = requests.get(f"{self.backend_url}/users/{user_id}")
        if user_response.status_code != 200:
            return {"error": "User not found"}
        
        user_data = user_response.json()
        
        # Step 2: Get user's quest history
        quests_response = requests.get(f"{self.backend_url}/users/{user_id}/quests")
        previous_quests = []
        
        if quests_response.status_code == 200:
            quests_data = quests_response.json()
            previous_quests = [
                {
                    "quest_name": q.get("quest_name", ""),
                    "difficulty": q.get("difficulty", "medium"),
                    "completed": q.get("status", "") == "completed",
                    "completion_percentage": 100 if q.get("status") == "completed" else 0,
                    "notes": q.get("notes", "")
                }
                for q in quests_data[-5:]  # Last 5 quests
            ]
        
        # Step 3: Get health stats
        health_stats = {}
        health_response = requests.get(f"{self.backend_url}/health-stats/{user_id}/latest")
        if health_response.status_code == 200:
            health_data = health_response.json()
            health_stats = {
                "average_steps": health_data.get("steps", 0),
                "average_heart_rate": health_data.get("heart_rate", 70),
                "sleep_hours": health_data.get("sleep_hours", 7),
                "active_minutes": health_data.get("active_minutes", 0)
            }
        
        # Prepare AI request
        ai_request = {
            "user_info": {
                "user_id": user_id,
                "age": user_data.get("age"),
                "fitness_level": user_data.get("fitness_level", "beginner"),
                "goals": user_data.get("goals", ["general_health"]),
                "available_time": user_data.get("available_time", 30),
                "equipment": user_data.get("equipment", []),
                "health_stats": health_stats
            },
            "previous_quests": previous_quests,
            "num_quests": 3
        }
        
        # Step 4: Call AI to generate quests
        ai_response = requests.post(f"{self.ai_url}/generate-quests", json=ai_request)
        
        if ai_response.status_code != 200:
            return {"error": "Failed to generate quests", "details": ai_response.json()}
        
        ai_data = ai_response.json()
        generated_quests = ai_data["quests"]
        
        # Step 5: Save quests to backend
        saved_quests = []
        for quest in generated_quests:
            quest_payload = {
                "quest_name": quest["title"],
                "description": quest["description"],
                "points": quest["points"],
                "difficulty": quest["difficulty"],
                "category": quest["category"],
                "target_value": quest["target_value"],
                "target_unit": quest["target_unit"],
                "duration_days": quest["duration_days"]
            }
            
            # Save to backend
            save_response = requests.post(f"{self.backend_url}/quests", json=quest_payload)
            
            if save_response.status_code == 200:
                quest_id = save_response.json().get("quest_id")
                
                # Assign quest to user
                assign_response = requests.post(
                    f"{self.backend_url}/users/{user_id}/quests/{quest_id}"
                )
                
                if assign_response.status_code == 200:
                    saved_quests.append({
                        "quest_id": quest_id,
                        "quest": quest
                    })
        
        return {
            "success": True,
            "personalized_message": ai_data["personalized_message"],
            "quests": saved_quests,
            "timestamp": ai_data["timestamp"]
        }
    
    def chat_with_context(self, user_id: int, message: str) -> Dict[str, Any]:
        """
        Chat with AI trainer using context from backend
        """
        
        # Get recent health stats for context
        context = {}
        
        health_response = requests.get(f"{self.backend_url}/health-stats/{user_id}/today")
        if health_response.status_code == 200:
            health_data = health_response.json()
            context = {
                "steps": health_data.get("steps", 0),
                "heart_rate": health_data.get("heart_rate", 0),
                "active_minutes": health_data.get("active_minutes", 0),
                "calories": health_data.get("calories", 0)
            }
        
        # Get completed quests count
        quests_response = requests.get(f"{self.backend_url}/users/{user_id}/quests")
        if quests_response.status_code == 200:
            quests = quests_response.json()
            completed_count = sum(1 for q in quests if q.get("status") == "completed")
            context["completed_quests"] = completed_count
        
        # Call AI chat
        chat_request = {
            "user_id": user_id,
            "message": message,
            "context": context
        }
        
        response = requests.post(f"{self.ai_url}/chat", json=chat_request)
        
        if response.status_code == 200:
            return response.json()
        else:
            return {"error": "Chat failed", "details": response.json()}


# Example usage functions
def example_generate_weekly_quests(user_id: int):
    """Example: Generate weekly quests for a user"""
    integration = AITrainerIntegration()
    result = integration.generate_and_save_quests(user_id)
    
    if result.get("success"):
        print(f"✅ Generated {len(result['quests'])} quests for user {user_id}")
        print(f"\n💬 Coach says: {result['personalized_message']}\n")
        
        for quest_data in result["quests"]:
            quest = quest_data["quest"]
            print(f"🎯 {quest['title']}")
            print(f"   {quest['description']}")
            print(f"   Reward: {quest['points']} points\n")
    else:
        print(f"❌ Error: {result.get('error')}")

def example_chat_session(user_id: int):
    """Example: Chat session with context"""
    integration = AITrainerIntegration()
    
    # User asks for motivation
    print("User: I'm feeling tired today. Should I exercise?")
    response = integration.chat_with_context(user_id, "I'm feeling tired today. Should I exercise?")
    print(f"Coach Star: {response['response']}\n")
    
    # User asks for advice
    print("User: What's a good quick workout?")
    response = integration.chat_with_context(user_id, "What's a good quick 15-minute workout I can do right now?")
    print(f"Coach Star: {response['response']}\n")


if __name__ == "__main__":
    print("🔗 AI Trainer Integration Examples\n")
    
    # Test with user_id = 1
    USER_ID = 1
    
    print("=" * 60)
    print("Example 1: Generate Weekly Quests")
    print("=" * 60)
    example_generate_weekly_quests(USER_ID)
    
    print("\n" + "=" * 60)
    print("Example 2: Chat Session")
    print("=" * 60)
    example_chat_session(USER_ID)
