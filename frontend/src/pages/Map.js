import { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "../css/App.css";

// References to build map:
// https://ujjwaltiwari2.medium.com/a-guide-to-using-openstreetmap-with-react-70932389b8b1
// https://medevel.com/react-and-leaflet-js-tutorial/

// Marker PNG by Vecteezy.com https://www.vecteezy.com/png/17178337-location-map-marker-icon-symbol-on-transparent-background

const markerIcon = new L.Icon({
  iconUrl: require("../../src/images/placeholderMarker.png"),
  iconSize: [20, 20],
  iconAnchor: [10, 20], //[left/right, top/bottom]
  popupAnchor: [0, -26], //[left/right, top/bottom]
});

function Map() {
  const { token, user, logout } = useContext(AuthContext);
  const [facility, setFacility] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // initial load
  useEffect(() => {
    fetch("http://localhost:5000/api/facility")
      .then((res) => res.json())
      .then((data) => setFacility(data))
      .catch((err) => console.error("Error fetching facilities:", err));
  }, []);

  if (!facility) return <p>No facility found...</p>;

  const filteredFacilities = facility.filter((facility) => {
    return (facility.Name || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
  });

  return (
    <div>
      {/* Navigation Bar */}
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

      {/* Search */}
      <div style={{ marginBottom: "2rem" }}>
        <input
          type="text"
          placeholder="Search facilities..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: "0.75rem",
            width: "300px",
            borderRadius: "8px",
            border: "1px solid #eaeef2",
          }}
        />
        <button
          onClick={() => setSearchTerm("")}
          className="filter-btn"
          style={{ marginLeft: "1rem" }}
        >
          Clear
        </button>
      </div>

      <MapContainer center={[57, -100]} zoom={3} className="leaflet-container">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Display facility Markers */}
        {filteredFacilities.map((facility) => (
          <Marker
            key={facility.id}
            // NOTE LAT/LNG not working yet. USING RANDOM PLACEHOLDERS FOR NOW!
            position={[Math.random() * 50, Math.random() * -100]}
            icon={markerIcon}
          >
            <Popup>
              <Link
                to={`/facility/${facility._id}`}
                key={facility._id}
                className="nav-link"
              >
                {facility.Name}
              </Link>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default Map;
