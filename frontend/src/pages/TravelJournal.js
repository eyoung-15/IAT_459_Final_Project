import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import "../css/HeritageHub.css";

// TRAVEL JOURNAL PAGE - Member-Only Feature
// Displays user's visited heritage sites grouped by month/year

function TravelJournal() {
  // Access authentication context for user data and JWT token
  const { token, user, logout, timeoutMsg } = useContext(AuthContext);

  // State for visited facilities list and user statistics
  const [visited, setVisited] = useState([]);
  const [stats, setStats] = useState({});

  // Fetch user data on mount - requires authentication
  useEffect(() => {
    fetch("http://localhost:5001/api/users/me", {
      headers: {
        "Content-Type": "application/json",
        Authorization: token, // JWT token for protected route
      },
    })
      .then((res) => res.json())
      .then((data) => {
        // Sort visited facilities by most recent first
        setVisited(
          data.user.visited.sort(
            (a, b) => new Date(b.visitedAt) - new Date(a.visitedAt)
          )
        );
        setStats(data.stats);
      });
  }, [token]);

  // Group facilities by month and year for organized timeline display
  const grouped = (visited || []).reduce((acc, v) => {
    const date = new Date(v.visitedAt);
    const key = `${date.toLocaleString("default", {
      month: "long",
    })} ${date.getFullYear()}`; // e.g., "December 2024"
    if (!acc[key]) acc[key] = []; // Initialize array if month doesn't exist
    acc[key].push(v); // Add facility to appropriate month
    return acc;
  }, {});

  // Remove facility from travel journal
  const removeVisited = async (facilityId) => {
    try {
      await fetch(`http://localhost:5001/api/users/visited/${facilityId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      });
      // Update UI immediately after successful deletion
      setVisited((prev) => prev.filter((v) => v.facility._id !== facilityId));
    } catch (err) {
      console.error("Failed to remove visited:", err);
    }
  };

  return (
    <div className="heritage-home-wrapper page-container">
      {/* ========== SHARED NAVIGATION BAR ========== */}
      {/* Consistent navigation across all pages with conditional rendering */}
      <nav className="navbar">
        {/* Session timeout warning message */}
        {timeoutMsg && <div className="timeout">{timeoutMsg}</div>}
        <div className="nav-container">
          <div className="nav-left">
            {/* Logo with heritage icon SVG */}
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
                  <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                  <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
                </svg>
              </div>
              <span className="logo-text">
                Heritage<span className="logo-accent">Hub</span>
              </span>
            </Link>
            {/* Main navigation links - "active" class highlights current page */}
            <div className="nav-links">
              <Link to="/" className="nav-link">
                Explore
              </Link>
              <Link to="/Map" className="nav-link">
                Map View
              </Link>
              <Link to="/bucket-list" className="nav-link">
                Bucket List
              </Link>
              <Link to="/travel-journal" className="nav-link active">
                Travel Journal
              </Link>
              <Link to="/dashboard" className="nav-link">
                Manage
              </Link>
              {/* Admin link only visible to users with admin role */}
              {user && user.role === "admin" && (
                <Link to="/admin-dashboard" className="nav-link">
                  Admin
                </Link>
              )}
            </div>
          </div>
          {/* Right side: Auth status - Sign In button OR user menu */}
          <div className="nav-right">
            {!token ? (
              <Link to="/login" className="sign-in-btn">
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

      {/* ========== TRAVEL JOURNAL CONTENT ========== */}
      <div className="lists-container">
        {/* Page header with visit count */}
        <header className="list-header">
          <h1 className="list-title">My Travel Journal</h1>
          <p className="list-subtitle">
            You have documented visits to {stats.visitedCount || 0} locations.
          </p>
        </header>

        {/* Group visited places by month for timeline effect */}
        {Object.keys(grouped).map((month) => (
          <div key={month} className="list-group">
            {/* Month/Year header (e.g., "December 2024") */}
            <h3 className="group-title">{month}</h3>
            {/* Grid of facility cards for this time period */}
            <div className="facilities-grid">
              {/* List all facilities visited in this month */}
              {grouped[month].map((v) => (
                <div
                  key={v.facility._id}
                  className="facility-card-home list-card"
                >
                  <div className="card-details">
                    <div className="card-meta">
                      {/* Display visit date */}
                      <span className="card-category">
                        VISITED {new Date(v.visitedAt).toLocaleDateString()}
                      </span>
                    </div>
                    {/* Facility name and location */}
                    <h3 className="card-title">{v.facility.Name}</h3>
                    <p className="card-location">
                      {v.facility.City}, {v.facility.Province}
                    </p>

                    {/* Action buttons: View details or Remove */}
                    <div className="card-actions">
                      <Link
                        to={`/facility/${v.facility._id}`}
                        className="view-btn"
                      >
                        View Details
                      </Link>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          removeVisited(v.facility._id);
                        }}
                        className="remove-btn"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TravelJournal;
