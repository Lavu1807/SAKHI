import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import PageFrame from "../../shared/components/PageFrame";
import { staggerItem, staggerParent } from "../../shared/utils/motionPresets";
import { readCycleData } from "../cycle/cycleUtils";
import { getAuthToken, getAuthUser } from "../../shared/utils/auth";
import { getFoodNutrition } from "../../shared/utils/api";
import { getSmartNutrition, getSymptomOptionsForPhase } from "./nutritionEngine";

const FOOD_EMOJIS = {
  spinach: "🥬",
  salmon: "🐟",
  "pumpkin seeds": "🫐",
  "ginger tea": "🫖",
  lentils: "🫘",
  eggs: "🥚",
  oats: "🥣",
  yogurt: "🥛",
  berries: "🫐",
  chicken: "🍗",
  avocado: "🥑",
  "sweet potato": "🍠",
  tofu: "🫘",
  banana: "🍌",
  "dark chocolate": "🍫",
};

const NUTRITION_UNAVAILABLE_MESSAGE = "Nutrition data unavailable";

const formatLabel = (value) =>
  String(value)
    .replace(/_/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const formatMetricValue = (value) =>
  Number.isFinite(value) ? Number(value).toFixed(1).replace(/\.0$/, "") : "--";

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
    </svg>
  );
}

const PHASE_MESSAGES = {
  Follicular: {
    title: "Sustained energy & estrogen support",
    desc: "Build a colorful plate, keep protein close, and let nourishment feel uncomplicated.",
  },
  Ovulation: {
    title: "Peak vitality & liver support",
    desc: "Support your body's natural detox with cruciferous vegetables and lean protein.",
  },
  Luteal: {
    title: "Comfort & progesterone support",
    desc: "Reach for magnesium-rich foods, warm meals, and steady carbs to ease the transition.",
  },
  Menstrual: {
    title: "Restore & replenish iron stores",
    desc: "Focus on iron, vitamin C, and anti-inflammatory foods to rebuild and soothe.",
  },
};

export default function Nutrition() {
  const [currentPhase, setCurrentPhase] = useState("");
  const [userProfile, setUserProfile] = useState(null);
  const [authToken, setAuthToken] = useState("");
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [foodNutritionData, setFoodNutritionData] = useState({});
  const [nutritionDataLoading, setNutritionDataLoading] = useState(false);

  useEffect(() => {
    const cycleData = readCycleData();
    setCurrentPhase(cycleData.currentPhase || "Follicular");
    setUserProfile(getAuthUser());
    setAuthToken(getAuthToken());
  }, []);

  const symptomOptions = useMemo(() => getSymptomOptionsForPhase(currentPhase), [currentPhase]);

  useEffect(() => {
    const available = new Set(symptomOptions.map((item) => item.key));
    setSelectedSymptoms((prev) => prev.filter((s) => available.has(s)));
  }, [symptomOptions]);

  function handleSymptomToggle(symptomKey) {
    setSelectedSymptoms((prev) =>
      prev.includes(symptomKey) ? prev.filter((s) => s !== symptomKey) : [...prev, symptomKey],
    );
  }

  const nutritionPlan = useMemo(() => {
    const { finalFoods, nutrients, foodGroups, explanation } = getSmartNutrition(
      currentPhase,
      selectedSymptoms,
      userProfile || {},
    );

    if (!currentPhase || finalFoods.length === 0) {
      return {
        focusTitle: "No data yet",
        explanation: "Track your cycle first to get personalized nutrition suggestions.",
        nutrients: [],
        foodGroups: [],
        finalFoods: [],
      };
    }

    return {
      focusTitle: nutrients.length ? nutrients.slice(0, 3).map(formatLabel).join(" + ") : "Balanced Nutrition",
      explanation,
      nutrients,
      foodGroups,
      finalFoods,
    };
  }, [currentPhase, selectedSymptoms, userProfile]);

  // Load USDA nutrition data for display
  useEffect(() => {
    let isActive = true;

    async function loadExternalNutrition() {
      if (!nutritionPlan.finalFoods.length) return;
      const missingFoods = nutritionPlan.finalFoods.filter((food) => foodNutritionData[food] === undefined);
      if (!missingFoods.length) return;

      setNutritionDataLoading(true);
      try {
        const settled = await Promise.allSettled(
          missingFoods.map((food) => getFoodNutrition(food, authToken)),
        );
        if (!isActive) return;

        setFoodNutritionData((prev) => {
          const next = { ...prev };
          settled.forEach((result, i) => {
            next[missingFoods[i]] = result.status === "fulfilled" ? result.value : null;
          });
          return next;
        });
      } finally {
        if (isActive) setNutritionDataLoading(false);
      }
    }

    loadExternalNutrition();
    return () => { isActive = false; };
  }, [authToken, foodNutritionData, nutritionPlan.finalFoods]);

  const phaseMsg = PHASE_MESSAGES[currentPhase] || PHASE_MESSAGES.Follicular;

  return (
    <PageFrame>
      <motion.div className="epage" variants={staggerParent} initial="hidden" animate="show">
        {/* Header */}
        <motion.p className="epage-label" variants={staggerItem}>Phase-Aware Nutrition</motion.p>
        <motion.h1 className="epage-title" variants={staggerItem}>Nourish your rhythm</motion.h1>

        {/* Hero Banner */}
        <motion.div className="enutri-hero" variants={staggerItem}>
          <p className="ecard-label">{currentPhase || "Follicular"} Phase</p>
          <h2 className="enutri-hero-title">{phaseMsg.title}</h2>
          <p className="enutri-hero-desc">{phaseMsg.desc}</p>
          <div className="enutri-hero-icon">
            <StarIcon />
          </div>
        </motion.div>

        {/* Symptom Row */}
        <motion.div className="enutri-symptom-row" variants={staggerItem}>
          <span className="enutri-symptom-label">What are you feeling?</span>
          <div className="epill-row">
            {symptomOptions.map((item) => (
              <button
                key={item.key}
                type="button"
                className={`epill${selectedSymptoms.includes(item.key) ? " active" : ""}`}
                onClick={() => handleSymptomToggle(item.key)}
              >
                {selectedSymptoms.includes(item.key) && "✓ "}
                {item.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Core Focus */}
        <motion.div className="enutri-focus" variants={staggerItem}>
          <div>
            <p className="ecard-label">Core Focus</p>
            <h3 className="enutri-focus-title">{nutritionPlan.focusTitle}</h3>
          </div>
          <p className="enutri-focus-desc">{nutritionPlan.explanation}</p>
          <div className="enutri-focus-pills">
            {nutritionPlan.nutrients.map((n) => (
              <span key={n} className="enutri-pill">{formatLabel(n)}</span>
            ))}
          </div>
        </motion.div>

        {/* Food Cards */}
        <motion.div className="enutri-food-grid" variants={staggerParent}>
          {nutritionPlan.foodGroups.map((group) =>
            group.items.map((item) => {
              const nutrition = foodNutritionData[item.food];
              const emoji = FOOD_EMOJIS[item.food.toLowerCase()] || "🥗";
              return (
                <motion.div key={`${group.category}-${item.food}`} className="enutri-food-card" variants={staggerItem}>
                  <span className="enutri-food-emoji">{emoji}</span>
                  <span className="enutri-food-cat">{group.category}</span>
                  <h4 className="enutri-food-name">{formatLabel(item.food)}</h4>
                  <p className="enutri-food-reason">{item.reason}</p>
                  <div className="enutri-food-sep" />
                  {nutrition ? (
                    <div className="enutri-food-stats">
                      <span>kcal <strong>{formatMetricValue(nutrition.calories)}</strong></span>
                      <span>protein <strong>{formatMetricValue(nutrition.protein)}g</strong></span>
                      <span>per 100g</span>
                    </div>
                  ) : (
                    <div className="enutri-food-stats">
                      <span style={{ color: "var(--muted)" }}>
                        {nutritionDataLoading ? "Loading..." : NUTRITION_UNAVAILABLE_MESSAGE}
                      </span>
                    </div>
                  )}
                </motion.div>
              );
            })
          )}
        </motion.div>

        {/* Footer Disclaimer */}
        <div className="epage-footer-disclaimer">
          <CheckIcon />
          Your health information stays yours. SAKHI is educational, not diagnostic.
        </div>
      </motion.div>
    </PageFrame>
  );
}
