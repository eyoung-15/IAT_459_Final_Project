import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../css/Auth.css";

function Register() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
  });
  const navigate = useNavigate();

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Registration successful! Please log in.");
        navigate("/login");
      } else {
        alert(data.message || "Registration failed");
      }
    } catch (err) {
      console.error("Registration error:", err);
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
        <div className="auth-register-grid">
          {/* Left Column - Form */}
          <div className="auth-form-container">
            <h1 className="auth-title">Create Your Account</h1>
            <p className="auth-subtitle">
              Join HeritageHub to start your journey through Canada's cultural
              heritage.
            </p>

            <form onSubmit={handleSubmit} className="auth-form">
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

              <button type="submit" className="auth-button">
                Sign Up →
              </button>
            </form>

            <p className="auth-footer">
              Already have an account?{" "}
              <Link to="/login" className="auth-link">
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
