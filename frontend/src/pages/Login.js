import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "../css/Auth.css"; // This should work - Auth.css is in the same directory as Login.js
import loginImg from "../images/login-img.jpg";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        login(data.token);
        navigate("/");
      } else {
        alert(data.message || "Login failed");
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="auth-page">
      <nav className="auth-nav">
        <div className="nav-container">
          <Link to="/" className="logo">
            Heritage<span>Hub</span>
          </Link>
          <Link to="/" className="back-link">
            ← Back to Explore
          </Link>
        </div>
      </nav>

      <div className="auth-container">
        <div className="auth-grid">
          {/* Left Column - Form */}
          <div className="auth-form-container">
            <h1 className="auth-title">Welcome Back</h1>
            <p className="auth-subtitle">
              Sign in to access your digital passport and bucket list.
            </p>

            <form onSubmit={handleLogin} className="auth-form">
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

              <div className="form-options">
                <Link to="/forgot-password" className="forgot-link">
                  Forgot password?
                </Link>
              </div>

              <button type="submit" className="auth-button">
                Sign In →
              </button>
            </form>

            <p className="auth-footer">
              Don't have a passport yet?{" "}
              <Link to="/register" className="auth-link">
                Create an account
              </Link>
            </p>
          </div>

          {/* Right Column - Quote with Image */}
          <div className="auth-quote-container">
            <div className="quote-content">
              <img
                src={loginImg}
                alt="HeritageHub"
                className="quote-image"
              />
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
