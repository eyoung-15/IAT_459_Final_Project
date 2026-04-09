import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "../css/Auth.css";

// REGISTRATION PAGE - New User Sign-Up
// Creates new user account with bcrypt password hashing
// Default role: 'member' (can be upgraded to 'admin')

function Register() {
  // Form state for registration inputs
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
  });
  const navigate = useNavigate();

  // Access context for navigation bar rendering
  const { token, user, logout, timeoutMsg } = useContext(AuthContext);

  // Update form data on input change
  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  // Submit registration form to backend API
  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5001/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData), // Send username, email, password
      });

      const data = await res.json();
      if (res.ok) {
        alert("Registration successful! Please log in.");
        navigate("/login"); // Redirect to login page
      } else {
        alert(data.message || "Registration failed");
      }
    } catch (err) {
      console.error("Registration error:", err);
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

      {/* ========== REGISTRATION FORM ========== */}
      <div className="auth-container">
        <div className="auth-register-grid">
          {/* Form container with elegant styling */}
          <div className="auth-form-container">
            <h1 className="auth-title">Create Your Account</h1>
            <p className="auth-subtitle">
              Join HeritageHub to start your journey through Canada's cultural
              heritage.
            </p>

            {/* Registration form - sends data to /api/auth/register */}
            <form onSubmit={handleSubmit} className="auth-form">
              {/* Username input field */}
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  placeholder="Choose a username"
                />
              </div>

              {/* Email input field - used for login */}
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="name@example.com"
                />
              </div>

              {/* Password input - will be hashed with bcrypt on backend */}
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Create a password"
                />
              </div>

              {/* Submit button creates new user in MongoDB */}
              <button type="submit" className="auth-button">
                Sign Up →
              </button>
            </form>

            {/* Link to login page for existing users */}
            <p className="auth-footer">
              Already have an account?{" "}
              <Link
                to="/login"
                className="auth-link"
                onClick={() => window.scrollTo({ top: 0, behavior: "instant" })}
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
