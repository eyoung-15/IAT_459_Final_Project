import { jwtDecode } from "jwt-decode";
import { createContext, useEffect, useState } from "react";

// Context object for other components to use
export const AuthContext = createContext();

export function AuthProvider({ children }) {
  //   initialize token in localStorage
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [user, setUser] = useState(null);
  const [timeoutMsg, setTimeoutMsg] = useState("");

  // run when token changes (login/logout/upon load)
  useEffect(() => {
    if (token) {
      try {
        // Decode user data
        const decoded = jwtDecode(token);
        setUser(decoded);
      } catch (err) {
        console.error("Token is invalid or corrupted:", err);
        // Force logout if invalid token
        logout();
      }
    } else {
      setUser(null);
    }
  }, [token]);

  // Set token timer to logout user when token expires
  useEffect(() => {
    if (!token) return;

    try {
      const decoded = jwtDecode(token);

      // change expiration time to miliseconds to match date.now
      const expiration = decoded.exp * 1000;
      const timeout = expiration - Date.now();
      // Logout when timer is done
      if (timeout <= 0) {
        logout();
        return;
      }
      // Set warning time of 30 seconds before timeout
      const warning = timeout - 30000;
      let warningTimer = null;
      if (warning > 0) {
        warningTimer = setTimeout(() => {
          setTimeoutMsg(
            "Your session is about to expire. You will be logged out in 30 seconds.",
          );
        }, warning);
      } else {
        setTimeoutMsg("Your session is about to expire.");
      }

      const timer = setTimeout(() => {
        logout();
      }, timeout);

      // clear once done
      return () => {
        clearTimeout(timer);
        if (warningTimer) clearTimeout(warningTimer);
      };
    } catch (err) {
      console.error("Error setting logout timer:", err);
      logout();
    }
  }, [token]);

  //handle login and set token
  function login(newToken) {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    // Ensure timeoutMsg is empty upon login
    setTimeoutMsg("");
  }

  //handle logout and reset
  function logout() {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    // Ensure timeoutMsg is empty if user is not logged in
    setTimeoutMsg("");
  }

  return (
    // Return the token, user, and the functions (login/out)
    <AuthContext.Provider value={{ token, user, login, logout, timeoutMsg }}>
      {children}
    </AuthContext.Provider>
  );
}
