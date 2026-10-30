import React, { useState } from "react";

function EyeIcon({ visible }) {
  return visible ? (
    <svg
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 3l18 18" />
      <path d="M10.6 10.6a2 2 0 002.8 2.8" />
      <path d="M9.9 5.2A11.5 11.5 0 0112 5c5.5 0 9 7 9 7a15.8 15.8 0 01-3.1 3.8" />
      <path d="M6.2 6.2C3.8 7.8 2 12 2 12s3.5 7 10 7a10.8 10.8 0 004-.8" />
    </svg>
  ) : (
    <svg
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function Login({ onLogin, onRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      const users = JSON.parse(
        localStorage.getItem("securedeposit_users") || "[]"
      );

      const user = users.find(
        (item) =>
          item.email === email.trim().toLowerCase() &&
          item.password === password
      );

      if (!user) {
        setError("Invalid email or password.");
        return;
      }

      onLogin(user);
    } catch {
      setError("Unable to login. Please try again.");
    }
  }

  return (
    <div className="auth-container">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Welcome Back</h1>
        <p>Login to AICTE SecureDeposit Portal</p>

        {error && (
          <div className="auth-error" role="alert">
            {error}
          </div>
        )}

        <label htmlFor="login-email">Email Address</label>
        <input
          id="login-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          autoComplete="email"
          required
        />

        <label htmlFor="login-password">Password</label>

        <div className="password-field">
          <input
            id="login-password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            autoComplete="current-password"
            required
          />

          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword((previous) => !previous)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            title={showPassword ? "Hide password" : "Show password"}
          >
            <EyeIcon visible={showPassword} />
          </button>
        </div>

        <button type="submit" className="auth-button">
          Login
        </button>

        <p className="auth-switch">
          Don't have an account?{" "}
          <button type="button" onClick={onRegister}>
            Register
          </button>
        </p>
      </form>
    </div>
  );
}

export default Login;