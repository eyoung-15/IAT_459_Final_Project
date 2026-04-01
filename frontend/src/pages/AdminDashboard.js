import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

function AdminDashboard() {
  const { token, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  //   Backup security - redirect user out if they aren't admin
  useEffect(() => {
    if (user?.role !== "admin") {
      navigate("/");
    }
  }, [user, navigate]);

  return (
    <div className="heritage-hub">
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-left">
            <Link to="/" className="logo">
              Heritage<span>Hub</span>
            </Link>
            <div className="nav-links">
              <Link to="/" className="nav-link active">
                Explore
              </Link>
              <Link to="/Map" className="nav-link">
                Map View
              </Link>
              <Link to="/" className="nav-link">
                Curated Lists
              </Link>
              <Link to="/dashboard" className="nav-link">
                Manage
              </Link>
            </div>
          </div>

          <div className="nav-right">
            {user && (
              <span className="user-greeting">Welcome, {user.username}!</span>
            )}
            <button onClick={logout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </nav>
      <p>Admin Panel..</p>
    </div>
  );
}
export default AdminDashboard;
