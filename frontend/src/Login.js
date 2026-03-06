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
    <div
      style={{
        padding: "50px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <h2 style={{ color: "#1b5e20", marginBottom: "20px" }}>
        Login to Plant Dashboard
      </h2>

      <form
        onSubmit={handleLogin}
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          maxWidth: "320px",
          gap: "15px",
        }}
      >
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            padding: "12px",
            fontSize: "1.1rem",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            padding: "12px",
            fontSize: "1.1rem",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
        />

        <button
          type="submit"
          style={{
            padding: "12px",
            fontSize: "1.1rem",
            backgroundColor: "#2e7d32",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Login
        </button>
      </form>
      <p style={{ marginTop: "20px" }}>
        Don't have an account?{" "}
        <Link to="/register" style={{ color: "#2e7d32", fontWeight: "bold" }}>
          Register here
        </Link>
      </p>
    </div>
  );
}

export default Login;
