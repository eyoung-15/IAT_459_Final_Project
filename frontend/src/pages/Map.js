import { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "../css/App.css";

// References to build map:
// https://ujjwaltiwari2.medium.com/a-guide-to-using-openstreetmap-with-react-70932389b8b1
// https://medevel.com/react-and-leaflet-js-tutorial/
// https://stackoverflow.com/questions/57240177/an-example-of-using-the-react-leaflet-new-useleaflet-hook
// https://leafletjs.com/reference.html

const markerIcon = new L.Icon({
  iconUrl: require("../../src/images/marker.png"),
  iconSize: [24, 24],
  iconAnchor: [12, 24], //[left/right, top/bottom]
  popupAnchor: [0, -26], //[left/right, top/bottom]
});

function Map() {
  const { token, user, logout } = useContext(AuthContext);
  const [facility, setFacility] = useState(null);
  // const [searchTerm, setSearchTerm] = useState("");

  // Use leaflet's mapEvents to get map bounds, and only generate facilities within those boundaries
  function MapEvents({ setFacility }) {
    const map = useMapEvents({
      moveend: () => {
        const bounds = map.getBounds();

        const params = new URLSearchParams({
          north: bounds.getNorth(),
          south: bounds.getSouth(),
          east: bounds.getEast(),
          west: bounds.getWest(),
        });

        fetch(`http://localhost:5000/api/facility?${params}`)
          .then((res) => res.json())
          .then((data) => setFacility(data.data));
      },
    });

    return null;
  }

  // initial load
  useEffect(() => {
    fetch("http://localhost:5000/api/facility")
      .then((res) => res.json())
      .then((data) => setFacility(data.data))
      .catch((err) => console.error("Error fetching facilities:", err));
  }, []);

  if (!facility) return <p>No facility found...</p>;

  const filteredFacilities = facility.filter((facility) => {
    return (facility.Name || "").toLowerCase();
    // .includes(searchTerm.toLowerCase());
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
              <Link to="/bucket-list" className="nav-link">
                Bucket List
              </Link>
              <Link to="/travel-journal" className="nav-link">
                Travel Journal
              </Link>
              <Link to="/dashboard" className="nav-link">
                Manage
              </Link>
              {/* Nav link to admin panel. Only visible if user is present and role is admin */}
              {user && user.role === "admin" && (
                <Link to="/admin-dashboard" className="nav-link">
                  Admin
                </Link>
              )}
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
      {/* <div style={{ marginBottom: "2rem" }}>
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
      </div> */}

      <MapContainer center={[57, -100]} zoom={3} className="leaflet-container">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {/* Set viewable markers based on bounding box */}
        <MapEvents setFacility={setFacility} />

        {/* Disply facility markers to indicate where facilities are located on map based on lat/lng values */}
        {filteredFacilities.map((facility) =>
          // Display only if Lat/Lng are present
          facility.Latitude && facility.Longitude ? (
            <Marker
              key={facility.id}
              position={[facility.Latitude, facility.Longitude]}
              icon={markerIcon}
            >
              {/* On clicking a marker, display name that links to details pg */}
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
          ) : (
            ""
          ),
        )}
      </MapContainer>
    </div>
  );
}

export default Map;
