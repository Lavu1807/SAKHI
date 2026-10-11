import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import PageFrame from "../../shared/components/PageFrame";
import { staggerItem, staggerParent } from "../../shared/utils/motionPresets";
import { addMoodEntry, getMoodEntries } from "../../shared/utils/api";
import { getAuthToken } from "../../shared/utils/auth";
import { readCycleData } from "../cycle/cycleUtils";
import { saveMoodChatContext } from "./moodContext";

const MOOD_OPTIONS = [
  { value: "happy", label: "Happy", emoji: "😊" },
  { value: "calm", label: "Calm", emoji: "😌" },
  { value: "anxious", label: "Anxious", emoji: "😟" },
  { value: "irritated", label: "Irritated", emoji: "😠" },
  { value: "sad", label: "Sad", emoji: "😢" },
  { value: "energetic", label: "Energetic", emoji: "⚡" },
];

function getTodayDateString() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function normalizePhase(value) {
  const n = String(value || "").trim().toLowerCase();
  if (n.includes("menstrual") || n.includes("period")) return "Menstrual";
  if (n.includes("follicular")) return "Follicular";
  if (n.includes("ovulation") || n.includes("ovulatory")) return "Ovulation";
  if (n.includes("luteal")) return "Luteal";
  return "Menstrual";
}

function getEntryTime(entry) {
  const dv = new Date(entry?.date || "").getTime();
  return Number.isFinite(dv) ? dv : 0;
}

function sortEntriesLatest(entries) {
  return [...entries].sort((a, b) => getEntryTime(b) - getEntryTime(a));
}

function sortEntriesChronological(entries) {
  return [...entries].sort((a, b) => getEntryTime(a) - getEntryTime(b));
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function buildInitialForm() {
  const cycleData = readCycleData();
  const initialCycleDay = Number(cycleData?.currentDay);

  return {
    date: getTodayDateString(),
    mood: "",
    intensity: 3,
    note: "",
    cycleDay: Number.isInteger(initialCycleDay) && initialCycleDay > 0 ? initialCycleDay : 1,
    phase: normalizePhase(cycleData?.currentPhase),
  };
}

export default function MoodTracker() {
  const [searchParams] = useSearchParams();
  const [formState, setFormState] = useState(() => buildInitialForm());
  const [entries, setEntries] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });

  // Build bar chart data for last 14 days
  const barChartData = useMemo(() => {
    const timeline = sortEntriesChronological(entries).slice(-14);
    if (timeline.length === 0) return [];
    const maxIntensity = 5;
    return timeline.map((entry, i) => ({
      height: ((Number(entry.intensity) || 1) / maxIntensity) * 100,
      isLast: i === timeline.length - 1,
      date: new Date(entry.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    }));
  }, [entries]);

  const avgIntensity = useMemo(() => {
    if (entries.length === 0) return null;
    const recent = entries.slice(0, 14);
    const sum = recent.reduce((acc, e) => acc + (Number(e.intensity) || 0), 0);
    return (sum / recent.length).toFixed(1);
  }, [entries]);

  // Phase insights
  const phaseInsights = useMemo(() => {
    const currentPhase = formState.phase;
    if (currentPhase === "Follicular") return ["Calm peaks in follicular", "Late luteal needs softness"];
    if (currentPhase === "Luteal") return ["Late luteal needs softness", "Energy may dip before period"];
    if (currentPhase === "Menstrual") return ["Rest & restore is natural", "Emotions may intensify"];
    return ["Peak confidence & energy", "Social connection feels easy"];
  }, [formState.phase]);

  useEffect(() => {
    const requestedDate = String(searchParams.get("date") || "").trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(requestedDate)) {
      setFormState((prev) => ({ ...prev, date: requestedDate }));
    }
  }, [searchParams]);

  useEffect(() => {
    async function loadHistory() {
      setIsLoadingHistory(true);
      setStatusMessage({ type: "", text: "" });
      try {
        const response = await getMoodEntries(getAuthToken(), { limit: 20 });
        const historyEntries = Array.isArray(response?.entries) ? response.entries : [];
        setEntries(historyEntries);

        const latestEntry = sortEntriesLatest(historyEntries)[0];
        if (latestEntry) {
          saveMoodChatContext({
            latestMood: latestEntry.mood,
            latestMoodIntensity: latestEntry.intensity,
            latestMoodDate: latestEntry.date,
            latestMoodPhase: latestEntry.phase,
            latestMoodNote: latestEntry.note || "",
          });
        }
      } catch (error) {
        setStatusMessage({ type: "error", text: error.message || "Unable to load mood history." });
      } finally {
        setIsLoadingHistory(false);
      }
    }
    loadHistory();
  }, []);

  function updateFormField(field, value) {
    setFormState((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!formState.mood) {
      setStatusMessage({ type: "error", text: "Please select a mood." });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage({ type: "", text: "" });

    try {
      const payload = {
        date: formState.date,
        mood: formState.mood,
        intensity: Number(formState.intensity),
        note: formState.note.trim() || undefined,
        cycleDay: Number(formState.cycleDay),
        phase: formState.phase,
      };

      const response = await addMoodEntry(payload, getAuthToken());
      const savedEntry = response?.entry;

      if (savedEntry) {
        setEntries((prev) => [savedEntry, ...prev.filter((item) => item.id !== savedEntry.id)]);
        saveMoodChatContext({
          latestMood: savedEntry.mood,
          latestMoodIntensity: savedEntry.intensity,
          latestMoodDate: savedEntry.date,
          latestMoodPhase: savedEntry.phase,
          latestMoodNote: savedEntry.note || "",
        });
      }

      setStatusMessage({ type: "success", text: "Mood logged successfully." });
      setFormState((prev) => ({ ...prev, mood: "", note: "" }));
    } catch (error) {
      setStatusMessage({ type: "error", text: error.message || "Failed to log mood." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <PageFrame>
      <motion.div className="epage" variants={staggerParent} initial="hidden" animate="show">
        {/* Header */}
        <motion.p className="epage-label" variants={staggerItem}>Mood Tracker</motion.p>
        <motion.h1 className="epage-title" variants={staggerItem}>Make space for how you feel</motion.h1>

        {/* Two Column */}
        <div className="epage-grid">
          {/* Left: Today's Check-In */}
          <motion.div className="ecard" variants={staggerItem}>
            <p className="ecard-label">Today&apos;s Check-In</p>
            <h2 className="ecard-title">What&apos;s the weather inside?</h2>

            <form onSubmit={handleSubmit}>
              {/* Emoji Grid */}
              <div className="emood-grid">
                {MOOD_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`emood-btn${formState.mood === option.value ? " selected" : ""}`}
                    onClick={() => updateFormField("mood", option.value)}
                  >
                    <span className="emood-emoji">{option.emoji}</span>
                    <span className="emood-label">{option.label}</span>
                  </button>
                ))}
              </div>

              {/* Intensity */}
              <div className="emood-intensity-row">
                <label>Intensity</label>
                <span className="emood-intensity-val">{formState.intensity}/5</span>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={formState.intensity}
                  onChange={(e) => updateFormField("intensity", Number(e.target.value))}
                />
              </div>

              {/* Note */}
              <div className="emood-note">
                <textarea
                  rows="3"
                  maxLength={500}
                  value={formState.note}
                  onChange={(e) => updateFormField("note", e.target.value)}
                  placeholder="What might be influencing your mood today?"
                />
              </div>

              {statusMessage.text && (
                <p className={statusMessage.type === "error" ? "estatus-error" : "estatus-success"} style={{ marginTop: 10 }}>
                  {statusMessage.text}
                </p>
              )}

              <button
                type="submit"
                className="ebtn-primary"
                disabled={isSubmitting}
                style={{ marginTop: 16, width: "100%" }}
              >
                {isSubmitting ? "Saving..." : "Log Mood"}
              </button>
            </form>
          </motion.div>

          {/* Right: Your Last 14 Days */}
          <motion.div className="ecard" variants={staggerItem}>
            <div className="ecard-header">
              <div>
                <p className="ecard-label">Your Last 14 Days</p>
                <h2 className="ecard-title">A pattern, not a verdict</h2>
              </div>
              {avgIntensity && (
                <div className="ecard-stat">
                  {avgIntensity}<small>avg</small>
                </div>
              )}
            </div>

            {barChartData.length > 0 ? (
              <>
                <div className="emood-bars">
                  {barChartData.map((bar, i) => (
                    <div
                      key={i}
                      className={`emood-bar ${bar.isLast ? "emood-bar-dark" : "emood-bar-light"}`}
                      style={{ height: `${bar.height}%` }}
                      title={bar.date}
                    />
                  ))}
                </div>
                <div className="emood-chart-labels">
                  <span>{barChartData[0]?.date}</span>
                  <span>Today</span>
                </div>
              </>
            ) : (
              <p style={{ fontSize: 14, color: "var(--muted)" }}>
                {isLoadingHistory ? "Loading mood history..." : "Add a few mood entries to see your trend chart."}
              </p>
            )}

            <div className="emood-insight-pills">
              {phaseInsights.map((insight) => (
                <span key={insight} className="emood-insight-pill">{insight}</span>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Footer Disclaimer */}
        <div className="epage-footer-disclaimer">
          <CheckIcon />
          Your health information stays yours. SAKHI is educational, not diagnostic.
        </div>
      </motion.div>
    </PageFrame>
  );
}
