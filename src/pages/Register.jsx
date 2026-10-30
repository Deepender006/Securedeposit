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

function Register({ onRegister, onLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const users = JSON.parse(
        localStorage.getItem("securedeposit_users") || "[]"
      );

      const normalizedEmail = email.trim().toLowerCase();

      if (users.some((user) => user.email === normalizedEmail)) {
        setError("An account with this email already exists.");
        return;
      }

      const user = {
        name: name.trim(),
        email: normalizedEmail,
        password,
      };

      users.push(user);

      localStorage.setItem(
        "securedeposit_users",
        JSON.stringify(users)
      );

      onRegister(user);
    } catch {
      setError("Unable to register. Please try again.");
    }
  }

  return (
    <div className="auth-container">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Create Account</h1>
        <p>AICTE SecureDeposit Portal</p>

        {error && (
          <div className="auth-error" role="alert">
            {error}
          </div>
        )}

        <label htmlFor="register-name">Full Name</label>
        <input
          id="register-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your full name"
          autoComplete="name"
          required
        />

        <label htmlFor="register-email">Email Address</label>
        <input
          id="register-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          autoComplete="email"
          required
        />

        <label htmlFor="register-password">Password</label>

        <div className="password-field">
          <input
            id="register-password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            autoComplete="new-password"
            minLength={6}
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

        <label htmlFor="register-confirm-password">
          Confirm Password
        </label>

        <div className="password-field">
          <input
            id="register-confirm-password"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
            autoComplete="new-password"
            required
          />

          <button
            type="button"
            className="password-toggle"
            onClick={() =>
              setShowConfirmPassword((previous) => !previous)
            }
            aria-label={
              showConfirmPassword ? "Hide password" : "Show password"
            }
            title={showConfirmPassword ? "Hide password" : "Show password"}
          >
            <EyeIcon visible={showConfirmPassword} />
          </button>
        </div>

        <button type="submit" className="auth-button">
          Register
        </button>

        <p className="auth-switch">
          Already have an account?{" "}
          <button type="button" onClick={onLogin}>
            Login
          </button>
        </p>
      </form>
    </div>
  );
}

export default Register;