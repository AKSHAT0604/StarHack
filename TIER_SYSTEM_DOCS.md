# 🏆 Tier System & Premium Store Implementation

## Overview
Implemented a comprehensive **streak-based tier system** with an integrated premium store offering wellness services, insurance products, and premium features. Higher streaks unlock better tiers with increasing discounts on all purchases.

---

## 🎯 Tier System

### Tier Levels & Benefits

| Tier | Streak Required | Discount | Icon | Color |
|------|----------------|----------|------|-------|
| **Bronze** | 0-6 days | 0% | 🥉 | #CD7F32 |
| **Silver** | 7-29 days | 5% | 🥈 | #C0C0C0 |
| **Gold** | 30-89 days | 10% | 🥇 | #FFD700 |
| **Platinum** | 90-179 days | 15% | 💎 | #E5E4E2 |
| **Diamond** | 180+ days | 20% | 💠 | #B9F2FF |

### How It Works
1. **Automatic Tier Calculation**: User tier is automatically calculated based on their current streak
2. **Real-time Updates**: Tier updates immediately when streak changes
3. **Progressive Rewards**: Longer streaks = Better discounts = More savings
4. **Motivation System**: Encourages daily engagement to maintain and improve tier

---

## 🛒 Premium Store

### Product Categories

#### 1. **Wellness Services** 🥗💪🧘
Services to improve physical and mental health:

- **Nutritionist Consultations**
  - 30-minute session: ₹1,500
  - 60-minute with meal plan: ₹2,500

- **Personal Training**
  - Single session: ₹1,000
  - 10-session package: ₹8,500

- **Yoga Classes**
  - Single class: ₹500
  - Monthly unlimited: ₹3,000

- **Gym Memberships**
  - Monthly: ₹2,000
  - Quarterly: ₹5,500
  - Yearly: ₹18,000

- **Mental Health**
  - Counseling session (60 min): ₹2,000

- **Health Checkups**
  - Basic screening: ₹1,500
  - Comprehensive diagnostic: ₹5,000

#### 2. **Insurance Products** 🏥💼🛡️
Health and life insurance coverage:

- **Health Insurance**
  - Basic (5 Lakh cover): ₹8,000/year
  - Premium (10 Lakh cover): ₹15,000/year

- **Life Insurance**
  - Term (50 Lakh cover): ₹10,000/year

- **Accidental Insurance**: ₹3,000/year

- **Critical Illness Rider**: ₹5,000/year

#### 3. **Premium Features** ⭐🔥👨‍⚕️
App enhancements and special features:

- **Streak Freeze**: ₹50
  - One-time use to save streak from breaking
  - Prevents streak loss on missed day
  - Essential for maintaining tier

- **Premium Membership**
  - Monthly: ₹299
  - Yearly: ₹2,999
  - Benefits: Ad-free, exclusive quests, priority support

- **VIP Coach Access**: ₹999
  - Direct chat with wellness coaches

---

## 🔥 Streak Freeze System

### What is Streak Freeze?
A special feature that **protects your streak** if you miss a day of completing daily quests.

### How It Works
1. **Purchase**: Buy Streak Freeze from store for ₹50
2. **Activation**: When you're about to lose your streak (missed daily quests), the freeze activates automatically
3. **Protection**: Your streak is maintained for that day
4. **Consumption**: Streak Freeze is used up and must be purchased again

### Benefits
- **Tier Protection**: Maintain your hard-earned tier
- **Discount Retention**: Keep your tier discount benefits
- **Peace of Mind**: Travel, sick days, or busy schedules won't reset progress
- **Motivation**: Encourages long-term engagement

### Strategic Use
- **Before Travel**: Buy before going on vacation
- **Busy Periods**: Protect streak during exams/work deadlines
- **Insurance**: Safety net for unexpected situations

---

## 💰 Pricing & Discounts

### Example Savings

#### Gym Membership (Yearly) - ₹18,000 base price

| Tier | Discount | Final Price | Savings |
|------|----------|-------------|---------|
| Bronze | 0% | ₹18,000 | ₹0 |
| Silver | 5% | ₹17,100 | ₹900 |
| Gold | 10% | ₹16,200 | ₹1,800 |
| Platinum | 15% | ₹15,300 | ₹2,700 |
| Diamond | 20% | ₹14,400 | ₹3,600 |

#### Health Insurance (Premium) - ₹15,000 base price

| Tier | Discount | Final Price | Savings |
|------|----------|-------------|---------|
| Bronze | 0% | ₹15,000 | ₹0 |
| Silver | 5% | ₹14,250 | ₹750 |
| Gold | 10% | ₹13,500 | ₹1,500 |
| Platinum | 15% | ₹12,750 | ₹2,250 |
| Diamond | 20% | ₹12,000 | ₹3,000 |

### Annual Savings Potential (Diamond Tier)
If a Diamond tier user purchases:
- Gym Membership (Yearly): Save ₹3,600
- Health Insurance (Premium): Save ₹3,000
- Personal Trainer (10 sessions): Save ₹1,700
- **Total Annual Savings: ₹8,300**

---

## 🗄️ Database Schema

### New Tables

#### 1. **users** (Updated)
Added tier-related fields:
```sql
tier VARCHAR(20) DEFAULT 'Bronze'
streak_freeze_available BOOLEAN DEFAULT FALSE
```

#### 2. **store_products**
```sql
CREATE TABLE store_products (
    product_id SERIAL PRIMARY KEY,
    product_name VARCHAR(200) NOT NULL,
    product_description TEXT,
    product_category VARCHAR(50),
    base_price DECIMAL(10,2) NOT NULL,
    product_icon VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE
);
```

#### 3. **user_purchases**
Tracks all purchases with discount information:
```sql
CREATE TABLE user_purchases (
    purchase_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    product_id INTEGER REFERENCES store_products(product_id),
    original_price DECIMAL(10,2),
    discount_applied DECIMAL(5,2),
    final_price DECIMAL(10,2),
    user_tier VARCHAR(20),
    purchase_date TIMESTAMP WITH TIME ZONE
);
```

#### 4. **tier_benefits**
Reference table for tier information:
```sql
CREATE TABLE tier_benefits (
    tier_id SERIAL PRIMARY KEY,
    tier_name VARCHAR(20) UNIQUE,
    min_streak INTEGER,
    max_streak INTEGER,
    discount_percentage DECIMAL(5,2),
    tier_color VARCHAR(20),
    tier_icon VARCHAR(10)
);
```

---

## 🔌 API Endpoints

### Tier Endpoints

#### `GET /user/{user_id}/tier`
Get user's current tier information.

**Response:**
```json
{
  "tier_name": "Gold",
  "min_streak": 30,
  "max_streak": 89,
  "discount_percentage": 10.0,
  "tier_color": "#FFD700",
  "tier_icon": "🥇",
  "current_streak": 45,
  "next_tier": "Platinum",
  "streaks_to_next_tier": 45
}
```

### Store Endpoints

#### `GET /store/products/{user_id}`
Get all products with user-specific discounted prices.

**Response:**
```json
[
  {
    "product_id": 1,
    "product_name": "Nutritionist Consultation (30 min)",
    "product_description": "One-on-one session with certified nutritionist",
    "product_category": "wellness",
    "base_price": 1500.00,
    "discounted_price": 1350.00,
    "discount_percentage": 10.0,
    "product_icon": "🥗"
  }
]
```

#### `POST /store/purchase/{user_id}`
Purchase a product.

**Request:**
```json
{
  "product_id": 18
}
```

**Response:**
```json
{
  "success": true,
  "purchase_id": 123,
  "product_name": "Streak Freeze",
  "original_price": 50.00,
  "discount_applied": 10.0,
  "final_price": 45.00,
  "message": "Successfully purchased Streak Freeze!"
}
```

#### `POST /user/{user_id}/use-streak-freeze`
Use streak freeze to protect streak.

**Response:**
```json
{
  "success": true,
  "message": "Streak Freeze used! Your streak is protected.",
  "current_streak": 45
}
```

#### `GET /user/{user_id}/purchases`
Get purchase history.

**Response:**
```json
[
  {
    "purchase_id": 123,
    "product_name": "Streak Freeze",
    "product_category": "premium_feature",
    "original_price": 50.00,
    "discount_applied": 10.0,
    "final_price": 45.00,
    "user_tier": "Gold",
    "purchase_date": "2025-10-02T10:30:00Z"
  }
]
```

---

## 🎨 Frontend Features

### Store Page (`/store`)

#### Tier Banner
- Displays current tier with color-coded badge
- Shows streak count and discount percentage
- Progress indicator to next tier
- Streak Freeze status indicator

#### Product Categories
- Filter products by category
- Visual categorization with colored borders:
  - Wellness: Green (#10b981)
  - Insurance: Blue (#3b82f6)
  - Premium Features: Orange (#f59e0b)

#### Product Cards
- Large product icons
- Clear pricing display:
  - Original price (strikethrough if discount)
  - Discounted price (prominent)
  - Savings amount in green
- Purchase button with loading state
- Hover effects and animations

#### Tier Benefits Display
- Visual grid showing all 5 tiers
- Color-coded cards matching tier colors
- Streak requirements and discount percentages
- Helps users understand progression

#### Purchase History
- Chronological list of past purchases
- Shows tier at time of purchase
- Displays savings achieved
- Professional transaction record

---

## 🎯 Gamification Psychology

### Behavioral Triggers

1. **Loss Aversion**
   - Fear of losing streak motivates daily engagement
   - Streak Freeze provides safety net (reduces anxiety)
   - Tier demotion risk if streak breaks

2. **Progress Mechanic**
   - Clear path from Bronze → Diamond
   - Visible progress toward next tier
   - Immediate feedback on discount benefits

3. **Status Symbol**
   - Tier badge displayed prominently
   - Public tier display (future: leaderboards by tier)
   - Exclusive benefits for higher tiers

4. **Sunk Cost Fallacy**
   - Investment in maintaining streak
   - Reluctance to lose accumulated progress
   - Incentive to purchase Streak Freeze

5. **Variable Rewards**
   - Different discount amounts create surprise
   - Savings vary based on purchase
   - Encourages exploring all product categories

---

## 💡 Business Model Integration

### Revenue Streams

1. **Wellness Services** (Referral/Commission)
   - Partner with gyms, nutritionists, trainers
   - Earn 10-20% commission on bookings
   - Platform fee on transactions

2. **Insurance Products** (Lead Generation)
   - Insurance partner commissions
   - High-value conversions
   - Recurring annual renewals

3. **Premium Features** (Direct Revenue)
   - Streak Freeze: Microtransaction (₹50)
   - Premium Membership: Recurring (₹299/month)
   - VIP Access: High-value feature (₹999)

### User Acquisition Impact

1. **Increased DAU**
   - Daily check-ins to maintain streak
   - Fear of tier loss drives engagement

2. **Improved Retention**
   - Long-term commitment (180 days for Diamond)
   - Investment in streak protection
   - Discount benefits incentivize staying

3. **Viral Growth**
   - Word-of-mouth about tier benefits
   - Social proof of savings
   - Competitive streak comparison

---

## 📊 Success Metrics

### KPIs to Track

1. **Tier Distribution**
   - % users in each tier
   - Average time to reach Gold
   - Diamond tier retention rate

2. **Purchase Metrics**
   - Conversion rate by tier
   - Average order value by tier
   - Streak Freeze purchase frequency

3. **Engagement Metrics**
   - Daily active users (DAU)
   - Streak maintenance rate
   - Average streak length

4. **Revenue Metrics**
   - Revenue per user by tier
   - Discount impact on conversion
   - Lifetime value by tier

---

## 🚀 Future Enhancements

### Phase 2 Features

1. **Tier-Exclusive Benefits**
   - Gold+: Early access to new features
   - Platinum+: Priority customer support
   - Diamond: Personalized wellness coach

2. **Social Features**
   - Tier leaderboards
   - Tier badges on profile
   - Gift Streak Freeze to friends

3. **Gamification**
   - Tier achievement badges
   - Streak milestone rewards
   - Tier-up celebration animations

4. **Partnerships**
   - Exclusive Gold+ gym partnerships
   - Diamond-only events
   - Premium brand collaborations

5. **Analytics**
   - Personal ROI calculator
   - Savings tracker dashboard
   - Spending insights by category

---

## 🧪 Testing Instructions

### Test Tier System
1. Complete daily quests to increase streak
2. Navigate to `/store` to see tier info
3. Observe discount calculation on products
4. Check tier progression indicators

### Test Purchases
1. Select a product from store
2. Confirm purchase dialog
3. Verify discount applied correctly
4. Check purchase history

### Test Streak Freeze
1. Purchase "Streak Freeze" from store (₹50)
2. User record updated with `streak_freeze_available = TRUE`
3. Miss daily quests the next day
4. Use `/user/{user_id}/use-streak-freeze` endpoint
5. Streak maintained, freeze consumed

### Test Different Tiers
Update user streak in database to test each tier:
```sql
-- Silver tier
UPDATE users SET streak = 15 WHERE user_id = 1;

-- Gold tier
UPDATE users SET streak = 50 WHERE user_id = 1;

-- Platinum tier
UPDATE users SET streak = 120 WHERE user_id = 1;

-- Diamond tier
UPDATE users SET streak = 200 WHERE user_id = 1;
```

---

## 📝 Notes

- All prices in Indian Rupees (₹)
- Discounts calculated in real-time based on current streak
- Tier auto-updates when streak changes
- Purchase history includes tier at time of purchase
- Streak Freeze is one-time use (must repurchase)
- Insurance products require annual renewal
- Wellness services bookable through integrated calendar (future)

---

**Created:** October 2, 2025  
**Status:** ✅ Fully Implemented  
**Impact:** Addresses insurance gamification, monetization, and long-term retention
