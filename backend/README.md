# StarLife Backend API

A FastAPI-based backend with PostgreSQL database for the StarLife health and wellness application.

## Features

- **PostgreSQL Database** with 5 tables:
  - `users` - User account information
  - `rewards` - User rewards and achievements
  - `activity` - User activity tracking
  - `quests` - Available quests/challenges
  - `user_quests` - User quest progress tracking

- **RESTful API** with full CRUD operations
- **Docker Compose** setup for easy deployment
- **Automatic database initialization** with sample data

## Quick Start

### Prerequisites

- Docker and Docker Compose installed
- Ports 5432 (PostgreSQL) and 8000 (API) available

### Running with Docker

1. **Start the services:**
   ```bash
   cd /home/yajat/Documents/starlife/StarHack/backend
   docker-compose up -d
   ```

2. **Check logs:**
   ```bash
   docker-compose logs -f backend
   ```

3. **API will be available at:**
   - API: http://localhost:8000
   - API Docs: http://localhost:8000/docs
   - PostgreSQL: localhost:5432

### Stopping the services

```bash
docker-compose down
```

To remove volumes (database data):
```bash
docker-compose down -v
```

## API Endpoints

### Health Check
- `GET /health` - Check API and database health

### Users
- `POST /users` - Create a new user
- `GET /users` - Get all users
- `GET /users/{user_id}` - Get specific user
- `PUT /users/{user_id}` - Update user
- `DELETE /users/{user_id}` - Delete user

### Rewards
- `POST /rewards` - Create a reward
- `GET /rewards?user_id={id}` - Get rewards (optional user filter)
- `DELETE /rewards/{reward_id}` - Delete reward

### Activity
- `POST /activity` - Log activity
- `GET /activity?user_id={id}` - Get activities (optional user filter)
- `DELETE /activity/{activity_id}` - Delete activity

### Quests
- `POST /quests` - Create a quest
- `GET /quests?is_active={true/false}` - Get quests (optional active filter)
- `GET /quests/{quest_id}` - Get specific quest
- `PUT /quests/{quest_id}` - Update quest
- `DELETE /quests/{quest_id}` - Delete quest

### User Quests
- `POST /user-quests` - Assign quest to user
- `GET /user-quests/{user_id}` - Get user's quests
- `PUT /user-quests/{user_quest_id}` - Update quest progress

## API Documentation

Interactive API documentation is available at:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Database Schema

### users
- user_id (PK)
- username (unique)
- email (unique)
- created_at
- updated_at

### rewards
- reward_id (PK)
- user_id (FK)
- reward_name
- reward_points
- reward_type
- earned_at

### activity
- activity_id (PK)
- user_id (FK)
- activity_type
- activity_duration
- activity_date
- calories_burned
- created_at

### quests
- quest_id (PK)
- quest_name
- quest_description
- quest_type
- points_reward
- is_active
- created_at
- updated_at

### user_quests
- user_quest_id (PK)
- user_id (FK)
- quest_id (FK)
- status
- progress
- started_at
- completed_at

## Sample Data

The database is initialized with:
- 3 sample users
- 4 sample quests (Daily Steps, Water Intake, Weekly Workout, Meditation)

## Development

### Running locally without Docker

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Set up PostgreSQL and run init.sql

3. Set environment variables:
   ```bash
   export DB_HOST=localhost
   export DB_NAME=starlife_db
   export DB_USER=starlife_user
   export DB_PASSWORD=starlife_pass
   ```

4. Run the API:
   ```bash
   uvicorn crud:app --reload
   ```

## Testing the API

### Create a user:
```bash
curl -X POST "http://localhost:8000/users" \
  -H "Content-Type: application/json" \
  -d '{"username": "test_user", "email": "test@example.com"}'
```

### Get all users:
```bash
curl "http://localhost:8000/users"
```

### Create an activity:
```bash
curl -X POST "http://localhost:8000/activity" \
  -H "Content-Type: application/json" \
  -d '{"user_id": 1, "activity_type": "running", "activity_duration": 30, "calories_burned": 200}'
```

### Get quests:
```bash
curl "http://localhost:8000/quests"
```

## Environment Variables

See `.env.example` for available configuration options.

## Troubleshooting

**Port already in use:**
```bash
# Check what's using the port
sudo lsof -i :8000
sudo lsof -i :5432

# Stop conflicting services
docker-compose down
```

**Database connection issues:**
```bash
# Check if PostgreSQL is running
docker-compose ps

# View logs
docker-compose logs postgres
```

**Reset database:**
```bash
docker-compose down -v
docker-compose up -d
```
