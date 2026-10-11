# SAKHI User Manual

**Version:** 1.0.0 (October 2026)  
**Audience:** End Users & Evaluators  

---

## 1. What SAKHI Does

SAKHI is a comprehensive, stigma-free women's health companion designed to empower you with clarity about your body.

With SAKHI, you can:
- **Track your menstrual cycle** with adaptive predictions of period dates, ovulation, and fertile windows.
- **Understand your current hormonal phase** (Menstrual, Follicular, Ovulation, Luteal) and how it affects your energy and focus.
- **Log daily mood and symptoms** to observe monthly patterns.
- **Discover phase-aligned nutrition** and foods that alleviate specific cycle symptoms.
- **Bust common myths** through verified scientific facts and interactive quizzes.
- **Chat with SAKHI Companion** for compassionate, judgment-free answers to your cycle questions.

> **Safety Notice:** SAKHI provides educational and wellness guidance only. It is **not** a clinical diagnostic tool. If you experience severe pain, excessive bleeding, or medical emergencies, please consult a qualified healthcare provider.

---

## 2. Getting Started

### Step 1: Accessing the Application
Open your web browser and navigate to the application URL provided by your deployment:
```
https://your-frontend.example.com
```

### Step 2: Creating an Account
1. On the landing page or login screen, click **Sign up**.
2. Enter your:
   - **Full Name**
   - **Email Address**
   - **Password** (minimum 6 characters)
   - *Optional:* Age, Height, Weight, and Lifestyle (Sedentary, Moderate, Active) for personalized nutrition.
3. Click the **Create Account** button.

### Step 3: Logging In
1. Enter your registered email address and password.
2. Click **Log in**.
3. Once authenticated, you will be taken directly to your **Dashboard**.

---

## 3. Navigating the Dashboard

The **Dashboard** is your central daily hub:
- **Phase Banner:** Displays your current menstrual phase (e.g., Luteal Phase), day in cycle, and an encouraging message tailored to your hormonal state.
- **Prediction Cards:** Quick summary of your **Next Period Date**, estimated **Ovulation Day**, and cycle confidence score.
- **Quick Action Bar:** Direct shortcuts to log a cycle, record today's mood, check symptoms, explore nutrition, or open education.
- **Interactive Calendar:** A month-view calendar highlighting phase days, logged periods, and daily symptom icons. Clicking any day opens the detailed log drawer.

---

## 4. Cycle Tracker & Predictions

To log or update your cycle:
1. Navigate to **Cycle** from the top menu or dashboard shortcut.
2. Choose your preferred input method:
   - **Single Period Entry:** Enter the start date and optional duration of your most recent period.
   - **Period + Cycle Length:** Enter your period date and your typical cycle length in days (e.g., 28 days).
   - **Historical Cycles:** Log multiple past periods for enhanced adaptive prediction accuracy.
3. Click **Save and Predict**.
4. The system calculates and displays:
   - Expected start of your next period.
   - Estimated ovulation date.
   - High-fertility window.
   - Prediction confidence level (**High**, **Medium**, or **Approximate**).

---

## 5. Daily Check-in & Calendar

1. Open the **Dashboard** and locate the **Cycle Calendar**.
2. Click on today's date (or any past date).
3. Record your daily wellbeing:
   - **Mood:** Calm, Energetic, Sensitive, Irritated, Anxious, Low.
   - **Symptoms:** Cramps, Bloating, Headache, Fatigue, Acne, Backache, Tender Breasts.
   - **Water Intake & Sleep Hours:** Track daily hydration and sleep.
4. Click **Save Daily Log**. The date indicator updates with your logged indicators.

---

## 6. Smart Nutrition Guide

1. Navigate to **Nutrition** from the top navigation bar.
2. View recommendations tailored to your current cycle phase:
   - **Menstrual:** Iron-rich and warming foods to replenish energy and ease cramps.
   - **Follicular:** Fresh, lean proteins, fermented foods, and complex carbs to support rising estrogen.
   - **Ovulatory:** Antioxidant-rich fruits, leafy greens, and zinc to support ovulation.
   - **Luteal:** Magnesium-rich foods, root vegetables, and B-vitamins to balance progesterone and curb PMS cravings.
3. *Optional:* Filter by active symptoms (e.g., cramps, bloating, fatigue) to view targeted functional foods.
4. View verified caloric and macronutrient breakdowns sourced directly from the **USDA FoodData Central** database.

---

## 7. Education: Myths vs Facts

1. Navigate to **Education** from the navigation bar.
2. Choose your learning mode using the top toggle:

### Cards Mode
- Browse categorized educational topics: *Menstruation*, *Hygiene*, *Nutrition*, *Pain & Cramps*, *Exercise & Activity*.
- Use the **Search topics...** bar to quickly find answers to specific concerns.
- Each card highlights:
  - The widespread **Myth** in bold.
  - The scientific **Sage Fact** callout box.
  - Citations linking to verified clinical guidelines and peer-reviewed health resources.
  - Helpful / Not Helpful feedback buttons (👍 / 👎).

### Quiz Mode
- Test your knowledge with interactive True / False questions.
- Select either **Myth ❌** or **Fact ✅**.
- Get instant feedback with comprehensive explanations and track your learning score.

---

## 8. SAKHI Companion Chatbot

1. Click **Chatbot** in the navigation menu.
2. The chat window automatically loads your current cycle context (e.g., *Context active · Luteal · Calm*).
3. Type any query into the prompt input (*"Ask anything about your cycle..."*) or select one of the suggested conversation starters:
   - *"What should I eat during my follicular phase?"*
   - *"Why do I get painful cramps?"*
   - *"Is it safe to do intense workouts during my period?"*
4. Click the send button (**→**) or press **Enter**.
5. To clear conversation history and start a fresh session, click **New chat**.

---

## 9. Account Management & Signing Out

- **Sign Out:** Click the **Sign out** button in the top navigation bar at any time to clear your local session securely.
- **Forgot Password:** On the login screen, click **Forgot password?** to request a secure password reset link or token.

---

## 10. Frequently Asked Questions & Troubleshooting

| Issue | Solution |
|---|---|
| **"Cannot connect to server" or API errors** | Verify that the deployed backend is healthy at its configured health endpoint. |
| **"PostgreSQL password lost / database error"** | You can switch to a free cloud PostgreSQL server (such as Neon.tech) in under 2 minutes by setting `DATABASE_URL` in `apps/backend/.env`. Refer to Section 4 of the [README.md](file:///e:/GIT%20PROJECTS/Sakhi/README.md) for details. |
| **Blank screen after route change** | Open the deployed frontend URL and hard reload with `Ctrl+Shift+R` to clear old browser cache. |
| **Chatbot returns fallback message** | Check your network connection. If using Gemini AI fallback, verify your `GEMINI_API_KEY` in `apps/backend/.env`. |
