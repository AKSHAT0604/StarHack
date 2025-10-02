# 🌟 Community System Features

## Overview
Implemented a comprehensive community system where users can join communities and participate in special community events/quests with extra points and vibrant visual design.

## Database Schema

### New Tables Created:

1. **communities** - Stores community information
   - community_id (Primary Key)
   - community_name (Unique)
   - community_description
   - community_color (Vibrant hex colors for each community)
   - community_icon (Emoji icons)
   - member_count
   - created_at

2. **user_communities** - Many-to-many relationship
   - Links users to their joined communities
   - Tracks join date

3. **community_quests** - Community events/quests
   - Special events happening in communities
   - Event dates with start and end times
   - Higher point rewards than regular quests
   - Linked to specific communities

4. **user_community_quests** - Tracks completion
   - Records when users complete community events
   - Prevents duplicate completions

## Communities Available

1. **🏃 Running Club** (#ef4444 - Red)
   - Marathon events, fun runs, night challenges
   - 1,250 members

2. **🧘 Yoga & Mindfulness** (#8b5cf6 - Purple)
   - Sunrise yoga, meditation retreats, workshops
   - 980 members

3. **💪 Fitness Warriors** (#f59e0b - Orange)
   - HIIT bootcamp, strength challenges, CrossFit
   - 1,500 members

4. **🚴 Cycling Enthusiasts** (#10b981 - Green)
   - Coastal rides, mountain trail challenges
   - 750 members

5. **🏊 Swimming Squad** (#06b6d4 - Cyan)
   - Open water swimming, pool training
   - 600 members

6. **🥗 Nutrition & Wellness** (#ec4899 - Pink)
   - Meal prep workshops, nutrition seminars
   - 890 members

## API Endpoints

### Community Endpoints:
- `GET /communities/{user_id}` - Get all communities with join status
- `POST /communities/join/{user_id}/{community_id}` - Join a community
- `POST /communities/leave/{user_id}/{community_id}` - Leave a community

### Community Quest Endpoints:
- `GET /community-quests/{user_id}` - Get upcoming events from joined communities
- `POST /community-quests/complete/{user_id}/{community_quest_id}` - Complete an event

## Frontend Features

### Community Page (`/community`)
- **Grid Layout** displaying all available communities
- **Visual Distinction** between joined and available communities
- **Vibrant Color Coding** - Each community has its unique color scheme
- **Interactive Join/Leave** buttons
- **Member Count** display for each community
- **Emoji Icons** for visual identification

### Quests Page Updates (`/quests`)
- **Special "Community Events" Section** at the top
- **Vibrant Animated Cards** with:
  - Community badge with icon and name
  - Event timer showing countdown (e.g., "2d 19h", "LIVE NOW")
  - Event description
  - Extra points badge (200-550 points)
  - Complete button with community color
  - Completion status indicator
- **Shimmer Animation** on section header
- **Shine Effect** on card hover
- **Pulse Animation** on timer badges
- **Color-coded by community** - Each event card uses its community's color

### Design Features:
- **Gradient Backgrounds** using community colors
- **Glass-morphism Effects** with backdrop blur
- **Smooth Animations**:
  - Shimmer effect on header text
  - Shine animation on event cards
  - Pulse animation on timer badges
  - Hover scale and elevation effects
- **Responsive Design** - Works on mobile and desktop
- **Event Time Display**:
  - Shows countdown in days/hours format
  - "LIVE NOW" indicator for ongoing events
  - Special green color for live events

## User Flow

1. **Discover Communities** - Browse all available communities on `/community`
2. **Join Communities** - Click "Join Community" button
3. **View Community Events** - Navigate to `/quests` to see upcoming events
4. **Participate in Events** - Complete community events for EXTRA POINTS
5. **Earn Rewards** - Community events offer 150-550 points (vs regular 50-200)
6. **Track Progress** - See completed events marked with ✅

## Point Rewards Comparison

### Regular Quests:
- Daily: 50-100 points
- Weekly: 150-200 points
- Monthly: 300 points

### Community Events:
- **Sunrise Yoga**: 150 points
- **5K Fun Run**: 200 points
- **Meal Prep Workshop**: 250 points
- **HIIT Bootcamp**: 300 points
- **Night Run Challenge**: 300 points
- **Open Water Swim**: 350 points
- **Group Meditation Retreat**: 400 points
- **Strength Challenge Weekend**: 450 points
- **City Marathon 2025**: 500 points
- **CrossFit Competition**: 550 points

## Technical Implementation

### Backend (FastAPI):
- Pydantic models for type safety
- PostgreSQL queries with RealDictCursor
- Timezone-aware datetime handling
- Time calculation for event countdown
- Duplicate prevention with UNIQUE constraints

### Frontend (React + TypeScript):
- Fetch API for data retrieval
- useState and useEffect hooks
- Dynamic styling with inline styles
- Responsive grid layouts
- CSS animations and keyframes

### Database:
- PostgreSQL 13
- Foreign key relationships with CASCADE delete
- UNIQUE constraints for data integrity
- Timezone support with TIMESTAMP WITH TIME ZONE

## Future Enhancements

Potential additions:
- Community chat/forums
- Community leaderboards
- User profiles showing community memberships
- Community achievement badges
- Social features (invite friends)
- Event photos/gallery
- Event check-in with location verification
- Community creation by users
- Event RSVP system
- Recurring events
- Community moderators/admins

## Testing

To test the system:
1. Navigate to `/community` page
2. Join different communities
3. Go to `/quests` page to see community events appear
4. Complete a community event
5. Check points have been added
6. View leaderboard to see updated weekly points

## Notes

- Community events are filtered to show only upcoming/ongoing events
- Users only see events from communities they've joined
- Events can't be completed multiple times
- Completing community events adds to both total points and weekly points
- Event timers update in real-time (refresh page to see updated countdown)
- The "TESTING" reset button doesn't reset community quest completions (they're separate tables)

---

**Created:** October 2, 2025
**Status:** ✅ Fully Implemented and Working
