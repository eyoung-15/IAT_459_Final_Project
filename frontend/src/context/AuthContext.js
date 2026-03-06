import { jwtDecode } from "jwt-decode";
import { createContext, useEffect, useState } from "react";

// Context object for other components to use
export const AuthContext = createContext();

export function AuthProvider({ children }) {
  //   initialize token in localStorage
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [user, setUser] = useState(null);

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

  //handle login and set token
  function login(newToken) {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  }

  //handle logout and reset
  function logout() {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  }

  return (
    // Return the token, user, and the functions (login/out)
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
