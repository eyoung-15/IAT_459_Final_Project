import React, { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMapEvents,
  ZoomControl,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "../css/HeritageHub.css"; // Ensure this matches your CSS file path

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
  let timeout = null;

  // Fetch facilities based on map bounds (Original Logic Preserved)
  function MapEvents() {
    const map = useMapEvents({
      moveend: () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          const bounds = map.getBounds();
          const params = new URLSearchParams({
            north: bounds.getNorth(),
            south: bounds.getSouth(),
            east: bounds.getEast(),
            west: bounds.getWest(),
          });

          setLoading(true);
          fetch(`http://localhost:5001/api/facility?${params}`)
            .then((res) => res.json())
            .then((data) => setFacilities(data.data || []))
            .catch((err) => console.error("API failed", err))
            .finally(() => setLoading(false));
        }, 300);
      },
    });
    return null;
  }

  // Initial load
  useEffect(() => {
    setLoading(true);
    fetch("http://localhost:5001/api/facility")
      .then((res) => res.json())
      .then((data) => setFacilities(data.data || []))
      .catch((err) => console.error("Error fetching facilities:", err))
      .finally(() => setLoading(false));
  }, []);

  const filteredFacilities = facilities.filter(
    (facility) =>
      (facility.Name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (facility.Location || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (facility.Type || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="heritage-hub-wrapper">
      {/* Top Navigation */}
      <nav className="navbar">
        {timeoutMsg && <div className="timeout">{timeoutMsg}</div>}
        <div className="nav-container">
          <div className="nav-left">
            <Link
              to="/"
              className="logo-link"
              onClick={() => window.scrollTo({ top: 0 })}
            >
              <div className="logo-icon">
                {/* Replaced Lucide Leaf with inline SVG */}
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
            </div>
          </div>

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
      </nav>

      {/* Main Map Layout (Sidebar + Map) */}
      <div className="map-layout">
        {/* Left Sidebar */}
        <aside className="map-sidebar">
          <div className="sidebar-header">
            <h1 className="sidebar-title">Explore Map</h1>

            <div className="search-box">
              {/* Replaced Lucide Search with inline SVG */}
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
                placeholder="Search by name, city, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="filter-chips">
              <button className="chip filter-btn">Filters</button>
              <button className="chip active">All Types</button>
              <button className="chip outline">Museums</button>
              <button className="chip outline">Galleries</button>
            </div>
          </div>

          <div className="sidebar-content">
            <h2 className="results-count">
              {filteredFacilities.length} Locations Found
            </h2>

            <div className="facility-list">
              {filteredFacilities.map((facility) => (
                <div key={facility._id} className="facility-card">
                  {/* Using a placeholder if no image exists in DB */}
                  <img
                    src={
                      facility.Image ||
                      "https://images.unsplash.com/photo-1667903717735-d6c58672839f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400"
                    }
                    alt={facility.Name}
                    className="facility-img"
                  />
                  <div className="facility-info">
                    <div className="facility-meta">
                      <span className="facility-type">
                        {facility.Type || "HERITAGE SITE"}
                      </span>
                      <div className="facility-rating">
                        {/* Replaced Lucide Star with inline SVG */}
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
                        <span>{facility.Rating || "4.5"}</span>
                      </div>
                    </div>

                    <h3 className="facility-name">{facility.Name}</h3>
                    <p className="facility-location">
                      {facility.Location || "Canada"}
                    </p>

                    <Link
                      to={`/facility/${facility._id}`}
                      className="view-details-btn"
                      onClick={() => window.scrollTo({ top: 0 })}
                    >
                      View Details
                      {/* Replaced Lucide ChevronRight with inline SVG */}
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
              ))}
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

            <MapEvents />
            <ZoomControl position="topright" />

            {/* Restored Original Popup functionality with marker.png */}
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
