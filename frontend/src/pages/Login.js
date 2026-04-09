import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "../css/Auth.css";
import loginImg from "../images/login-img.jpg";

// LOGIN PAGE - User Authentication
// Validates credentials and returns JWT token
// Token stored in Context API for persistent authentication

function Login() {
  // Form state for login credentials
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Access authentication context - login function stores JWT token
  const { login, token, user, logout, timeoutMsg } = useContext(AuthContext);
  const navigate = useNavigate();

  // Submit login credentials to backend API
  async function handleLogin(e) {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // Store JWT token in context and localStorage
        login(data.token); // Token decoded with jwt-decode to extract user info
        navigate("/"); // Redirect to home page
      } else {
        alert(data.message || "Login failed");
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="auth-page">
      {/* ========== SHARED NAVIGATION BAR ========== */}
      <nav className="navbar">
        {timeoutMsg && <div className="timeout">{timeoutMsg}</div>}
        <div className="nav-container">
          <div className="nav-left">
            <Link
              to="/"
              className="logo-link"
              onClick={() => window.scrollTo({ top: 0, behavior: "instant" })}
            >
              <div className="logo-icon">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M16.2 7.8l-2 6.3-6.4 2.1 2-6.3z" />
                </svg>
              </div>
              <span className="logo-text">
                Heritage<span className="logo-accent">Hub</span>
              </span>
            </Link>
            <div className="nav-links">
              <Link
                to="/"
                className="nav-link"
                onClick={() => window.scrollTo({ top: 0, behavior: "instant" })}
              >
                Explore
              </Link>
              <Link
                to="/Map"
                className="nav-link"
                onClick={() => window.scrollTo({ top: 0, behavior: "instant" })}
              >
                Map View
              </Link>
              <Link
                to="/bucket-list"
                className="nav-link"
                onClick={() => window.scrollTo({ top: 0, behavior: "instant" })}
              >
                Bucket List
              </Link>
              <Link
                to="/travel-journal"
                className="nav-link"
                onClick={() => window.scrollTo({ top: 0, behavior: "instant" })}
              >
                Travel Journal
              </Link>
              <Link
                to="/dashboard"
                className="nav-link"
                onClick={() => window.scrollTo({ top: 0, behavior: "instant" })}
              >
                Manage
              </Link>
              {user && user.role === "admin" && (
                <Link
                  to="/admin-dashboard"
                  className="nav-link"
                  onClick={() =>
                    window.scrollTo({ top: 0, behavior: "instant" })
                  }
                >
                  Admin
                </Link>
              )}
            </div>
          </div>

          <div className="nav-right">
            {!token ? (
              <Link
                to="/login"
                className="sign-in-btn"
                onClick={() => window.scrollTo({ top: 0, behavior: "instant" })}
              >
                Sign In
              </Link>
            ) : (
              <div className="user-menu">
                <span className="user-greeting">
                  Hi, {user?.username || "User"}
                </span>
                <button onClick={logout} className="logout-btn">
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ========== LOGIN FORM WITH INSPIRATIONAL QUOTE ========== */}
      <div className="auth-container">
        <div className="auth-grid">
          {/* LEFT COLUMN: Login Form */}
          <div className="auth-form-container">
            <h1 className="auth-title">Welcome Back</h1>
            <p className="auth-subtitle">
              Sign in to access your digital passport and bucket list.
            </p>

            {/* Login form - validates credentials with backend */}
            <form onSubmit={handleLogin} className="auth-form">
              {/* Email input - unique identifier for user */}
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Password input - compared against bcrypt hash */}
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {/* Submit button - returns JWT on success */}
              <button type="submit" className="auth-button">
                Sign In →
              </button>
            </form>

            {/* Link to registration page for new users */}
            <p className="auth-footer">
              Don't have a passport yet?{" "}
              <Link
                to="/register"
                className="auth-link"
                onClick={() => window.scrollTo({ top: 0, behavior: "instant" })}
              >
                Create an account
              </Link>
            </p>
          </div>

          {/* RIGHT COLUMN: Inspirational Quote with Image */}
          <div className="auth-quote-container">
            <div className="quote-content">
              {/* Hero image for visual appeal */}
              <img src={loginImg} alt="HeritageHub" className="quote-image" />
              {/* Travel quote to inspire users */}
              <blockquote className="quote-text">
                "Traveling—it leaves you speechless, then turns you into a
                storyteller."
              </blockquote>
              <p className="quote-author">
                — Discover the unseen Canada with HeritageHub.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
