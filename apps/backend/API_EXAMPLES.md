# SAKHI Backend API Examples

Base URL: https://your-backend.example.com

Note: Both plain and namespaced routes are supported.
- Plain: /signup, /login, /cycle, /daily-logs, /prediction
- Namespaced: /api/auth/signup, /api/auth/login, /api/cycle, /api/daily-logs, /api/prediction

## 1) Signup
POST /signup

Request body:
```json
{
  "name": "Ananya",
  "email": "ananya@example.com",
  "password": "secret123",
  "age": 24,
  "weight": 58.5,
  "height": 162,
  "lifestyle": "active"
}
```

Success response (201):
```json
{
  "message": "Signup successful.",
  "user": {
    "id": 1,
    "name": "Ananya",
    "email": "ananya@example.com",
    "age": 24,
    "weight": 58.5,
    "height": 162,
    "lifestyle": "active",
    "created_at": "2026-04-08T11:20:47.263Z"
  }
}
```

## 2) Login
POST /login

Request body:
```json
{
  "email": "ananya@example.com",
  "password": "secret123"
}
```

Success response (200):
```json
{
  "message": "Login successful.",
  "token": "<jwt_token>",
  "user": {
    "id": 1,
    "name": "Ananya",
    "email": "ananya@example.com",
    "age": 24,
    "weight": 58.5,
    "height": 162,
    "lifestyle": "active",
    "created_at": "2026-04-08T11:20:47.263Z"
  }
}
```

## 3) Add Cycle Entry
POST /cycle
Header: `Authorization: Bearer <jwt_token>`

Request body:
```json
{
  "period_start_date": "2026-04-01",
  "period_end_date": "2026-04-05",
  "cycle_length": 28,
  "flow_intensity": "medium"
}
```

Success response (201):
```json
{
  "message": "Cycle entry added successfully.",
  "entry": {
    "id": 1,
    "user_id": 1,
    "period_start_date": "2026-04-01",
    "period_end_date": "2026-04-05",
    "cycle_length": 28,
    "flow_intensity": "medium",
    "created_at": "2026-04-08T11:21:27.263Z"
  }
}
```

## 4) Get Cycle History
GET /cycle
Header: `Authorization: Bearer <jwt_token>`

Success response (200):
```json
{
  "entries": [
    {
      "id": 2,
      "user_id": 1,
      "period_start_date": "2026-04-29",
      "period_end_date": "2026-05-03",
      "cycle_length": 28,
      "flow_intensity": "light",
      "created_at": "2026-05-03T11:25:12.901Z"
    },
    {
      "id": 1,
      "user_id": 1,
      "period_start_date": "2026-04-01",
      "period_end_date": "2026-04-05",
      "cycle_length": 28,
      "flow_intensity": "medium",
      "created_at": "2026-04-08T11:21:27.263Z"
    }
  ]
}
```

## 5) Add Daily Log
POST /daily-logs
Header: `Authorization: Bearer <jwt_token>`

Request body:
```json
{
  "log_date": "2026-05-10",
  "mood": "irritated",
  "energy_level": 2,
  "stress_level": 4,
  "sleep_hours": 6.5,
  "cramps": true,
  "headache": false,
  "fatigue": true,
  "bloating": true,
  "water_intake": 1.8,
  "exercise_done": false,
  "notes": "Mild cramps today"
}
```

Success response (201):
```json
{
  "message": "Daily log saved successfully.",
  "entry": {
    "id": 12,
    "user_id": 1,
    "log_date": "2026-05-10",
    "mood": "irritated",
    "energy_level": 2,
    "stress_level": 4,
    "sleep_hours": 6.5,
    "cramps": true,
    "headache": false,
    "fatigue": true,
    "bloating": true,
    "water_intake": 1.8,
    "exercise_done": false,
    "notes": "Mild cramps today",
    "created_at": "2026-05-10T12:01:02.202Z"
  }
}
```

## 6) Get Daily Logs
GET /daily-logs?from=2026-05-01&to=2026-05-31
Header: `Authorization: Bearer <jwt_token>`

Success response (200):
```json
{
  "entries": [
    {
      "id": 12,
      "user_id": 1,
      "log_date": "2026-05-10",
      "mood": "irritated",
      "energy_level": 2,
      "stress_level": 4,
      "sleep_hours": 6.5,
      "cramps": true,
      "headache": false,
      "fatigue": true,
      "bloating": true,
      "water_intake": 1.8,
      "exercise_done": false,
      "notes": "Mild cramps today",
      "created_at": "2026-05-10T12:01:02.202Z"
    }
  ]
}
```

## 7) Get Prediction
GET /prediction?defaultCycleLength=28
Header: `Authorization: Bearer <jwt_token>`

Success response (200):
```json
{
  "latestPeriodDate": "2026-04-29",
  "nextPeriodDate": "2026-05-27",
  "ovulationDate": "2026-05-13",
  "currentPhase": "Follicular",
  "currentDay": 9,
  "ovulationDay": 14,
  "cycleLengthUsed": 28,
  "phaseMessage": "Energy may rise now; this is a good time for planning and activity.",
  "averageCycleLength": 28,
  "confidenceLevel": "Medium",
  "irregularityFlag": false,
  "cycleCount": 4,
  "variation": 4
}
```

## 8) Chat with SAKHI Companion
POST /api/chat
Header: `Authorization: Bearer <jwt_token>` (optional)

Request body:
```json
{
  "message": "Why do I get painful cramps?",
  "sessionId": "sess_abc123",
  "phase": "Luteal",
  "symptoms": ["cramps", "fatigue"],
  "mood": "Calm"
}
```

Success response (200):
```json
{
  "reply": "Menstrual cramps are often caused by prostaglandins causing uterine contractions. Gentle heat, hydration, and light stretching can provide natural comfort.",
  "source": "local",
  "sessionId": "sess_abc123"
}
```

## 9) Educational Myths & Facts
GET /api/myths?category=all&search=cramp

Success response (200):
```json
{
  "myths": [
    {
      "id": 101,
      "category": "Pain & Cramps",
      "myth": "Painful periods are completely normal and you just have to deal with them.",
      "fact": "While mild discomfort from uterine contractions is common, severe pain that disrupts daily activities may indicate conditions like endometriosis or fibroids.",
      "source": "ACOG Clinical Guidelines",
      "sourceUrl": "https://www.acog.org",
      "helpfulnessUp": 142,
      "helpfulnessDown": 3
    }
  ],
  "total": 1
}
```

### Submit Helpfulness Feedback
POST /api/myths/101/feedback

Request body:
```json
{
  "vote": "up"
}
```

Success response (200):
```json
{
  "message": "Feedback recorded successfully.",
  "mythId": 101,
  "helpfulnessUp": 143,
  "helpfulnessDown": 3
}
```

## 10) Smart Nutrition Recommendations
POST /api/nutrition
Header: `Authorization: Bearer <jwt_token>`

Request body:
```json
{
  "phase": "Luteal",
  "symptoms": ["cramps", "bloating"],
  "allergies": ["peanuts"]
}
```

Success response (200):
```json
{
  "phase": "Luteal",
  "recommendedFoods": [
    {
      "name": "Spinach",
      "category": "Magnesium Support",
      "reason": "Magnesium helps relax uterine muscles and alleviate cramps.",
      "nutrients": {
        "calories": 23,
        "protein": 2.9,
        "carbohydrates": 3.6,
        "fat": 0.4
      }
    }
  ],
  "explanation": "These foods were personalized for your Luteal phase and cramps management."
}
```

## 11) Log Mood
POST /api/mood
Header: `Authorization: Bearer <jwt_token>`

Request body:
```json
{
  "mood": "calm",
  "intensity": 4,
  "note": "Feeling peaceful and rested today",
  "phase": "Follicular"
}
```

Success response (201):
```json
{
  "message": "Mood recorded successfully."
}
```

## 12) Log Symptoms
POST /api/symptoms
Header: `Authorization: Bearer <jwt_token>`

Request body:
```json
{
  "symptoms": ["cramps", "headache"],
  "severity": "mild",
  "notes": "Relieved after drinking warm water"
}
```

Success response (201):
```json
{
  "message": "Symptoms recorded successfully."
}
```
