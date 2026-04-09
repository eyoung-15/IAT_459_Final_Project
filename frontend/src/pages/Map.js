import React, { useContext, useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  ZoomControl,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "../css/HeritageHub.css";

// MAP VIEW PAGE - Interactive Canadian Heritage Map
// Uses React Leaflet API with dynamic filtering
// Implements performance optimization with bounding box logic

// References for implementation:
// https://ujjwaltiwari2.medium.com/a-guide-to-using-openstreetmap-with-react-70932389b8b1
// https://medevel.com/react-and-leaflet-js-tutorial/

// Custom marker icon using imported image
const markerIcon = new L.Icon({
  iconUrl: require("../../src/images/marker.png"),
  iconSize: [24, 24],
  iconAnchor: [12, 24], // Anchor point: [horizontal offset, vertical offset]
  popupAnchor: [0, -26], // Where popup appears relative to icon
});

// MAP EVENTS HANDLER - Tracks zoom and pan changes
// Enables dynamic marker rendering based on visible area
function MapEventsHandler({ onBoundsChange, onZoomChange }) {
  const map = useMapEvents({
    // Fires when map stops moving
    moveend: () => {
      const bounds = map.getBounds(); // Get visible map area
      const zoom = map.getZoom(); // Get current zoom level
      onBoundsChange(bounds);
      onZoomChange(zoom);
    },
    // Fires when zoom animation ends
    zoomend: () => {
      const bounds = map.getBounds();
      const zoom = map.getZoom();
      onBoundsChange(bounds);
      onZoomChange(zoom);
    },
  });
  return null; // This component doesn't render anything
}

function Map() {
  // Access authentication context for conditional features
  const { token, user, logout, timeoutMsg } = useContext(AuthContext) || {};

  // State management for facilities and filters
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Map interaction state for performance optimization
  const [mapBounds, setMapBounds] = useState(null); // Currently visible map area
  const [currentZoom, setCurrentZoom] = useState(4); // Current zoom level (1-18)

  // Fetch ALL facilities once on initial load (client-side filtering for speed)
  useEffect(() => {
    setLoading(true);
    fetch("http://localhost:5001/api/facility?limit=5000")
      .then((res) => res.json())
      .then((data) => setFacilities(data.data || []))
      .catch((err) => console.error("Error fetching facilities:", err))
      .finally(() => setLoading(false));
  }, []);

  // Province code to full name mapping for search functionality
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

  // Convert province code to full name
  function getProvinceFullName(code) {
    if (!code) return "";
    return provinceMap[code.toLowerCase()] || code;
  }

  // CLIENT-SIDE FILTERING - Search across multiple fields
  const filteredFacilities = facilities.filter((facility) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true; // Show all if search is empty

    const provinceFullName = getProvinceFullName(
      facility.Province
    ).toLowerCase();

    // Search matches Name, City, Category, or Province
    return (
      (facility.Name || "").toLowerCase().includes(term) ||
      (facility.City || "").toLowerCase().includes(term) ||
      (facility.Category || "").toLowerCase().includes(term) ||
      (facility.Province || "").toLowerCase().includes(term) ||
      provinceFullName.includes(term)
    );
  });

  // PERFORMANCE OPTIMIZATION - Smart Marker Rendering
  // Shows fewer markers when zoomed out, more when zoomed in
  const getVisibleMarkers = () => {
    const isSearching = searchTerm.trim().length > 0;
    const isZoomedIn = currentZoom >= 6; // Threshold for detailed view

    // Show all filtered results within bounds when zoomed in or searching
    if (isSearching || isZoomedIn) {
      if (!mapBounds) return filteredFacilities;

      // Only show markers within the visible map area
      return filteredFacilities.filter((facility) => {
        if (!facility.Latitude || !facility.Longitude) return false;
        const latLng = L.latLng(facility.Latitude, facility.Longitude);
        return mapBounds.contains(latLng); // Check if marker is in viewport
      });
    }

    // When zoomed out: limit markers to prevent lag (sampling strategy)
    const sampleSize = 50; // Maximum markers when zoomed out

    if (filteredFacilities.length <= sampleSize) {
      return filteredFacilities;
    }

    // Evenly sample facilities across the dataset
    const step = Math.floor(filteredFacilities.length / sampleSize);
    return filteredFacilities
      .filter((_, index) => index % step === 0)
      .slice(0, sampleSize);
  };

  const visibleMarkers = getVisibleMarkers();

  return (
    <div className="heritage-hub-wrapper">
      {/* ========== SHARED NAVIGATION BAR ========== */}
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
                  <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10 Z" />
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
              {/* Active class indicates current page */}
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

      {/*  MAP LAYOUT: Sidebar + Interactive Map  */}
      <div className="map-layout">
        {/* ===== LEFT SIDEBAR: Search & List View ===== */}
        <aside className="map-sidebar">
          <div className="sidebar-header">
            <h1 className="sidebar-title">Explore Map</h1>

            {/* INSTANT SEARCH INPUT - Client-side filtering */}
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
            {/* Results count with helpful hint when zoomed out */}
            <h2 className="results-count">
              {filteredFacilities.length} Locations Found
              {currentZoom < 6 && searchTerm.trim().length === 0 && (
                <span
                  style={{
                    fontSize: "0.85rem",
                    color: "#6b8e78",
                    fontWeight: "normal",
                    marginLeft: "0.5rem",
                  }}
                >
                  (Zoom in to see more)
                </span>
              )}
            </h2>

            {/* Scrollable facility list */}
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
                    {/* Display user-submitted review image or fallback image */}
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

                        {/* Dynamic rating calculated from reviews */}
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

                      {/* Link to detailed facility page */}
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

        {/* ===== RIGHT SIDE: Interactive Leaflet Map ===== */}
        <main className="map-area">
          <MapContainer
            center={[57, -100]} // Centered on Canada
            zoom={4} // Initial zoom level
            className="leaflet-container"
            zoomControl={false} // We'll add custom zoom controls
          >
            {/* CartoDB light tile layer for clean map appearance */}
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              attribution="&copy; OpenStreetMap contributors &copy; CARTO"
            />

            {/* Custom zoom controls positioned top-right */}
            <ZoomControl position="topright" />

            {/* Track map interactions for performance optimization */}
            <MapEventsHandler
              onBoundsChange={setMapBounds}
              onZoomChange={setCurrentZoom}
            />

            {/* Render markers dynamically based on zoom and search */}
            {visibleMarkers.map((facility) =>
              facility.Latitude && facility.Longitude ? (
                <Marker
                  key={facility._id}
                  position={[facility.Latitude, facility.Longitude]}
                  icon={markerIcon}
                >
                  {/* Popup appears when marker is clicked */}
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
