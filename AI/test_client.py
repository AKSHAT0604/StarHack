"""
Example client for testing the AI Fitness Trainer API
"""

import requests
import json

BASE_URL = "http://localhost:8001"

def test_health():
    """Test health check endpoint"""
    print("🏥 Testing health check...")
    response = requests.get(f"{BASE_URL}/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}\n")

def test_chat():
    """Test chat endpoint"""
    print("💬 Testing chat endpoint...")
    
    # Example 1: Motivation request
    request_data = {
        "user_id": 1,
        "message": "I'm feeling unmotivated today. Should I skip my workout?",
        "context": {
            "steps": 4500,
            "active_minutes": 15,
            "completed_quests": 2,
            "heart_rate": 68
        }
    }
    
    response = requests.post(f"{BASE_URL}/chat", json=request_data)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Coach Star says:\n{data['response']}\n")
    else:
        print(f"Error: {response.json()}\n")
    
    # Example 2: Exercise advice
    print("💬 Testing exercise advice...")
    request_data = {
        "user_id": 1,
        "message": "What's a good 30-minute workout I can do at home with no equipment?",
        "context": {}
    }
    
    response = requests.post(f"{BASE_URL}/chat", json=request_data)
    if response.status_code == 200:
        data = response.json()
        print(f"Coach Star says:\n{data['response']}\n")
    
    # Example 3: Progress celebration
    print("💬 Testing progress celebration...")
    request_data = {
        "user_id": 1,
        "message": "I just completed my first 10K steps in a day!",
        "context": {
            "steps": 10250,
            "completed_quests": 5
        }
    }
    
    response = requests.post(f"{BASE_URL}/chat", json=request_data)
    if response.status_code == 200:
        data = response.json()
        print(f"Coach Star says:\n{data['response']}\n")

def test_quest_generation():
    """Test quest generation endpoint"""
    print("🎯 Testing quest generation...")
    
    request_data = {
        "user_info": {
            "user_id": 1,
            "age": 28,
            "fitness_level": "intermediate",
            "goals": ["weight_loss", "endurance", "muscle_gain"],
            "available_time": 60,
            "equipment": ["dumbbells", "resistance_bands", "yoga_mat"],
            "health_stats": {
                "average_steps": 8500,
                "average_heart_rate": 70,
                "sleep_hours": 7.5,
                "active_minutes": 35
            }
        },
        "previous_quests": [
            {
                "quest_name": "5K Steps Challenge",
                "difficulty": "easy",
                "completed": True,
                "completion_percentage": 100,
                "notes": "Completed easily, ready for more!"
            },
            {
                "quest_name": "Push-up Progress",
                "difficulty": "medium",
                "completed": True,
                "completion_percentage": 100,
                "notes": "Getting stronger!"
            },
            {
                "quest_name": "Yoga Flexibility",
                "difficulty": "medium",
                "completed": False,
                "completion_percentage": 70,
                "notes": "Need more time for stretching"
            }
        ],
        "num_quests": 3
    }
    
    response = requests.post(f"{BASE_URL}/generate-quests", json=request_data)
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"\n📨 Personalized Message:\n{data['personalized_message']}\n")
        print(f"🎯 Generated {len(data['quests'])} Quests:\n")
        
        for i, quest in enumerate(data['quests'], 1):
            print(f"Quest {i}: {quest['title']}")
            print(f"  Category: {quest['category']} | Difficulty: {quest['difficulty']}")
            print(f"  Description: {quest['description']}")
            print(f"  Target: {quest['target_value']} {quest['target_unit']} in {quest['duration_days']} days")
            print(f"  Reward: {quest['points']} points")
            print(f"  💪 {quest['motivational_message']}")
            print()
    else:
        print(f"Error: {response.json()}\n")

def test_beginner_quests():
    """Test quest generation for beginner"""
    print("🎯 Testing beginner quest generation...")
    
    request_data = {
        "user_info": {
            "user_id": 2,
            "age": 35,
            "fitness_level": "beginner",
            "goals": ["general_health", "stress_relief"],
            "available_time": 20,
            "equipment": [],
            "health_stats": {
                "average_steps": 4000,
                "sleep_hours": 6
            }
        },
        "previous_quests": [],
        "num_quests": 2
    }
    
    response = requests.post(f"{BASE_URL}/generate-quests", json=request_data)
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Generated {len(data['quests'])} beginner-friendly quests")
        for quest in data['quests']:
            print(f"  - {quest['title']} ({quest['difficulty']})")
        print()

def main():
    print("🤖 StarLife AI Fitness Trainer - Test Client")
    print("=" * 60)
    print()
    
    try:
        # Test health
        test_health()
        
        # Test chat
        test_chat()
        
        # Test quest generation
        test_quest_generation()
        
        # Test beginner quests
        test_beginner_quests()
        
        print("✅ All tests completed!")
        print("\n📚 View full API docs at: http://localhost:8001/docs")
        
    except requests.exceptions.ConnectionError:
        print("❌ Error: Could not connect to API server")
        print("Make sure the server is running:")
        print("   python fitness_trainer.py")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    main()
