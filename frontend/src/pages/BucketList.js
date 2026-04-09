import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import "../css/HeritageHub.css";

//display facilities users want to visit
function BucketList() {
  const { token, user, logout, timeoutMsg } = useContext(AuthContext);
  const [bucket, setBucket] = useState([]);
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
        //sort bucket list by newest first
        setBucket(
          data.user.bucketList.sort((a, b) => new Date(b._id) - new Date(a._id))
        );
        setStats(data.stats);
      });
  }, [token]);

  const remove = (id) => {
    fetch(`http://localhost:5001/api/users/bucket/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
    }).then(() => {
      setBucket(bucket.filter((facility) => facility._id !== id));
    });
  };

  //get provinces from bucket list for grouping
  const provinces = [...new Set(bucket.map((facility) => facility.Province))];

  //map province to its full name to replace shorthand
  const provinceMap = {
    ab: "Alberta",
    bc: "British Columbia",
    mb: "Manitoba",
    nb: "New Brunswick",
    nl: "Newfoundland and Labrador",
    ns: "Nova Scotia",
    nt: "Northwest Territories",
    nu: "Nunavut",
    on: "Ontario",
    pe: "Prince Edward Island",
    qc: "Quebec",
    sk: "Saskatchewan",
    yt: "Yukon",
  };

  //get full province name
  function getProvinceName(code) {
    return provinceMap[code] || code;
  }

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
              <Link to="/bucket-list" className="nav-link active">
                Bucket List
              </Link>
              <Link to="/travel-journal" className="nav-link">
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
            {/* Conditionaly display login/logout buttons based on if user has token */}
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
          <h1 className="list-title">My Bucket List</h1>
          <p className="list-subtitle">
            You have {stats.bucketCount || 0} locations saved for future
            travels.
          </p>
        </header>

        {/* group bucket list by province */}
        {provinces.map((prov) => (
          <div key={prov} className="list-group">
            <h3 className="group-title">{getProvinceName(prov)}</h3>
            <div className="facilities-grid">
              {bucket
                .filter((facility) => facility.Province === prov) //filter facilities by province
                .map((facility) => (
                  <div
                    key={facility._id}
                    className="facility-card-home list-card"
                  >
                    <div className="card-details">
                      <div className="card-meta">
                        <span className="card-category">SAVED SITE</span>
                      </div>
                      <h3 className="card-title">{facility.Name}</h3>
                      <p className="card-location">
                        {facility.City}, {getProvinceName(facility.Province)}
                      </p>

                      <div className="card-actions">
                        <Link
                          to={`/facility/${facility._id}`}
                          className="view-btn"
                        >
                          View Details
                        </Link>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            remove(facility._id);
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

export default BucketList;
