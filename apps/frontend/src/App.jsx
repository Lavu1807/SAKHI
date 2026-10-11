import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { BrowserRouter, Link, Navigate, NavLink, Outlet, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import Chatbot from "./features/chatbot/Chatbot";
import CycleTracker from "./features/cycle/CycleTracker";
import Dashboard from "./features/dashboard/Dashboard";
import Education from "./features/education/Education";
import Login from "./features/auth/Login";
import ForgotPassword from "./features/auth/ForgotPassword";
import MoodTracker from "./features/mood/MoodTracker";
import Nutrition from "./features/nutrition/Nutrition";
import Signup from "./features/auth/Signup";
import Symptoms from "./features/symptoms/Symptoms";
import { clearAllUserData, getAuthToken, getAuthUser } from "./shared/utils/auth";

// SVG Icons matching the Emergent design precisely
function DashboardIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function CycleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function NutritionIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z" />
      <path d="M10 2c1 .5 2 2 2 5" />
    </svg>
  );
}

function ChatbotIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function ShieldCheckIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
}

const ESSENTIAL_NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: <DashboardIcon /> },
  { to: "/cycle", label: "Cycle tracker", icon: <CycleIcon /> },
  { to: "/nutrition", label: "Nutrition", icon: <NutritionIcon /> },
  { to: "/chatbot", label: "Chatbot", icon: <ChatbotIcon /> },
];

const MORE_NAV_ITEMS = [
  { to: "/symptoms", label: "Symptoms" },
  { to: "/mood", label: "Mood tracker" },
  { to: "/education", label: "Education" },
];

function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const navRef = useRef(null);
  const moreMenuRef = useRef(null);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [authUser, setAuthUser] = useState(getAuthUser());

  const isLoginRoute = location.pathname === "/";
  const isSignupRoute = location.pathname === "/signup";
  const isForgotPasswordRoute = location.pathname === "/forgot-password";
  const isAuthRoute = isLoginRoute || isSignupRoute || isForgotPasswordRoute;
  const isAuthenticated = Boolean(getAuthToken());

  useEffect(() => {
    setAuthUser(getAuthUser());
  }, [location.pathname]);

  const userName = useMemo(() => {
    return authUser?.name || "Maya";
  }, [authUser]);

  const userInitial = useMemo(() => {
    return (userName.charAt(0) || "M").toUpperCase();
  }, [userName]);

  const isMoreActive = useMemo(() => {
    return MORE_NAV_ITEMS.some((item) => location.pathname === item.to);
  }, [location.pathname]);

  function handleLogout() {
    clearAllUserData();
    navigate("/", { replace: true });
  }

  useEffect(() => {
    setIsMoreOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isMoreOpen) return undefined;

    function handleOutsideClick(event) {
      if (!moreMenuRef.current || moreMenuRef.current.contains(event.target)) {
        return;
      }
      setIsMoreOpen(false);
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isMoreOpen]);

  useEffect(() => {
    if (!navRef.current) return undefined;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        navRef.current,
        { y: -10, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.35, ease: "power2.out" }
      );
    }, navRef.current);

    return () => ctx.revert();
  }, [isAuthRoute]);

  return (
    <div className={`app-layout ${isLoginRoute ? "login-view" : ""}`}>
      <div className="app-content">
        {!isAuthRoute && (
          <header className="emergent-navbar-wrap">
            <nav ref={navRef} className="emergent-navbar" aria-label="Main navigation">
              {/* Left Brand */}
              <Link to="/dashboard" className="emergent-brand">
                <div className="emergent-brand-icon" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </div>
                <span className="emergent-brand-text">SAKHI</span>
              </Link>

              {/* Middle Navigation Links */}
              <div className="emergent-nav-links">
                {ESSENTIAL_NAV_ITEMS.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) => `emergent-nav-pill ${isActive ? "active" : ""}`}
                  >
                    <span className="emergent-nav-icon">{item.icon}</span>
                    <span>{item.label}</span>
                  </NavLink>
                ))}

                {/* More Dropdown */}
                <div className={`emergent-nav-dropdown ${isMoreOpen ? "open" : ""}`} ref={moreMenuRef}>
                  <button
                    type="button"
                    className={`emergent-nav-pill more-pill ${isMoreActive ? "active" : ""}`}
                    onClick={() => setIsMoreOpen((prev) => !prev)}
                    aria-haspopup="menu"
                    aria-expanded={isMoreOpen}
                  >
                    <span>More</span>
                    <ChevronRightIcon />
                  </button>

                  {isMoreOpen && (
                    <div className="emergent-dropdown-menu" role="menu">
                      {MORE_NAV_ITEMS.map((item) => (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          className={({ isActive }) => `emergent-dropdown-item ${isActive ? "active" : ""}`}
                          role="menuitem"
                          onClick={() => setIsMoreOpen(false)}
                        >
                          {item.label}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Profile & Logout */}
              {isAuthenticated ? (
                <div className="emergent-profile-wrap">
                  <div className="emergent-avatar" title={userName}>
                    {userInitial}
                  </div>
                  <span className="emergent-user-name">{userName}</span>
                  <button
                    type="button"
                    className="emergent-logout-btn"
                    onClick={handleLogout}
                    title="Log out"
                    aria-label="Log out"
                  >
                    <LogoutIcon />
                  </button>
                </div>
              ) : (
                <div className="emergent-profile-wrap">
                  <Link to="/" className="emergent-login-link">
                    Sign in
                  </Link>
                </div>
              )}
            </nav>
          </header>
        )}

        <main className={`route-stage ${isLoginRoute ? "login-route-stage" : ""}`}>
          <Outlet />
        </main>

        {/* Global Educational Disclaimer Floating Toast */}
        {!isAuthRoute && (
          <aside className="emergent-disclaimer-toast" aria-label="Medical disclaimer">
            <span className="emergent-disclaimer-icon">
              <ShieldCheckIcon />
            </span>
            <span className="emergent-disclaimer-text">
              Your health information stays yours. SAKHI is educational, not diagnostic.
            </span>
          </aside>
        )}
      </div>
    </div>
  );
}

function RequireAuth({ children }) {
  const location = useLocation();
  const token = getAuthToken();

  if (!token) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  return children;
}

function RedirectIfAuthenticated({ children }) {
  const token = getAuthToken();

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route
            path="/"
            element={
              <RedirectIfAuthenticated>
                <Login />
              </RedirectIfAuthenticated>
            }
          />
          <Route
            path="/signup"
            element={
              <RedirectIfAuthenticated>
                <Signup />
              </RedirectIfAuthenticated>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <RedirectIfAuthenticated>
                <ForgotPassword />
              </RedirectIfAuthenticated>
            }
          />
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/cycle"
            element={
              <RequireAuth>
                <CycleTracker />
              </RequireAuth>
            }
          />
          <Route
            path="/nutrition"
            element={
              <RequireAuth>
                <Nutrition />
              </RequireAuth>
            }
          />
          <Route
            path="/symptoms"
            element={
              <RequireAuth>
                <Symptoms />
              </RequireAuth>
            }
          />
          <Route
            path="/education"
            element={
              <RequireAuth>
                <Education />
              </RequireAuth>
            }
          />
          <Route
            path="/mood"
            element={
              <RequireAuth>
                <MoodTracker />
              </RequireAuth>
            }
          />
          <Route
            path="/chatbot"
            element={
              <RequireAuth>
                <Chatbot />
              </RequireAuth>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
