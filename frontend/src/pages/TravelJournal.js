import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import "../css/HeritageHub.css";

function TravelJournal() {
  const { token, user, logout, timeoutMsg } = useContext(AuthContext);
  const [visited, setVisited] = useState([]);
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetch("http://localhost:5001/api/users/me", {
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setVisited(
          data.user.visited.sort(
            (a, b) => new Date(b.visitedAt) - new Date(a.visitedAt)
          )
        );
        setStats(data.stats);
      });
  }, [token]);

  const grouped = (visited || []).reduce((acc, v) => {
    const date = new Date(v.visitedAt);
    const key = `${date.toLocaleString("default", {
      month: "long",
    })} ${date.getFullYear()}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(v);
    return acc;
  }, {});

  const removeVisited = async (facilityId) => {
    try {
      await fetch(`http://localhost:5001/api/users/visited/${facilityId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      });

      setVisited((prev) => prev.filter((v) => v.facility._id !== facilityId));
    } catch (err) {
      console.error("Failed to remove visited:", err);
    }
  };

  return (
    <div className="heritage-home-wrapper page-container">
      {/* Shared Navigation Bar */}
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
                  <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                  <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
                </svg>
              </div>
              <span className="logo-text">
                Heritage<span className="logo-accent">Hub</span>
              </span>
            </Link>
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
              {user && user.role === "admin" && (
                <Link to="/admin-dashboard" className="nav-link">
                  Admin
                </Link>
              )}
            </div>
          </div>
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

      <div className="lists-container">
        <header className="list-header">
          <h1 className="list-title">My Travel Journal</h1>
          <p className="list-subtitle">
            You have documented visits to {stats.visitedCount || 0} locations.
          </p>
        </header>

        {Object.keys(grouped).map((month) => (
          <div key={month} className="list-group">
            <h3 className="group-title">{month}</h3>
            <div className="facilities-grid">
              {grouped[month].map((v) => (
                <div
                  key={v.facility._id}
                  className="facility-card-home list-card"
                >
                  <div className="card-details">
                    <div className="card-meta">
                      <span className="card-category">
                        VISITED {new Date(v.visitedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="card-title">{v.facility.Name}</h3>
                    <p className="card-location">
                      {v.facility.City}, {v.facility.Province}
                    </p>

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
