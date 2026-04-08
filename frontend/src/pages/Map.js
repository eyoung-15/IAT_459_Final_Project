import React, { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  ZoomControl,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "../css/HeritageHub.css";

// Restore your original marker image
const markerIcon = new L.Icon({
  iconUrl: require("../../src/images/marker.png"),
  iconSize: [24, 24],
  iconAnchor: [12, 24],
  popupAnchor: [0, -26],
});

function Map() {
  const { token, user, logout, timeoutMsg } = useContext(AuthContext) || {};
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Initial load: Fetch ALL facilities at once and keep them in memory
  useEffect(() => {
    setLoading(true);
    fetch("http://localhost:5001/api/facility?limit=5000")
      .then((res) => res.json())
      .then((data) => setFacilities(data.data || []))
      .catch((err) => console.error("Error fetching facilities:", err))
      .finally(() => setLoading(false));
  }, []);

  // Map province codes to full names for accurate search filtering
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

  function getProvinceFullName(code) {
    if (!code) return "";
    return provinceMap[code.toLowerCase()] || code;
  }

  // Improved Search filter applied to Name, City, Province (Code & Full Name), or Category
  const filteredFacilities = facilities.filter((facility) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true; // Show all if search is empty

    const provinceFullName = getProvinceFullName(
      facility.Province
    ).toLowerCase();

    return (
      (facility.Name || "").toLowerCase().includes(term) ||
      (facility.City || "").toLowerCase().includes(term) ||
      (facility.Category || "").toLowerCase().includes(term) ||
      (facility.Province || "").toLowerCase().includes(term) ||
      provinceFullName.includes(term)
    );
  });

  return (
    <div className="heritage-hub-wrapper">
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
              <Link to="/Map" className="nav-link active">
                Map View
              </Link>
              <Link to="/bucket-list" className="nav-link">
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

      {/* Main Map Layout (Sidebar + Map) */}
      <div className="map-layout">
        {/* Left Sidebar */}
        <aside className="map-sidebar">
          <div className="sidebar-header">
            <h1 className="sidebar-title">Explore Map</h1>

            {/* Clean Search Box */}
            <div className="search-box" style={{ marginBottom: 0 }}>
              <svg
                className="search-icon"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                type="text"
                placeholder="Search by name, city, or province..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="sidebar-content">
            <h2 className="results-count">
              {filteredFacilities.length} Locations Found
            </h2>

            <div className="facility-list">
              {loading ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "2rem",
                    color: "#6b8e78",
                  }}
                >
                  Loading map data...
                </div>
              ) : (
                filteredFacilities.map((facility) => (
                  <div key={facility._id} className="facility-card">
                    {/* Using user-submitted image or generic fallback */}
                    <img
                      src={
                        facility.lastReviewImage ||
                        "https://images.unsplash.com/photo-1667903717735-d6c58672839f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400"
                      }
                      alt={facility.Name}
                      className="facility-img"
                    />

                    <div className="facility-info">
                      <div className="facility-meta">
                        <span className="facility-type">
                          {facility.Category || "HERITAGE SITE"}
                        </span>

                        {/* Dynamic Review Rating */}
                        <div className="facility-rating">
                          <svg
                            className="star-icon"
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="#f59e0b"
                            stroke="#f59e0b"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                          <span>
                            {facility.avgRating && facility.avgRating > 0
                              ? Number(facility.avgRating).toFixed(1)
                              : "New"}
                          </span>
                        </div>
                      </div>

                      <h3 className="facility-name">{facility.Name}</h3>

                      <p className="facility-location">
                        {facility.City}
                        {facility.City && facility.Province ? ", " : ""}
                        {facility.Province?.toUpperCase()}
                      </p>

                      <Link
                        to={`/facility/${facility._id}`}
                        className="view-details-btn"
                        onClick={() =>
                          window.scrollTo({ top: 0, behavior: "instant" })
                        }
                      >
                        View Details
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="m9 18 6-6-6-6" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>

        {/* Right Map Area */}
        <main className="map-area">
          <MapContainer
            center={[57, -100]}
            zoom={4}
            className="leaflet-container"
            zoomControl={false}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              attribution="&copy; OpenStreetMap contributors &copy; CARTO"
            />

            <ZoomControl position="topright" />

            {/* Render all fetched locations */}
            {filteredFacilities.map((facility) =>
              facility.Latitude && facility.Longitude ? (
                <Marker
                  key={facility._id}
                  position={[facility.Latitude, facility.Longitude]}
                  icon={markerIcon}
                >
                  <Popup>
                    <Link
                      to={`/facility/${facility._id}`}
                      className="nav-link"
                      style={{ color: "#0d7451", fontWeight: "bold" }}
                    >
                      {facility.Name}
                    </Link>
                  </Popup>
                </Marker>
              ) : null
            )}
          </MapContainer>
        </main>
      </div>
    </div>
  );
}

export default Map;
