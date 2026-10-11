import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageFrame from "../../shared/components/PageFrame";
import { getCycleHistory, getCycleStatus, getPrediction, getRandomMyth, markPeriodEnd } from "../../shared/utils/api";
import { clearAllUserData, getAuthToken, getAuthUser } from "../../shared/utils/auth";
import { formatDisplayDate, readCycleData, saveCycleData } from "../cycle/cycleUtils";

const MYTH_OF_DAY_STORAGE_KEY = "sakhi_myth_of_the_day";
const PERIOD_PROMPT_LAST_DATE_STORAGE_KEY = "sakhi_period_prompt_last_answer_date";

function getDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function readCachedMythOfDay(dateKey) {
  try {
    const raw = localStorage.getItem(MYTH_OF_DAY_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (parsed?.dateKey !== dateKey || !parsed?.myth || !Number.isFinite(Number(parsed.myth.id))) {
      return null;
    }

    return parsed.myth;
  } catch {
    return null;
  }
}

function cacheMythOfDay(dateKey, myth) {
  try {
    localStorage.setItem(
      MYTH_OF_DAY_STORAGE_KEY,
      JSON.stringify({ dateKey, myth }),
    );
  } catch {
    // Ignore local storage errors
  }
}

function readLastPeriodPromptDate() {
  try {
    const raw = localStorage.getItem(PERIOD_PROMPT_LAST_DATE_STORAGE_KEY);
    return raw && /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : "";
  } catch {
    return "";
  }
}

function saveLastPeriodPromptDate(dateKey) {
  try {
    localStorage.setItem(PERIOD_PROMPT_LAST_DATE_STORAGE_KEY, dateKey);
  } catch {
    // Ignore
  }
}

function formatSourceLabel(source) {
  const normalized = String(source || "").trim();
  return normalized ? `Source: ${normalized}` : "Source: ACOG";
}

function parseDateOnly(value) {
  if (!value || typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value.slice(0, 10))) {
    return null;
  }
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  const parsed = new Date(year, month - 1, day);
  if (Number.isNaN(parsed.getTime())) return null;
  parsed.setHours(0, 0, 0, 0);
  return parsed;
}

function calculateDaysUntil(dateValue) {
  if (!dateValue) return null;
  const target = parseDateOnly(String(dateValue).slice(0, 10));
  if (!target) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
}

// Sparkle SVG
function SparkleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
    </svg>
  );
}

// Activity pulse ECG icon
function PulseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}

// Calendar outline icon
function CalendarMiniIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

// Heart outline icon
function HeartMiniIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [cycleData, setCycleData] = useState(readCycleData());
  const [apiError, setApiError] = useState("");
  const [displayName, setDisplayName] = useState("Maya");
  const [mythOfDay, setMythOfDay] = useState(null);
  const [cycleStatus, setCycleStatus] = useState({
    periodStartDate: null,
    periodEndDate: null,
    isPeriodOngoing: false,
  });
  const [showPeriodEndPrompt, setShowPeriodEndPrompt] = useState(false);
  const [periodPromptError, setPeriodPromptError] = useState("");
  const [isResolvingPeriodPrompt, setIsResolvingPeriodPrompt] = useState(false);
  const [lastPromptDate, setLastPromptDate] = useState(() => readLastPeriodPromptDate());

  const refreshPrediction = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      navigate("/", { replace: true });
      return;
    }

    const storedCycleData = readCycleData();

    try {
      const defaultCycleLength = Number(storedCycleData.cycleLength);
      const [prediction, historyResponse] = await Promise.all([
        getPrediction(token, {
          defaultCycleLength: Number.isFinite(defaultCycleLength) ? defaultCycleLength : undefined,
        }),
        getCycleHistory(token),
      ]);

      const historyEntries = Array.isArray(historyResponse?.entries) ? historyResponse.entries : [];

      const nextCycleData = {
        ...storedCycleData,
        lastDate: prediction.latestPeriodDate || storedCycleData.lastDate,
        nextPeriod: prediction.nextPeriodDate || storedCycleData.nextPeriod,
        ovulationDate: prediction.ovulationDate || storedCycleData.ovulationDate,
        fertileWindowStart: prediction.fertileWindowStart || storedCycleData.fertileWindowStart,
        fertileWindowEnd: prediction.fertileWindowEnd || storedCycleData.fertileWindowEnd,
        isApproximatePrediction: Boolean(prediction.isApproximatePrediction),
        cycleLength: prediction.averageCycleLength ? String(prediction.averageCycleLength) : storedCycleData.cycleLength,
        currentPhase: prediction.currentPhase || storedCycleData.currentPhase,
        currentDay: Number.isFinite(Number(prediction.currentDay)) ? Number(prediction.currentDay) : storedCycleData.currentDay,
        cycleCount: Number.isFinite(Number(prediction.cycleCount)) ? Number(prediction.cycleCount) : historyEntries.length,
        phaseMessage: prediction.phaseMessage || storedCycleData.phaseMessage,
        confidenceLevel: prediction.confidenceLevel || "",
      };

      saveCycleData(nextCycleData);
      setCycleData(nextCycleData);
      setApiError("");
    } catch (error) {
      if (error.message === "Invalid or expired token.") {
        clearAllUserData();
        navigate("/", { replace: true });
        return;
      }
      setApiError(error.message || "Unable to load latest prediction.");
    }
  }, [navigate]);

  const refreshCycleStatus = useCallback(async ({ allowPrompt = true } = {}) => {
    const token = getAuthToken();
    if (!token) {
      navigate("/", { replace: true });
      return;
    }

    try {
      const response = await getCycleStatus(token);
      const nextStatus = {
        periodStartDate: response?.status?.periodStartDate || null,
        periodEndDate: response?.status?.periodEndDate || null,
        isPeriodOngoing: Boolean(response?.status?.isPeriodOngoing),
      };
      const shouldPrompt = Boolean(
        response?.shouldPrompt && nextStatus.isPeriodOngoing && !nextStatus.periodEndDate
      );
      const answeredToday = lastPromptDate === getDateKey();

      setCycleStatus(nextStatus);

      if (allowPrompt) {
        setShowPeriodEndPrompt(shouldPrompt && !answeredToday);
      }
      if (!shouldPrompt) {
        setShowPeriodEndPrompt(false);
      }
    } catch (error) {
      if (error.message === "Invalid or expired token.") {
        clearAllUserData();
        navigate("/", { replace: true });
        return;
      }
      setShowPeriodEndPrompt(false);
    }
  }, [lastPromptDate, navigate]);

  useEffect(() => {
    const token = getAuthToken();
    const storedCycleData = readCycleData();
    const authUser = getAuthUser();

    if (!token) {
      navigate("/", { replace: true });
      return;
    }

    if (authUser?.name) {
      setDisplayName(authUser.name);
    }

    setCycleData(storedCycleData);

    async function loadMythOfDay() {
      const dateKey = getDateKey();
      const cachedMyth = readCachedMythOfDay(dateKey);

      if (cachedMyth) {
        setMythOfDay(cachedMyth);
        return;
      }

      try {
        const response = await getRandomMyth();
        const myth = response?.myth;
        if (myth && Number.isFinite(Number(myth.id))) {
          cacheMythOfDay(dateKey, myth);
          setMythOfDay(myth);
        }
      } catch {
        setApiError("Unable to fetch daily spark.");
      }
    }

    loadMythOfDay();
    refreshPrediction();
    refreshCycleStatus();
  }, [navigate, refreshPrediction, refreshCycleStatus]);

  // Formatted date string, e.g. "Tuesday · 12 May 2026"
  const formattedTodayDate = useMemo(() => {
    const now = new Date();
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return `${days[now.getDay()]} · ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
  }, []);

  // Phase details
  const phaseInfo = useMemo(() => {
    const rawPhase = String(cycleData.currentPhase || "Luteal").trim();
    const normalized = rawPhase.toLowerCase();

    if (normalized.includes("follicular")) {
      return {
        name: "Follicular",
        headline: "Feel into your follicular phase.",
        message: "Your energy is rising. Good time for momentum, new ideas, and social connection.",
        bgColor: "#F7EEF6",
      };
    }
    if (normalized.includes("ovulation")) {
      return {
        name: "Ovulation",
        headline: "Feel into your ovulation phase.",
        message: "Celebrate peak vitality, intuitive connection, and magnetic energy.",
        bgColor: "#EDF5EE",
      };
    }
    if (normalized.includes("menstrual")) {
      return {
        name: "Menstrual",
        headline: "Feel into your menstrual phase.",
        message: "Choose restorative rhythms, nourishing comfort, and softer expectations.",
        bgColor: "#FBECEE",
      };
    }
    // Default to Luteal
    return {
      name: "Luteal",
      headline: "Feel into your luteal phase.",
      message: "Choose steadier rhythms, nourishing comfort, and softer expectations.",
      bgColor: "#EDE4EE",
    };
  }, [cycleData.currentPhase]);

  // Metrics
  const currentDay = cycleData.currentDay || 25;
  const cycleLength = Number(cycleData.cycleLength) || 28;
  const daysUntilNextPeriod = calculateDaysUntil(cycleData.nextPeriod);
  const daysUntilOvulation = calculateDaysUntil(cycleData.ovulationDate);

  const nextPeriodText = useMemo(() => {
    if (daysUntilNextPeriod === null) return "In 15 days";
    if (daysUntilNextPeriod <= 0) return "Today";
    if (daysUntilNextPeriod === 1) return "Tomorrow";
    return `In ${daysUntilNextPeriod} days`;
  }, [daysUntilNextPeriod]);

  const ovulationText = useMemo(() => {
    if (daysUntilOvulation === null) return "Tomorrow";
    if (daysUntilOvulation === 0) return "Today";
    if (daysUntilOvulation === 1) return "Tomorrow";
    return `In ${daysUntilOvulation} days`;
  }, [daysUntilOvulation]);

  // Mini Calendar generation for the current month
  const miniCalendar = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const monthTitle = `${monthNames[currentMonth]} ${currentYear}`;

    // First day of current month
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sunday
    // Total days in month
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();

    const todayDate = now.getDate();

    // Determine period highlight dates (from prediction or fallback)
    const nextPeriodDate = parseDateOnly(cycleData.nextPeriod);
    const periodDays = new Set();
    if (nextPeriodDate && nextPeriodDate.getMonth() === currentMonth && nextPeriodDate.getFullYear() === currentYear) {
      const pDay = nextPeriodDate.getDate();
      for (let i = 0; i < 4; i++) {
        if (pDay + i <= totalDays) {
          periodDays.add(pDay + i);
        }
      }
    } else {
      // Fallback matching Emergent preview: highlights days 23, 24, 25
      periodDays.add(23);
      periodDays.add(24);
      periodDays.add(25);
    }

    const cells = [];
    // Blank padding cells before day 1
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push({ day: null, key: `empty-${i}` });
    }
    // Days 1 to totalDays
    for (let day = 1; day <= totalDays; day++) {
      cells.push({
        day,
        isToday: day === todayDate,
        isPeriodWindow: periodDays.has(day),
        key: `day-${day}`,
      });
    }

    return {
      title: monthTitle,
      cells,
    };
  }, [cycleData.nextPeriod]);

  // Period prompt actions
  function markPeriodPromptAnsweredToday() {
    const todayDateKey = getDateKey();
    setLastPromptDate(todayDateKey);
    saveLastPeriodPromptDate(todayDateKey);
  }

  async function handleConfirmPeriodEnded() {
    const token = getAuthToken();
    if (!token) {
      clearAllUserData();
      navigate("/", { replace: true });
      return;
    }

    setIsResolvingPeriodPrompt(true);
    setPeriodPromptError("");

    try {
      await markPeriodEnd(
        {
          period_start_date: cycleStatus.periodStartDate || undefined,
          period_end_date: getDateKey(),
        },
        token,
      );

      setShowPeriodEndPrompt(false);
      markPeriodPromptAnsweredToday();
      await Promise.all([refreshPrediction(), refreshCycleStatus({ allowPrompt: false })]);
    } catch (error) {
      setPeriodPromptError(error.message || "Unable to update period status.");
    } finally {
      setIsResolvingPeriodPrompt(false);
    }
  }

  function handleDismissPeriodPrompt() {
    setShowPeriodEndPrompt(false);
    setPeriodPromptError("");
    markPeriodPromptAnsweredToday();
  }

  return (
    <PageFrame className="emergent-page-frame">
      <div className="emergent-dashboard-container">
        {/* Period End Prompt Modal */}
        {showPeriodEndPrompt && (
          <div className="emergent-modal-backdrop" role="dialog" aria-modal="true">
            <div className="emergent-modal-card">
              <span className="emergent-modal-kicker">Cycle Check-In</span>
              <h3 className="emergent-modal-title">Has your period ended?</h3>
              <p className="emergent-modal-copy">
                Your period that started on {formatDisplayDate(cycleStatus.periodStartDate)} is still marked as ongoing.
              </p>
              {periodPromptError && <p className="field-error">{periodPromptError}</p>}
              <div className="emergent-modal-actions">
                <button
                  type="button"
                  className="emergent-btn-plum"
                  onClick={handleConfirmPeriodEnded}
                  disabled={isResolvingPeriodPrompt}
                >
                  {isResolvingPeriodPrompt ? "Updating..." : "Yes, mark it ended"}
                </button>
                <button
                  type="button"
                  className="emergent-btn-ghost"
                  onClick={handleDismissPeriodPrompt}
                  disabled={isResolvingPeriodPrompt}
                >
                  No, still ongoing
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 1. Header Row */}
        <section className="emergent-dashboard-header">
          <div className="emergent-header-left">
            <p className="emergent-date-kicker">{formattedTodayDate}</p>
            <h1 className="emergent-greeting-title">Good morning, {displayName}</h1>
          </div>
          <button
            type="button"
            className="emergent-btn-log-period"
            onClick={() => navigate("/cycle", { state: { openLogModal: true } })}
          >
            + Log period
          </button>
        </section>

        {apiError && <p className="field-error" style={{ marginBottom: 16 }}>{apiError}</p>}

        {/* 2. Today's Rhythm Hero Card */}
        <section className="emergent-rhythm-hero">
          <div className="emergent-rhythm-content">
            <span className="emergent-tiny-label">TODAY&apos;S RHYTHM</span>
            <h2 className="emergent-rhythm-heading">{phaseInfo.headline}</h2>
            <p className="emergent-rhythm-description">
              {cycleData.phaseMessage || phaseInfo.message}
            </p>
          </div>
          <div className="emergent-day-circle">
            <span className="emergent-day-label">DAY</span>
            <span className="emergent-day-number">{currentDay}</span>
            <span className="emergent-day-sub">of {cycleLength}</span>
          </div>
        </section>

        {/* 3. Four Metric Cards Row */}
        <section className="emergent-metric-cards-grid">
          {/* Card 1: Current phase */}
          <article className="emergent-metric-card phase-tint">
            <span className="emergent-metric-icon sparkle">
              <SparkleIcon />
            </span>
            <p className="emergent-metric-subtitle">Current phase</p>
            <h3 className="emergent-metric-value">{phaseInfo.name}</h3>
            <p className="emergent-metric-caption">Your body&apos;s current chapter</p>
          </article>

          {/* Card 2: Cycle day */}
          <article className="emergent-metric-card neutral-tint">
            <span className="emergent-metric-icon pulse">
              <PulseIcon />
            </span>
            <p className="emergent-metric-subtitle">Cycle day</p>
            <h3 className="emergent-metric-value">Day {currentDay}</h3>
            <p className="emergent-metric-caption">of {cycleLength}</p>
          </article>

          {/* Card 3: Next period */}
          <article className="emergent-metric-card yellow-tint">
            <span className="emergent-metric-icon calendar">
              <CalendarMiniIcon />
            </span>
            <p className="emergent-metric-subtitle">Next period</p>
            <h3 className="emergent-metric-value">{nextPeriodText}</h3>
            <p className="emergent-metric-caption">{cycleData.nextPeriod || "2026-10-14"}</p>
          </article>

          {/* Card 4: Ovulation window */}
          <article className="emergent-metric-card sage-tint">
            <span className="emergent-metric-icon heart">
              <HeartMiniIcon />
            </span>
            <p className="emergent-metric-subtitle">Ovulation window</p>
            <h3 className="emergent-metric-value">{ovulationText}</h3>
            <p className="emergent-metric-caption">{cycleData.ovulationDate || "2026-10-28"}</p>
          </article>
        </section>

        {/* 4. Middle Row (Cycle Forecast & Daily Learning Spark) */}
        <section className="emergent-two-col-grid">
          {/* Left: Cycle Forecast */}
          <article className="emergent-content-card">
            <div className="emergent-card-header-row">
              <span className="emergent-tiny-label">CYCLE FORECAST</span>
              <span className="emergent-approx-badge">
                {cycleData.isApproximatePrediction ? "Approximate" : "Approximate"}
              </span>
            </div>
            <h3 className="emergent-card-title">Your month, at a glance</h3>

            <div className="emergent-forecast-timeline">
              <div className="emergent-timeline-labels">
                <div className="emergent-timeline-col">
                  <span className="emergent-timeline-sub">Today</span>
                  <span className="emergent-timeline-num">{currentDay}</span>
                </div>
                <div className="emergent-timeline-col right">
                  <span className="emergent-timeline-sub">Period</span>
                  <span className="emergent-timeline-num">{cycleLength}</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="emergent-progress-track">
                <div
                  className="emergent-progress-fill"
                  style={{
                    width: `${Math.min(100, Math.max(8, Math.round((currentDay / cycleLength) * 100)))}%`,
                  }}
                />
              </div>

              {/* Legend */}
              <div className="emergent-timeline-legend">
                <div className="emergent-legend-items">
                  <span className="emergent-legend-item">
                    <span className="legend-dot pink" /> Logged period
                  </span>
                  <span className="emergent-legend-item">
                    <span className="legend-dot yellow" /> Predicted window
                  </span>
                </div>
                <span className="emergent-legend-note">Improves as you log more cycles</span>
              </div>
            </div>
          </article>

          {/* Right: Daily Learning Spark */}
          <article className="emergent-content-card spark-card">
            <span className="emergent-tiny-label spark-label">DAILY LEARNING SPARK</span>
            <blockquote className="emergent-spark-quote">
              &ldquo;{mythOfDay?.myth || "You should avoid exercise during your period."}&rdquo;
            </blockquote>

            <div className="emergent-spark-fact">
              <span className="emergent-fact-check">&#10003; Verified fact:</span>
              <span className="emergent-fact-copy">
                {" "}{mythOfDay?.fact || "Gentle to moderate movement can ease cramps and support mood."}
              </span>
            </div>

            <p className="emergent-spark-meta">
              {mythOfDay?.category || "Exercise"} &middot; {formatSourceLabel(mythOfDay?.source)}
            </p>
          </article>
        </section>

        {/* 5. Bottom Row (Your Guidance & Calendar) */}
        <section className="emergent-two-col-grid" style={{ marginTop: 22 }}>
          {/* Left: Your Guidance */}
          <article className="emergent-content-card guidance-card">
            <div className="emergent-guidance-header">
              <div>
                <span className="emergent-tiny-label">YOUR GUIDANCE</span>
                <h3 className="emergent-card-title">A little care for today</h3>
              </div>
              <span className="emergent-guidance-sparkle" aria-hidden="true">&#10022;<sup>&#65291;</sup></span>
            </div>

            <div className="emergent-guidance-list">
              <div className="emergent-guidance-item">
                <span className="emergent-guidance-num">01</span>
                <p className="emergent-guidance-text">
                  <strong>Make room for momentum.</strong> Your follicular phase can be a generous time for creative tasks and strength workouts.
                </p>
              </div>

              <div className="emergent-guidance-divider" />

              <div className="emergent-guidance-item">
                <span className="emergent-guidance-num">02</span>
                <p className="emergent-guidance-text">
                  <strong>Pair iron with vitamin C.</strong> Try spinach with citrus, lentils with peppers, or seeds over a colorful bowl.
                </p>
              </div>

              <div className="emergent-guidance-divider" />

              <div className="emergent-guidance-item">
                <span className="emergent-guidance-num">03</span>
                <p className="emergent-guidance-text">
                  <strong>Check in, not out.</strong> A two-minute mood note can help you spot patterns over time.
                </p>
              </div>
            </div>
          </article>

          {/* Right: Mini Calendar */}
          <article className="emergent-content-card calendar-mini-card">
            <div className="emergent-calendar-header">
              <h3 className="emergent-card-title">{miniCalendar.title}</h3>
              <Link to="/cycle" className="emergent-calendar-link">
                Full calendar &gt;
              </Link>
            </div>

            <div className="emergent-mini-calendar-grid">
              <div className="emergent-day-header">S</div>
              <div className="emergent-day-header">M</div>
              <div className="emergent-day-header">T</div>
              <div className="emergent-day-header">W</div>
              <div className="emergent-day-header">T</div>
              <div className="emergent-day-header">F</div>
              <div className="emergent-day-header">S</div>

              {miniCalendar.cells.map((cell) => {
                if (!cell.day) {
                  return <div key={cell.key} className="emergent-mini-cell empty" />;
                }
                const cellClasses = [
                  "emergent-mini-cell",
                  cell.isToday ? "today" : "",
                  cell.isPeriodWindow ? "period-window" : "",
                ]
                  .filter(Boolean)
                  .join(" ");

                return (
                  <div
                    key={cell.key}
                    className={cellClasses}
                    onClick={() => navigate("/cycle")}
                    title={`Day ${cell.day}`}
                  >
                    <span>{cell.day}</span>
                  </div>
                );
              })}
            </div>
          </article>
        </section>
      </div>
    </PageFrame>
  );
}
