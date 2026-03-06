import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
  });
  const navigate = useNavigate();

  // handle input changes for the controlled form
  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  // register
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
    <div>
      <h2 style={styles.title}>Sign Up</h2>
      <div className="auth-container" style={styles.container}>
        {/* LEFT COLUMN */}
        <div className="card" style={styles.cardLeft}>
          <h3 style={styles.title}>WELCOME!</h3>
          <p style={styles.text}>
            Register an account with us to gain access to personalized features
            like the Travel Journal to track your experiences, and the Bucket
            List to prepare for new ones!
          </p>
        </div>
        {/* RIGHT COLUMN */}
        <div className="card" style={styles.cardRight}>
          <form onSubmit={handleSubmit} className="form">
            <label>Username</label>
            <input
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="Choose a username"
            />
            <label>Email</label>
            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter an email"
            />
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Choose a password"
            />
            <button type="submit" style={styles.button}>
              Sign Up
            </button>
          </form>
          <p style={styles.footerText}>
            Already have an account?{" "}
            <span onClick={() => navigate("/login")} style={styles.link}>
              Login here
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#122A64",
  },
  cardLeft: {
    width: "100%",
    maxWidth: "400px",
    height: "300px",
    padding: "2rem",
    backgroundColor: "#122A64",
    borderRadius: "0",
    border: "solid white 1px",
  },
  cardRight: {
    width: "100%",
    maxWidth: "400px",
    height: "300px",
    padding: "2rem",
    backgroundColor: "white",
    borderRadius: "0",
    border: "solid white 1px",
  },
  title: {
    textAlign: "center",
    color: "white",
    backgroundColor: "#122A64",
  },
  button: {
    marginTop: "1rem",
    backgroundColor: "#122A64",
    color: "white",
    border: "none",
    padding: "10px",
    borderRadius: "4px",
    cursor: "pointer",
    width: "100%",
  },
  footerText: {
    marginTop: "1.5rem",
    textAlign: "center",
    fontSize: "0.9rem",
    color: "#666",
  },
  link: {
    color: "#122A64",
    cursor: "pointer",
    fontWeight: "bold",
    textDecoration: "underline",
  },
  text: { color: "white", textAlign: "center" },
};

export default Register;
