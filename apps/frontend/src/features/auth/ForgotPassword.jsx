import { useState } from "react";
import { Link } from "react-router-dom";
import PageFrame from "../../shared/components/PageFrame";
import { forgotPassword } from "../../shared/utils/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await forgotPassword({ email });
      setSuccessMessage(response.message || "Password reset link sent.");
    } catch (error) {
      setErrorMessage(error.message || "Failed to process request.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <PageFrame className="emergent-login-frame">
      <div className="emergent-login-container" style={{ gridTemplateColumns: "1fr" }}>
        <section className="emergent-login-right" style={{ minHeight: "100vh" }}>
          <div className="emergent-login-card">
            <span className="emergent-tiny-label">ACCOUNT RECOVERY</span>
            <h2 className="emergent-login-title">Reset your password</h2>
            <p className="emergent-login-lead">
              Enter your email and we will send you instructions to reset your password.
            </p>

            <form onSubmit={handleSubmit} className="emergent-login-form">
              <div className="emergent-input-group">
                <label htmlFor="reset-email">Email Address</label>
                <input
                  id="reset-email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  disabled={isLoading}
                />
              </div>

              {errorMessage && <p className="field-error" style={{ margin: "4px 0 12px" }}>{errorMessage}</p>}
              {successMessage && <p className="field-success" style={{ margin: "4px 0 12px", color: "#2b7044", fontWeight: 600 }}>{successMessage}</p>}

              <button
                type="submit"
                className="emergent-btn-login"
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </button>

              <div className="emergent-login-footer">
                <span>Remember your password? </span>
                <Link to="/" className="emergent-create-link">
                  Back to login
                </Link>
              </div>
            </form>
          </div>
        </section>
      </div>
    </PageFrame>
  );
}
