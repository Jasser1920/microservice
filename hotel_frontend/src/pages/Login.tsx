import { useState } from "react";

import { loginWithKeycloak } from "../services/authService";
import { fetchCurrentUser } from "../services/userService";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await loginWithKeycloak(username, password);
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      // Fetch user info
      const user = await fetchCurrentUser(data.access_token);
      localStorage.setItem("user_info", JSON.stringify(user));
      // Redirect based on role
      if (user.role === "ADMIN") {
        window.location.href = "/admin";
      } else if (user.role === "MANAGER") {
        window.location.href = "/manager";
      } else if (user.role === "STAFF") {
        window.location.href = "/staff";
      } else {
        window.location.href = "/client";
      }
    } catch (err: any) {
      setError("Invalid credentials or server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.backgroundGradient}></div>

      <div style={styles.contentWrapper}>
        <div style={styles.loginCard}>
          {/* Logo/Branding */}
          <div style={styles.brandSection}>
            <div style={styles.logoCircle}>🏨</div>
            <h1 style={styles.brandTitle}>LuxeStay</h1>
            <p style={styles.brandSubtitle}>Hotel Management System</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formHeader}>
              <h2 style={styles.formTitle}>Welcome Back</h2>
              <p style={styles.formDescription}>
                Sign in to your account to continue
              </p>
            </div>

            {/* Username Field */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Username</label>
              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={styles.input}
                required
              />
            </div>

            {/* Password Field */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
                required
              />
            </div>

            {/* Remember & Forgot */}
            <div style={styles.formOptions}>
              <label style={styles.checkboxLabel}>
                <input type="checkbox" style={styles.checkbox} />
                <span>Remember me</span>
              </label>
              <a href="#" style={styles.forgotLink}>
                Forgot password?
              </a>
            </div>

            {/* Error Message */}
            {error && <div style={styles.errorMessage}>{error}</div>}

            {/* Submit Button */}
            <button
              type="submit"
              style={{
                ...styles.submitButton,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Footer */}
          <p style={styles.footerText}>
            Don't have an account?{" "}
            <a href="#" style={styles.signupLink}>
              Sign up
            </a>
          </p>
        </div>

        {/* Right Side - Decorative */}
        <div style={styles.decorativeSection}>
          <div style={styles.decorativeCard}>
            <div style={styles.decorativeIcon}>✨</div>
            <h3 style={styles.decorativeTitle}>Modern Management</h3>
            <p style={styles.decorativeText}>
              Streamline your hotel operations with our intuitive dashboard
            </p>
          </div>

          <div style={styles.decorativeCard}>
            <div style={styles.decorativeIcon}>📊</div>
            <h3 style={styles.decorativeTitle}>Real-time Analytics</h3>
            <p style={styles.decorativeText}>
              Track occupancy, revenue, and guest satisfaction instantly
            </p>
          </div>

          <div style={styles.decorativeCard}>
            <div style={styles.decorativeIcon}>🔒</div>
            <h3 style={styles.decorativeTitle}>Secure & Reliable</h3>
            <p style={styles.decorativeText}>
              Enterprise-grade security for your business data
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)",
    position: "relative" as const,
    overflow: "hidden" as const,
  },
  backgroundGradient: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)",
    pointerEvents: "none" as const,
  },
  contentWrapper: {
    display: "flex",
    width: "100%",
    maxWidth: "1200px",
    gap: "60px",
    padding: "40px 20px",
    alignItems: "center",
    position: "relative" as const,
    zIndex: 1,
  },
  loginCard: {
    flex: 1,
    background: "var(--white)",
    borderRadius: "16px",
    padding: "48px",
    boxShadow: "0 20px 60px rgba(30, 58, 138, 0.3)",
    minWidth: "320px",
    maxWidth: "420px",
  },
  brandSection: {
    textAlign: "center" as const,
    marginBottom: "36px",
  },
  logoCircle: {
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    background: "#DBEAFE",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "32px",
    margin: "0 auto 16px",
  },
  brandTitle: {
    fontSize: "28px",
    fontWeight: 700,
    color: "var(--text-primary)",
    margin: "0 0 4px 0",
  },
  brandSubtitle: {
    fontSize: "14px",
    color: "var(--text-secondary)",
    margin: 0,
  },
  form: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "20px",
  },
  formHeader: {
    marginBottom: "24px",
  },
  formTitle: {
    fontSize: "24px",
    fontWeight: 700,
    color: "var(--text-primary)",
    margin: "0 0 8px 0",
  },
  formDescription: {
    fontSize: "14px",
    color: "var(--text-secondary)",
    margin: 0,
  },
  formGroup: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "8px",
  },
  label: {
    fontSize: "14px",
    fontWeight: 600,
    color: "var(--text-primary)",
  },
  input: {
    padding: "12px 14px",
    border: "1px solid var(--border-color)",
    borderRadius: "8px",
    fontSize: "14px",
    fontFamily: "var(--sans)",
    transition: "all 0.2s ease",
    background: "var(--white)",
    color: "var(--text-primary)",
    boxSizing: "border-box" as const,
  },
  formOptions: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "13px",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    color: "var(--text-secondary)",
    cursor: "pointer",
  },
  checkbox: {
    width: "16px",
    height: "16px",
    cursor: "pointer",
    accentColor: "var(--primary-blue)",
  },
  forgotLink: {
    color: "var(--primary-blue)",
    textDecoration: "none",
    fontSize: "13px",
    fontWeight: 600,
    transition: "color 0.2s ease",
  },
  errorMessage: {
    padding: "12px",
    background: "rgba(239, 68, 68, 0.1)",
    border: "1px solid #EF4444",
    borderRadius: "8px",
    color: "#DC2626",
    fontSize: "13px",
    fontWeight: 500,
  },
  submitButton: {
    padding: "12px 16px",
    background: "var(--primary-blue)",
    color: "var(--white)",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  footerText: {
    textAlign: "center" as const,
    fontSize: "14px",
    color: "var(--text-secondary)",
    margin: "16px 0 0 0",
  },
  signupLink: {
    color: "var(--primary-blue)",
    textDecoration: "none",
    fontWeight: 600,
    transition: "color 0.2s ease",
  },
  decorativeSection: {
    flex: 1,
    display: "flex",
    flexDirection: "column" as const,
    gap: "24px",
    minWidth: "300px",
  },
  decorativeCard: {
    background: "rgba(255, 255, 255, 0.95)",
    borderRadius: "12px",
    padding: "24px",
    textAlign: "center" as const,
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
  },
  decorativeIcon: {
    fontSize: "32px",
    marginBottom: "12px",
  },
  decorativeTitle: {
    fontSize: "16px",
    fontWeight: 700,
    color: "var(--text-primary)",
    margin: "0 0 8px 0",
  },
  decorativeText: {
    fontSize: "13px",
    color: "var(--text-secondary)",
    margin: 0,
    lineHeight: "1.5",
  },
};
