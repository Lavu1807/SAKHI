import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageFrame from "../../shared/components/PageFrame";
import { signupUser } from "../../shared/utils/api";

export default function Signup() {
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [apiSuccess, setApiSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validateSignup() {
    const nextErrors = {};
    const emailPattern = /^\S+@\S+\.\S+$/;

    if (!formValues.name.trim()) {
      nextErrors.name = "Please enter your name.";
    }

    if (!formValues.email.trim()) {
      nextErrors.email = "Please enter your email address.";
    } else if (!emailPattern.test(formValues.email.trim())) {
      nextErrors.email = "Please enter a valid email address.";
    }

    if (!formValues.password.trim()) {
      nextErrors.password = "Password cannot be empty.";
    } else if (formValues.password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters.";
    }

    return nextErrors;
  }

  function handleInputChange(event) {
    const { name, value } = event.target;

    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  }

  async function handleRegister(event) {
    event.preventDefault();

    const validationErrors = validateSignup();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setApiError("");
    setApiSuccess("");
    setIsSubmitting(true);

    try {
      const response = await signupUser({
        name: formValues.name.trim(),
        email: formValues.email.trim(),
        password: formValues.password,
      });

      setApiSuccess(response.message || "Account created! Redirecting to login...");
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 1200);
    } catch (error) {
      setApiError(error.message || "Unable to create account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <PageFrame className="emergent-login-frame">
      <div className="emergent-login-container">
        {/* Left Side: Brand & Visual Anchor */}
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
            <span className="emergent-tiny-label">WELCOME TO SAKHI</span>
            <h2 className="emergent-login-title">Create your account</h2>
            <p className="emergent-login-lead">
              A private space for your cycle, mood, and daily rituals.
            </p>

            <form onSubmit={handleRegister} className="emergent-login-form" noValidate>
              <div className="emergent-input-group">
                <label htmlFor="signup-name">Full name</label>
                <input
                  id="signup-name"
                  type="text"
                  name="name"
                  placeholder="Maya"
                  value={formValues.name}
                  onChange={handleInputChange}
                  className={errors.name ? "has-error" : ""}
                />
                {errors.name && <p className="field-error">{errors.name}</p>}
              </div>

              <div className="emergent-input-group">
                <label htmlFor="signup-email">Email address</label>
                <input
                  id="signup-email"
                  type="email"
                  name="email"
                  placeholder="maya@sakhi.demo"
                  value={formValues.email}
                  onChange={handleInputChange}
                  className={errors.email ? "has-error" : ""}
                />
                {errors.email && <p className="field-error">{errors.email}</p>}
              </div>

              <div className="emergent-input-group">
                <label htmlFor="signup-password">Password</label>
                <input
                  id="signup-password"
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={formValues.password}
                  onChange={handleInputChange}
                  className={errors.password ? "has-error" : ""}
                />
                {errors.password && <p className="field-error">{errors.password}</p>}
              </div>

              {apiError && (
                <div className="emergent-auth-banner error" style={{ margin: "8px 0 16px", padding: "12px 16px", borderRadius: "10px", background: "#fdebee", border: "1px solid #f9ccd1", color: "#8b3a4a", fontSize: "14px" }}>
                  {apiError}
                </div>
              )}
              {apiSuccess && (
                <div className="emergent-auth-banner success" style={{ margin: "8px 0 16px", padding: "12px 16px", borderRadius: "10px", background: "#eef7f0", border: "1px solid #c8e6d0", color: "#2b7044", fontSize: "14px" }}>
                  {apiSuccess}
                </div>
              )}

              <button
                type="submit"
                className="emergent-btn-login"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating account..." : "Create account >"}
              </button>

              <div className="emergent-login-footer" style={{ marginTop: 24 }}>
                <span>Already have an account? </span>
                <Link to="/" className="emergent-create-link">
                  Log in
                </Link>
              </div>
            </form>
          </div>
        </section>
      </div>
    </PageFrame>
  );
}
