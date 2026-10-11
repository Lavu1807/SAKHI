import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import PageFrame from "../../shared/components/PageFrame";
import { staggerItem, staggerParent } from "../../shared/utils/motionPresets";
import { addCycleEntry, getCycleHistory, getPrediction } from "../../shared/utils/api";
import { getAuthToken } from "../../shared/utils/auth";
import {
  formatDateRange,
  formatDisplayDate,
  readCycleData,
  saveCycleData,
} from "./cycleUtils";

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

export default function CycleTracker() {
  const [lastDate, setLastDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [cycleLength, setCycleLength] = useState("");
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const storedCycleData = readCycleData();
    const token = getAuthToken();

    setLastDate(storedCycleData.lastDate);
    setCycleLength(storedCycleData.cycleLength);

    if (storedCycleData.nextPeriod && storedCycleData.ovulationDate) {
      setResult({
        nextPeriodDate: storedCycleData.nextPeriod,
        ovulationDate: storedCycleData.ovulationDate,
        fertileWindowStart: storedCycleData.fertileWindowStart,
        fertileWindowEnd: storedCycleData.fertileWindowEnd,
        currentPhase: storedCycleData.currentPhase,
        currentDay: storedCycleData.currentDay,
        cycleLengthUsed: storedCycleData.cycleLengthUsed,
      });
    }

    async function loadHistory() {
      if (!token) return;
      try {
        const response = await getCycleHistory(token);
        setHistory(response.entries || []);
      } catch {
        setHistory([]);
      }
    }
    loadHistory();
  }, []);

  async function handleCalculate(event) {
    event.preventDefault();

    const validationErrors = {};
    const cycleLengthValue = cycleLength.trim();
    const cycleLengthNumber = cycleLengthValue ? Number(cycleLengthValue) : null;

    if (!lastDate) {
      validationErrors.lastDate = "Provide your last period date.";
    }
    if (cycleLengthValue && (!Number.isFinite(cycleLengthNumber) || cycleLengthNumber <= 0)) {
      validationErrors.cycleLength = "Cycle length must be a positive number.";
    }

    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    const token = getAuthToken();
    if (!token) {
      setApiError("Your session has expired. Please login again.");
      return;
    }

    setApiError("");
    setIsSubmitting(true);

    try {
      const payload = {
        period_start_date: lastDate,
        cycle_length: Number.isFinite(cycleLengthNumber) ? Math.round(cycleLengthNumber) : undefined,
      };

      const addEntryResponse = await addCycleEntry(payload, token);
      const predictionFallbackLength = Number.isFinite(cycleLengthNumber)
        ? Math.round(cycleLengthNumber)
        : Number.isFinite(Number(addEntryResponse?.initialCycleLengthEstimate))
          ? Number(addEntryResponse.initialCycleLengthEstimate)
          : undefined;

      const prediction = await getPrediction(token, { defaultCycleLength: predictionFallbackLength });

      saveCycleData({
        lastDate: prediction.latestPeriodDate || lastDate,
        cycleLength: Number.isFinite(Number(prediction.averageCycleLength)) ? Number(prediction.averageCycleLength) : cycleLength,
        nextPeriod: prediction.nextPeriodDate || "",
        ovulationDate: prediction.ovulationDate || "",
        fertileWindowStart: prediction.fertileWindowStart || "",
        fertileWindowEnd: prediction.fertileWindowEnd || "",
        currentPhase: prediction.currentPhase || "",
        currentDay: Number.isFinite(Number(prediction.currentDay)) ? Number(prediction.currentDay) : "",
        cycleLengthUsed: Number.isFinite(Number(prediction.cycleLengthUsed)) ? Number(prediction.cycleLengthUsed) : "",
      });

      setResult({
        nextPeriodDate: prediction.nextPeriodDate || "",
        ovulationDate: prediction.ovulationDate || "",
        fertileWindowStart: prediction.fertileWindowStart || "",
        fertileWindowEnd: prediction.fertileWindowEnd || "",
        currentPhase: prediction.currentPhase || "",
        currentDay: Number.isFinite(Number(prediction.currentDay)) ? Number(prediction.currentDay) : "",
        cycleLengthUsed: Number.isFinite(Number(prediction.cycleLengthUsed)) ? Number(prediction.cycleLengthUsed) : "",
      });

      const updatedHistory = await getCycleHistory(token);
      setHistory(updatedHistory.entries || []);
    } catch (error) {
      setApiError(error.message || "Unable to save cycle data.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <PageFrame>
      <motion.div className="epage" variants={staggerParent} initial="hidden" animate="show">
        {/* Header */}
        <motion.p className="epage-label" variants={staggerItem}>Cycle Tracker</motion.p>
        <motion.h1 className="epage-title" variants={staggerItem}>Know your rhythm</motion.h1>

        {/* Main Grid */}
        <div className="ecycle-grid">
          {/* Left: Form */}
          <motion.div className="ecard ecycle-form-card" variants={staggerItem}>
            <p className="ecard-label">Log Period</p>
            <h2 className="ecard-title">Period start date</h2>

            <form onSubmit={handleCalculate}>
              <div className="ecycle-field">
                <input
                  type="date"
                  value={lastDate}
                  onChange={(e) => {
                    setLastDate(e.target.value);
                    setErrors((prev) => ({ ...prev, lastDate: "" }));
                  }}
                />
                {errors.lastDate && <p className="efield-error">{errors.lastDate}</p>}
              </div>

              <div className="ecycle-field">
                <label>Period end date</label>
                <p className="sub-label" style={{ margin: "0 0 6px" }}>optional</p>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>

              {apiError && <p className="efield-error" style={{ marginBottom: 12 }}>{apiError}</p>}

              <button type="submit" className="ecycle-submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save and predict cycle"} →
              </button>
              <p className="ecycle-hint">Predictions are approximate and become more personal with 3+ logged cycles.</p>
            </form>
          </motion.div>

          {/* Right: Prediction */}
          {result ? (
            <motion.div className="ecycle-prediction" variants={staggerItem}>
              <p className="ecard-label">Prediction</p>
              <div className="ecycle-prediction-grid">
                <div className="ecycle-metric">
                  <span className="ecycle-metric-label">Next period</span>
                  <span className="ecycle-metric-value">{formatDisplayDate(result.nextPeriodDate)}</span>
                </div>
                <div className="ecycle-metric">
                  <span className="ecycle-metric-label">Fertile window</span>
                  <span className="ecycle-metric-value">{formatDateRange(result.fertileWindowStart, result.fertileWindowEnd)}</span>
                </div>
                <div className="ecycle-metric">
                  <span className="ecycle-metric-label">Ovulation</span>
                  <span className="ecycle-metric-value">{formatDisplayDate(result.ovulationDate)}</span>
                </div>
                <div className="ecycle-metric">
                  <span className="ecycle-metric-label">Fertile window</span>
                  <span className="ecycle-metric-value">{formatDateRange(result.fertileWindowStart, result.fertileWindowEnd)}</span>
                </div>
                <div className="ecycle-metric">
                  <span className="ecycle-metric-label">Current phase</span>
                  <span className="ecycle-metric-value">{result.currentPhase || "--"}</span>
                </div>
                <div className="ecycle-metric">
                  <span className="ecycle-metric-label">Cycle length used</span>
                  <span className="ecycle-metric-value">{result.cycleLengthUsed ? `${result.cycleLengthUsed} days` : "--"}</span>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div className="ecycle-prediction" variants={staggerItem}>
              <p className="ecard-label">Prediction</p>
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 15 }}>
                Log your first period date to see cycle predictions here.
              </p>
            </motion.div>
          )}
        </div>

        {/* Cycle History */}
        {history.length > 0 && (
          <motion.div className="ecard ecycle-history-card" variants={staggerItem}>
            <div className="ecard-header">
              <div>
                <p className="ecard-label">Cycle History</p>
                <h2 className="ecard-title">What you&apos;ve logged</h2>
              </div>
              <span className="ecycle-count">{history.length} {history.length === 1 ? "entry" : "entries"}</span>
            </div>

            {history.slice(0, 6).map((entry) => (
              <div key={entry.id} className="ecycle-entry">
                <span className="ecycle-entry-date">{formatDisplayDate(entry.period_start_date)}</span>
                <span className="ecycle-entry-end">{entry.period_end_date ? formatDisplayDate(entry.period_end_date) : "Ongoing"}</span>
                <span className="ecycle-entry-badge">{entry.cycle_length || 28} days</span>
                <span className="ecycle-entry-badge">Last period</span>
              </div>
            ))}
          </motion.div>
        )}

        {/* Footer Disclaimer */}
        <div className="epage-footer-disclaimer">
          <CheckIcon />
          Your health information stays yours. SAKHI is educational, not diagnostic.
        </div>
      </motion.div>
    </PageFrame>
  );
}
