import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageFrame from "../../shared/components/PageFrame";
import { loginUser } from "../../shared/utils/api";
import { saveAuthSession } from "../../shared/utils/auth";

export default function Login() {
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState({
    email: "maya@sakhi.demo",
    password: "sakhi2026",
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validateLogin() {
    const nextErrors = {};
    const emailPattern = /^\S+@\S+\.\S+$/;

    if (!formValues.email.trim()) {
      nextErrors.email = "Please enter your email address.";
    } else if (!emailPattern.test(formValues.email.trim())) {
      nextErrors.email = "Please enter a valid email address.";
    }

    if (!formValues.password.trim()) {
      nextErrors.password = "Password cannot be empty.";
    }

    return nextErrors;
  }

  function handleInputChange(event) {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  async function handleLogin(event) {
    event.preventDefault();

    const validationErrors = validateLogin();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setApiError("");
    setIsSubmitting(true);

    try {
      const response = await loginUser({
        email: formValues.email.trim(),
        password: formValues.password,
      });

      saveAuthSession({
        token: response.token,
        user: response.user,
      });

      navigate("/dashboard", { replace: true });
    } catch (error) {
      setApiError(error.message || "Unable to login. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <PageFrame className="emergent-login-frame">
      <div className="emergent-login-container">
        {/* Left Side: Brand & Emotional Anchor */}
        <section className="emergent-login-left">
          <div className="emergent-login-brand">
            <div className="emergent-brand-icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
            <span className="emergent-brand-text">SAKHI</span>
          </div>

          {/* Central concentric ring illustration */}
          <div className="emergent-login-graphic" aria-hidden="true">
            <div className="graphic-ring outer" />
            <div className="graphic-ring middle" />
            <div className="graphic-ring center-circle">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#795b82" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
          </div>

          <div className="emergent-login-copy">
            <p className="emergent-tiny-label">A softer way to understand your cycle</p>
            <h1 className="emergent-login-headline">
              Come back to yourself, one day at a time.
            </h1>
            <p className="emergent-login-subcopy">
              Personalized support for your body, mood, nourishment, and everyday wellbeing.
            </p>
          </div>
        </section>

        {/* Right Side: Form */}
        <section className="emergent-login-right">
          <div className="emergent-login-card">
            <span className="emergent-tiny-label">GOOD TO SEE YOU</span>
            <h2 className="emergent-login-title">Your wellbeing, held gently.</h2>
            <p className="emergent-login-lead">
              Sign in to see your cycle essentials for today.
            </p>

            <form onSubmit={handleLogin} className="emergent-login-form" noValidate>
              <div className="emergent-input-group">
                <label htmlFor="login-email">Email address</label>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  value={formValues.email}
                  onChange={handleInputChange}
                  placeholder="maya@sakhi.demo"
                  className={errors.email ? "has-error" : ""}
                />
                {errors.email && <p className="field-error">{errors.email}</p>}
              </div>

              <div className="emergent-input-group">
                <label htmlFor="login-password">Password</label>
                <input
                  id="login-password"
                  name="password"
                  type="password"
                  value={formValues.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className={errors.password ? "has-error" : ""}
                />
                {errors.password && <p className="field-error">{errors.password}</p>}
              </div>

              {apiError && <p className="field-error" style={{ margin: "4px 0 12px" }}>{apiError}</p>}

              <button
                type="submit"
                className="emergent-btn-login"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Signing in..." : "Log in"}
              </button>

              <div className="emergent-login-aux-row">
                <Link to="/forgot-password" className="emergent-aux-link">
                  Forgot password?
                </Link>
                <span className="emergent-demo-hint">
                  Demo: maya@sakhi.demo / sakhi2026
                </span>
              </div>

              <div className="emergent-login-footer">
                <span>New to SAKHI? </span>
                <Link to="/signup" className="emergent-create-link">
                  Create an account
                </Link>
              </div>
            </form>
          </div>
        </section>
      </div>
    </PageFrame>
  );
}
