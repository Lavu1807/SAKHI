import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import PageFrame from "../../shared/components/PageFrame";
import { staggerItem, staggerParent } from "../../shared/utils/motionPresets";
import { saveSymptomChatContext } from "./symptomContext";

/* ── Symptom options (matching Emergent screenshot) ── */
const SYMPTOM_PILLS = [
  { key: "cramps", label: "Cramps / pelvic pain" },
  { key: "headache", label: "Headache / migraine" },
  { key: "fatigue", label: "Fatigue / lethargy" },
  { key: "bloating", label: "Bloating / water retention" },
  { key: "lowerBackPain", label: "Lower back pain" },
  { key: "moodSwings", label: "Mood swings" },
  { key: "anxiety", label: "Anxiety" },
  { key: "brainFog", label: "Brain fog" },
];

const SUGGESTION_BY_SYMPTOM = {
  cramps: "Take extra rest and try gentle heat therapy for comfort.",
  fatigue: "Include iron-rich foods like spinach, lentils, or beans in your meals.",
  moodSwings: "Try short relaxation techniques like deep breathing or journaling.",
  bloating: "Stay hydrated through the day and reduce very salty snacks.",
  headache: "Rest in a dim room, stay hydrated, and consider magnesium-rich food.",
  anxiety: "Practice grounding exercises, limit caffeine, and try gentle movement.",
  lowerBackPain: "Use a warm compress and try child's pose or gentle stretching.",
  brainFog: "Prioritize sleep, stay hydrated, and include omega-3-rich foods.",
};

const RELIEF_STEPS = [
  "Warmth on your lower abdomen or back can help relax tense muscles.",
  "Try slow movement, hydration, and a meal with magnesium-rich foods.",
  "Notice whether this pattern repeats — tracking helps you spot the pattern.",
];

function resolveSeverity(painLevel) {
  if (painLevel <= 3) return "Mild";
  if (painLevel <= 7) return "Moderate";
  return "Severe";
}

function toChatSymptomLabel(symptomKey) {
  if (symptomKey === "moodSwings") return "mood swings";
  if (symptomKey === "lowerBackPain") return "lower back pain";
  if (symptomKey === "brainFog") return "brain fog";
  return symptomKey;
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

export default function Symptoms() {
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [painLevel, setPainLevel] = useState(4);

  function toggleSymptom(key) {
    setSelectedSymptoms((prev) =>
      prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key],
    );
  }

  const severity = useMemo(() => resolveSeverity(painLevel), [painLevel]);

  const suggestions = useMemo(() => {
    const list = selectedSymptoms
      .map((s) => SUGGESTION_BY_SYMPTOM[s])
      .filter(Boolean);
    return list.length ? Array.from(new Set(list)) : RELIEF_STEPS;
  }, [selectedSymptoms]);

  // Persist context for chatbot
  useMemo(() => {
    if (selectedSymptoms.length > 0) {
      const chatSymptoms = selectedSymptoms.map(toChatSymptomLabel);
      saveSymptomChatContext({
        symptoms: chatSymptoms,
        symptomAnalysis: { severity: severity.toLowerCase(), painLevel },
        updatedAt: new Date().toISOString(),
      });
    }
  }, [selectedSymptoms, severity, painLevel]);

  return (
    <PageFrame>
      <motion.div className="epage" variants={staggerParent} initial="hidden" animate="show">
        {/* Page Header */}
        <motion.p className="epage-label" variants={staggerItem}>Symptom Checker</motion.p>
        <motion.h1 className="epage-title" variants={staggerItem}>Listen to your body</motion.h1>

        {/* Disclaimer Banner */}
        <motion.div className="epage-banner" variants={staggerItem}>
          <CheckIcon />
          <p style={{ margin: 0 }}>
            <strong>Educational wellness tool, not a diagnosis.</strong>{" "}
            For persistent, severe, or debilitating symptoms, please speak with a licensed healthcare professional.
          </p>
        </motion.div>

        {/* Two Column Layout */}
        <div className="epage-grid">
          {/* Left: Symptom Selector */}
          <motion.div className="ecard" variants={staggerItem}>
            <p className="ecard-label">Body Signals</p>
            <h2 className="ecard-title">What are you noticing?</h2>

            <div className="epill-row" style={{ marginBottom: 28 }}>
              {SYMPTOM_PILLS.map((pill) => (
                <button
                  key={pill.key}
                  type="button"
                  className={`epill${selectedSymptoms.includes(pill.key) ? " active" : ""}`}
                  onClick={() => toggleSymptom(pill.key)}
                >
                  {selectedSymptoms.includes(pill.key) && "✓ "}
                  {pill.label}
                </button>
              ))}
            </div>

            {/* Pain Intensity */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <span style={{ fontSize: 14, color: "var(--ink)", fontWeight: 500 }}>Pain intensity</span>
              <span className="eslider-value">{painLevel}/10 · {severity}</span>
            </div>
            <div className="eslider-row">
              <input
                type="range"
                min="1"
                max="10"
                value={painLevel}
                onChange={(e) => setPainLevel(Number(e.target.value))}
              />
            </div>
          </motion.div>

          {/* Right: Personalized Relief */}
          <motion.div className="ecard" variants={staggerItem}>
            <p className="ecard-label">Personalized Relief Guidance</p>
            <h2 className="ecard-title">A gentle next step</h2>

            <div className="enumbered-list">
              {suggestions.map((text, index) => (
                <div key={text} className="enumbered-item">
                  <span className="enumbered-num">{String(index + 1).padStart(2, "0")}</span>
                  <span className="enumbered-text">{text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Sticky Footer Disclaimer */}
        <div className="epage-footer-disclaimer">
          <CheckIcon />
          Your health information stays yours. SAKHI is educational, not diagnostic.
        </div>
      </motion.div>
    </PageFrame>
  );
}
