import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";

function Login() {
  //keep track of what user types into inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  //AuthContext login function
  const { login } = useContext(AuthContext);

  const navigate = useNavigate();

  //Submit handler
  async function handleLogin(e) {
    // prevent page refresh
    e.preventDefault();

    try {
      // send to backend
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      // if successful
      if (res.ok) {
        // pass token to context
        login(data.token);
        // redirect to home
        navigate("/Dashboard");
      } else {
        // if unsuccessful
        alert(data.message || "Login failed");
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div>
      <h2 style={styles.title}>Login</h2>
      <div className="auth-container" style={styles.container}>
        {/* LEFT COLUMN */}
        <div className="card" style={styles.cardLeft}>
          <h3 style={styles.title}>LOG IN TO YOUR ACCOUNT</h3>
          <p style={styles.text}>
            <p style={styles.footerText}>
              Don't have an account yet?{" "}
              <Link
                to="/register"
                style={{ color: "white", fontWeight: "bold" }}
              >
                Register here
              </Link>
            </p>
          </p>
        </div>
        {/* RIGHT COLUMN */}
        <div className="card" style={styles.cardRight}>
          <form onSubmit={handleLogin} className="form">
            <input
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit" style={styles.button}>
              Login
            </button>
          </form>
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
    color: "white",
  },
  link: {
    color: "#122A64",
    cursor: "pointer",
    fontWeight: "bold",
    textDecoration: "underline",
  },
  text: { color: "white", textAlign: "center" },
};

export default Login;
